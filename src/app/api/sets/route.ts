import { NextResponse } from 'next/server'
import { getSets } from '@/lib/pokemontcg'
import { getSetsCache, getSetsCacheAge, upsertSetCache } from '@/lib/db'
import type { SetCache } from '@/types/card'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export async function GET(): Promise<NextResponse> {
  try {
    const oldest = getSetsCacheAge()
    const cacheValid =
      oldest !== null &&
      Date.now() - new Date(oldest).getTime() < CACHE_TTL_MS

    if (cacheValid) {
      return NextResponse.json(getSetsCache())
    }

    const sets = await getSets()
    const now = new Date().toISOString()
    const rows: SetCache[] = sets.map((s) => ({
      id: s.id,
      name: s.name,
      series: s.series,
      total: s.total,
      cached_at: now,
    }))

    upsertSetCache(rows)
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[/api/sets]', err)
    const cached = getSetsCache()
    if (cached.length > 0) return NextResponse.json(cached)
    return NextResponse.json(
      { error: 'Failed to fetch sets', detail: String(err) },
      { status: 503 }
    )
  }
}
