import { NextRequest, NextResponse } from 'next/server'
import { searchCards, searchByNumber, searchByNameAndNumber, extractPriceUSD, extractPriceEUR } from '@/lib/pokemontcg'
import { generateScanJSON } from '@/lib/ollama'
import { insertScannedCard } from '@/lib/db'
import type { CardCondition, ScanResult } from '@/types/card'

const VALID_CONDITIONS: CardCondition[] = ['NM', 'LP', 'MP', 'HP', 'DMG']

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const hasName = typeof b?.name === 'string' && (b.name as string).trim() !== ''
  const hasCardNumber = typeof b?.cardNumber === 'string' && (b.cardNumber as string).trim() !== ''

  if (
    typeof body !== 'object' ||
    body === null ||
    (!hasName && !hasCardNumber) ||
    !(VALID_CONDITIONS as string[]).includes(String(b?.condition))
  ) {
    return NextResponse.json(
      { error: 'Required: name or cardNumber (string), condition (NM|LP|MP|HP|DMG)' },
      { status: 400 }
    )
  }

  const { name = '', setId, condition, cardNumber, totalInSet } = body as {
    name?: string
    setId?: string
    condition: CardCondition
    cardNumber?: string
    totalInSet?: number
  }

  const displayName = name.trim() || cardNumber!.trim()

  try {
    // Recherche : numéro en priorité (indépendant de la langue), puis nom
    let cards: Awaited<ReturnType<typeof searchCards>> = []

    if (cardNumber?.trim()) {
      const num = cardNumber.trim()
      // Essai 1 : numéro + total_in_set
      if (totalInSet) {
        cards = await searchByNumber(num, null, totalInSet)
        if (cards.length > 0) console.log(`[scan/manual] Trouvé (n°+total) : ${cards[0].name}`)
      }
      // Essai 2 : numéro seul (tous sets)
      if (cards.length === 0) {
        cards = await searchByNumber(num, null, null)
        if (cards.length > 0) console.log(`[scan/manual] Trouvé (n° seul) : ${cards[0].name}`)
      }
    }

    // Fallback nom si aucun résultat par numéro
    if (cards.length === 0 && name.trim()) {
      cards = cardNumber?.trim()
        ? await searchByNameAndNumber(name.trim(), cardNumber.trim())
        : await searchCards(name.trim(), setId)
      if (cards.length > 0) console.log(`[scan/manual] Trouvé par nom "${name}" : ${cards[0].name}`)
    }

    const rawCard = cards[0] ?? null

    const priceUSD = rawCard ? extractPriceUSD(rawCard) : null
    const priceEUR = rawCard ? extractPriceEUR(rawCard) : null
    const setName = rawCard?.set.name ?? setId ?? 'Unknown'
    const imageUrl = rawCard?.images.small ?? null

    const source = rawCard
      ? priceUSD !== null
        ? 'pokemontcg.io/tcgplayer'
        : priceEUR !== null
          ? 'pokemontcg.io/cardmarket'
          : 'pokemontcg.io (no price)'
      : 'not found'

    const scan = await generateScanJSON({
      name: displayName,
      set: setName,
      condition,
      priceUSD,
      priceEUR,
      source,
    })

    const card = insertScannedCard({
      name: displayName,
      set_id: rawCard?.set.id ?? setId ?? 'unknown',
      condition,
      price_usd: typeof scan.price_usd === 'number' ? scan.price_usd : null,
      price_eur: typeof scan.price_eur === 'number' ? scan.price_eur : null,
      image_url: imageUrl,
      source: scan.source,
      confidence: scan.confidence,
      notes: scan.notes || null,
    })

    const result: ScanResult = { card, scan, raw_card: rawCard }
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/scan]', err)
    return NextResponse.json(
      { error: 'Service unavailable', detail: String(err) },
      { status: 503 }
    )
  }
}
