import { NextRequest, NextResponse } from 'next/server'
import { getScannedCards } from '@/lib/db'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  try {
    const { cards, total } = getScannedCards({ search, page, limit })
    return NextResponse.json({ cards, total, page, limit })
  } catch (err) {
    console.error('[/api/cards]', err)
    return NextResponse.json(
      { error: 'Database error', detail: String(err) },
      { status: 500 }
    )
  }
}
