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

    // 3. Recherche pokemontcg.io — priorité au numéro (objectif, indépendant de la langue)
    let cards: Awaited<ReturnType<typeof searchByNameAndNumber>> = []

    if (vision.card_number) {
      const cardNum = vision.card_number
      const totalInSet = vision.total_in_set ? Number(vision.total_in_set) || null : null

      // Essai 1 : numéro + total_in_set + HP
      cards = await searchByNumber(cardNum, vision.hp, totalInSet)
      if (cards.length > 0) {
        console.log(`[vision] Trouvé (n°+total+HP) : ${cards[0].name} (${cards[0].set.name})`)
      }

      // Essai 2 : total_in_set peut être halluciné → numéro + HP seul (tous sets)
      if (cards.length === 0 && totalInSet) {
        console.log(`[vision] Essai sans total_in_set (${totalInSet} potentiellement halluciné)`)
        cards = await searchByNumber(cardNum, vision.hp, null)
        if (cards.length > 0) {
          console.log(`[vision] Trouvé (n°+HP) : ${cards[0].name} (${cards[0].set.name})`)
        }
      }

      // Essai 3 : numéro + HP très tolérant (±100) — évite les faux positifs
      // Ex : Sandile (70 HP) ne peut pas matcher Charizard EX (330 HP), écart = 260 > 100
      if (cards.length === 0 && vision.hp) {
        console.log(`[vision] Essai numéro + HP tolérant (±100)`)
        cards = await searchByNumber(cardNum, vision.hp, null, 100)
        if (cards.length > 0) {
          console.log(`[vision] Trouvé (n°+HP±100) : ${cards[0].name} (${cards[0].set.name})`)
        }
      }
    }

    if (cards.length === 0) {
      // 2e choix : nom + numéro (cartes EN, ou si pas de numéro détecté)
      const numStr = vision.card_number != null ? String(vision.card_number) : null
      cards = await searchByNameAndNumber(cardName, numStr)
      if (cards.length > 0) {
        console.log(`[vision] Trouvé par nom "${cardName}" : ${cards[0].name} (${cards[0].set.name})`)
      } else {
        console.log(`[vision] Aucune carte trouvée pour "${cardName}" n°${vision.card_number}`)
      }
    }

    const rawCard = cards[0] ?? null

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
