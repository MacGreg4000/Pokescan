import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }))

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  const token = process.env.ADMIN_SESSION_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'ADMIN_SESSION_TOKEN non configuré' }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('pokescan_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  })
  return res
}
