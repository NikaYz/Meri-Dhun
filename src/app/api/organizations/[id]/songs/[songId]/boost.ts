import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id, songId } = req.query
  const { amount } = req.body // Payment amount in dollars

  try {
    // Verify user token
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)

    if (!payload || payload.organizationId !== id || payload.type !== 'USER' || !payload.sessionId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Check if user session is still valid
    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        validUntil: { gt: new Date() }
      }
    })

    if (!session) {
      return res.status(401).json({ message: 'Session expired' })
    }

    // Calculate boost points ($5 = 1 boost point)
    const boostPoints = Math.floor(amount / 5)

    // Create boost record
    await prisma.boost.create({
      data: {
        songId: songId as string,
        sessionId: session.id,
        amount,
        boostPoints
      }
    })

    // Update song boost count
    const updatedSong = await prisma.song.update({
      where: { id: songId as string },
      data: {
        paidBoosts: { increment: boostPoints }
      }
    })

    // Mark session as having paid
    await prisma.userSession.update({
      where: { id: session.id },
      data: { hasPaid: true }
    })

    res.status(200).json({
      message: 'Song boosted successfully',
      boostPoints,
      song: updatedSong
    })
  } catch (error) {
    console.error('Boost error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}