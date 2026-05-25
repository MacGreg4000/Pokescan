import { NextRequest, NextResponse } from 'next/server'
import { identifyCardFromImage } from '@/lib/vision'
import { searchByNameAndNumber, searchByNumber, extractPriceUSD, extractPriceEUR } from '@/lib/pokemontcg'
import { generateScanJSON } from '@/lib/ollama'
import { insertScannedCard } from '@/lib/db'
import type { CardCondition, ScanResult } from '@/types/card'

const VALID_CONDITIONS: CardCondition[] = ['NM', 'LP', 'MP', 'HP', 'DMG']

export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide (FormData attendu)' }, { status: 400 })
  }

  const imageFile = formData.get('image') as File | null
  const conditionRaw = String(formData.get('condition') ?? 'NM') as CardCondition
  const condition = VALID_CONDITIONS.includes(conditionRaw) ? conditionRaw : 'NM'

  if (!imageFile || imageFile.size === 0) {
    return NextResponse.json({ error: 'Fichier image manquant' }, { status: 400 })
  }

  try {
    // 1. Convertir l'image en base64
    const buffer = await imageFile.arrayBuffer()
    const imageBase64 = Buffer.from(buffer).toString('base64')

    // 2. Vision — identifier la carte
    const vision = await identifyCardFromImage(imageBase64)

    if (!vision.name || vision.name.trim() === '') {
      return NextResponse.json(
        {
          error: 'Carte non identifiée par le modèle de vision',
          detail: `Confiance: ${vision.confidence}. Vérifiez que la photo est nette et montre bien le recto de la carte.`,
          vision,
        },
        { status: 422 }
      )
    }

    const cardName = vision.name.trim()

    // 3. Recherche pokemontcg.io — stratégie en cascade
    let cards = await searchByNameAndNumber(cardName, vision.card_number)

    // Fallback : nom FR non reconnu → chercher par numéro + HP (très discriminant)
    if (cards.length === 0 && vision.card_number) {
      console.log(`[vision] Nom "${cardName}" non trouvé → fallback recherche par numéro ${vision.card_number}`)
      cards = await searchByNumber(vision.card_number, vision.hp)
    }

    const rawCard = cards[0] ?? null
    if (rawCard) {
      console.log(`[vision] Carte trouvée : ${rawCard.name} (${rawCard.set.name})`)
    } else {
      console.log(`[vision] Aucune carte trouvée pour "${cardName}" n°${vision.card_number}`)
    }

    const priceUSD = rawCard ? extractPriceUSD(rawCard) : null
    const priceEUR = rawCard ? extractPriceEUR(rawCard) : null
    const setName = rawCard?.set.name ?? 'Unknown'
    const imageUrl = rawCard?.images.small ?? null

    const source = rawCard
      ? priceUSD !== null
        ? 'pokemontcg.io/tcgplayer'
        : priceEUR !== null
          ? 'pokemontcg.io/cardmarket'
          : 'pokemontcg.io (no price)'
      : 'not found'

    // 4. Ollama formate le résultat
    const scan = await generateScanJSON({
      name: cardName,
      set: setName,
      condition,
      priceUSD,
      priceEUR,
      source,
    })

    // 5. Sauvegarde SQLite
    const card = insertScannedCard({
      name: cardName,
      set_id: rawCard?.set.id ?? 'unknown',
      condition,
      price_usd: typeof scan.price_usd === 'number' ? scan.price_usd : null,
      price_eur: typeof scan.price_eur === 'number' ? scan.price_eur : null,
      image_url: imageUrl,
      source: scan.source,
      confidence: scan.confidence,
      notes: scan.notes || null,
    })

    const result: ScanResult = { card, scan, raw_card: rawCard }
    return NextResponse.json({ ...result, vision })
  } catch (err) {
    console.error('[/api/scan/vision]', err)
    return NextResponse.json(
      { error: 'Service indisponible', detail: String(err) },
      { status: 503 }
    )
  }
}
