// /app/api/get-current-user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const decoded = verifyToken(token)

  if (!decoded || (decoded.type !== 'USER' && decoded.type !== 'ADMIN')) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  return NextResponse.json({
    userId: decoded?.sessionId,
    organizationId: decoded.organizationId,
    role: decoded?.type,
  })
}
