import { NextRequest, NextResponse } from 'next/server'
import { getScannedCardById, updateCard, deleteCard } from '@/lib/db'

function isAuth(req: NextRequest): boolean {
  const token = process.env.ADMIN_SESSION_TOKEN
  return !!token && req.cookies.get('pokescan_session')?.value === token
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const card = getScannedCardById(Number(id))
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(card)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const card = updateCard(Number(id), {
    condition: body.condition,
    notes: body.notes,
    for_sale: body.for_sale,
  })

  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(card)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const card = getScannedCardById(Number(id))
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  deleteCard(Number(id))
  return NextResponse.json({ ok: true })
}
