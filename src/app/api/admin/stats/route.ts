import { NextResponse } from 'next/server'
import { getAdminStats } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  try {
    const stats = getAdminStats()
    return NextResponse.json(stats)
  } catch (err) {
    console.error('[/api/admin/stats]', err)
    return NextResponse.json(
      { error: 'Database error', detail: String(err) },
      { status: 500 }
    )
  }
}
