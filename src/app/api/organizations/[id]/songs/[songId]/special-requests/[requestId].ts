import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id, requestId } = req.query
  const { status } = req.body // 'APPROVED', 'COMPLETED', 'REJECTED'

  try {
    // Verify organization token (only DJ/organization can update status)
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)

    if (!payload || payload.organizationId !== id || payload.type !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Update request status
    const updatedRequest = await prisma.specialRequest.update({
      where: { id: requestId as string },
      data: { status: status as 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED' }
    })

    res.status(200).json({
      message: 'Request status updated successfully',
      request: updatedRequest
    })
  } catch (error) {
    console.error('Update request status error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}