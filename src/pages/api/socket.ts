// File: src/pages/api/socket.ts

import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Socket as NetSocket } from 'net'

type NextApiResponseServerIO = NextApiResponse & {
  socket: NetSocket & {
    server: NetServer & {
      io?: ServerIO
    }
  }
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    //console.log('✅ Socket is already running')
  } else {
    //console.log('🚀 Initializing Socket.IO')
    const io = new ServerIO(res.socket.server, {
      path: '/api/socket',
    })
    res.socket.server.io = io

    io.on('connection', (socket) => {
      //console.log('🟢 Client connected:', socket.id)

      socket.on('join-organization', ({ organizationId}) => {
        const room = `org-${organizationId}`
        socket.join(room)
        //console.log(`📦 Socket ${socket.id} joined room ${room}`)
      })

      socket.on('get-user-count', async ({ organizationId }) => {
        const room = `org-${organizationId}`
        const sockets = await io.in(room).fetchSockets()
        socket.emit('user-count', { organizationId, count: sockets.length })
      })

      // Event broadcasts
      const events = ['song-played', 'song-voted', 'song-boosted', 'special-request', 'leaderboard-updated', 'now-playing-updated', 'skip-song', 'update-song']
      events.forEach(event =>
        socket.on(event, (data) => {
          //console.log(`📥 Received "${event}" from ${socket.id}:`, data);
          const room = `org-${data.organizationId}`;
          //console.log(`📡 Broadcasting "${event}" to room: ${room}`);
          socket.to(room).emit(event, data);
          //console.log(`📤 Emitting Server "${event}":`, data);
          //socket.to(`org-${data.organizationId}`).emit(event, data)
        })
      )

      socket.on('disconnect', () => {
        //console.log('🔴 Client disconnected:', socket.id)
      })
    })
  }

  res.end()
}
