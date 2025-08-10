import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id: id as string },
        select: {
          djMode: true,
          autoPlay: true,
          songCooldownMinutes: true,
          qrValidityHours: true,
          votingEnabled: true,
          paymentEnabled: true,
          specialRequestsEnabled: true,
        }
      })

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' })
      }

      res.status(200).json(organization)
    } catch (error) {
      console.error('Get settings error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'PATCH') {
    try {
      // Verify organization token
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header' })
      }

      const token = authHeader.split(' ')[1]
      const payload = verifyToken(token)

      if (!payload || payload.organizationId !== id || payload.type !== 'ADMIN') {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const {
        djMode,
        autoPlay,
        songCooldownMinutes,
        qrValidityHours,
        votingEnabled,
        paymentEnabled,
        specialRequestsEnabled
      } = req.body

      const updatedOrganization = await prisma.organization.update({
        where: { id: id as string },
        data: {
          djMode,
          autoPlay,
          songCooldownMinutes,
          qrValidityHours,
          votingEnabled,
          paymentEnabled,
          specialRequestsEnabled,
        }
      })

      res.status(200).json({
        message: 'Settings updated successfully',
        settings: {
          djMode: updatedOrganization.djMode,
          autoPlay: updatedOrganization.autoPlay,
          songCooldownMinutes: updatedOrganization.songCooldownMinutes,
          qrValidityHours: updatedOrganization.qrValidityHours,
          votingEnabled: updatedOrganization.votingEnabled,
          paymentEnabled: updatedOrganization.paymentEnabled,
          specialRequestsEnabled: updatedOrganization.specialRequestsEnabled,
        }
      })
    } catch (error) {
      console.error('Update settings error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}