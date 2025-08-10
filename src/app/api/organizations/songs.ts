import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Get leaderboard
      const songs = await prisma.song.findMany({
        where: { organizationId: id as string },
        include: {
          votes: true,
          boosts: true,
        },
        orderBy: [
          { paidBoosts: 'desc' },
          { upvotes: 'desc' },
          { playCount: 'desc' },
        ]
      })

      const leaderboard = songs.map((song, index) => ({
        ...song,
        rank: index + 1,
        score: song.upvotes - song.downvotes + (song.paidBoosts * 10) + song.playCount,
        canPlay: !song.lastPlayed || 
          (Date.now() - new Date(song.lastPlayed).getTime()) > (20 * 60 * 1000) // 20 minutes cooldown
      }))

      res.status(200).json(leaderboard)
    } catch (error) {
      console.error('Get songs error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      // Verify token
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header' })
      }

      const token = authHeader.split(' ')[1]
      const payload = verifyToken(token)

      if (!payload || payload.organizationId !== id) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const { jiosaavnId, name, primaryArtists, image, duration, album, year, downloadUrl } = req.body

      // Check if song already exists for this organization
      const existingSong = await prisma.song.findFirst({
        where: {
          jiosaavnId,
          organizationId: id as string
        }
      })

      if (existingSong) {
        // Update play count and last played
        const updatedSong = await prisma.song.update({
          where: { id: existingSong.id },
          data: {
            playCount: { increment: 1 },
            lastPlayed: new Date(),
          }
        })

        // Create play history
        await prisma.playHistory.create({
          data: {
            organizationId: id as string,
            songId: existingSong.id,
            playedBy: payload.type === 'ADMIN' ? 'DJ' : 'System',
          }
        })

        return res.status(200).json(updatedSong)
      }

      // Create new song
      const song = await prisma.song.create({
        data: {
          jiosaavnId,
          name,
          primaryArtists,
          image,
          duration,
          album,
          year,
          downloadUrl,
          organizationId: id as string,
          playCount: 1,
          lastPlayed: new Date(),
          addedBy: payload.sessionId || payload.organizationId,
        }
      })

      // Create play history
      await prisma.playHistory.create({
        data: {
          organizationId: id as string,
          songId: song.id,
          playedBy: payload.type === 'ADMIN' ? 'DJ' : 'System',
        }
      })

      res.status(201).json(song)
    } catch (error) {
      console.error('Add song error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}