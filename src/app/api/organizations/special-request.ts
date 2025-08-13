import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Verify token (both organization and user can view)
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header' })
      }

      const token = authHeader.split(' ')[1]
      const payload = verifyToken(token)

      if (!payload || payload.organizationId !== id) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const requests = await prisma.specialRequest.findMany({
        where: { organizationId: id as string },
        orderBy: { timestamp: 'desc' }
      })

      res.status(200).json(requests)
    } catch (error) {
      console.error('Get special requests error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
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

      const { type, message, requestedBy, amount } = req.body

      // Create special request
      const request = await prisma.specialRequest.create({
        data: {
          organizationId: id as string,
          type: type as 'BIRTHDAY' | 'ANNIVERSARY' | 'DEDICATION' | 'CUSTOM',
          message,
          requestedBy,
          paid: true, // In real app, integrate with payment processor
          amount,
          fromRole: payload.type,
        }
      })

      res.status(201).json({
        message: 'Special request created successfully',
        request
      })
    } catch (error) {
      console.error('Create special request error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}