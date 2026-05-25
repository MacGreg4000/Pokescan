import { NextRequest, NextResponse } from 'next/server'
import { searchCards, extractPriceUSD, extractPriceEUR } from '@/lib/pokemontcg'
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

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).name !== 'string' ||
    !(VALID_CONDITIONS as string[]).includes(
      String((body as Record<string, unknown>).condition)
    )
  ) {
    return NextResponse.json(
      { error: 'Required: name (string), condition (NM|LP|MP|HP|DMG)' },
      { status: 400 }
    )
  }

  const { name, setId, condition } = body as {
    name: string
    setId?: string
    condition: CardCondition
  }

  try {
    const cards = await searchCards(name, setId)
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
      name,
      set: setName,
      condition,
      priceUSD,
      priceEUR,
      source,
    })

    const card = insertScannedCard({
      name,
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
