import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ valid: false, message: 'Missing token' }, { status: 400 })
    }

    const decoded = verifyToken(token)

    if (!decoded || (decoded.type !== 'USER' && decoded.type !== 'ADMIN')) {
      return NextResponse.json({ valid: false, message: 'Invalid token' }, { status: 401 })
    }

    const session = await prisma.userSession.findFirst({
      where: {
        id: decoded.sessionId,
        organizationId: decoded.organizationId,
        validUntil: { gt: new Date() }
      }
    })

    if (!session) {
      return NextResponse.json({ valid: false, message: 'Session expired or invalid' }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      organizationId: decoded.organizationId,
    })
  } catch (err) {
    console.error('Token verification failed:', err)
    return NextResponse.json({ valid: false, message: 'Internal error' }, { status: 500 })
  }
}
