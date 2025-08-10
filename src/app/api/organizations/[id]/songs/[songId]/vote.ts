// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma'
// import { VoteType } from '@prisma/client';

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { songId, sessionId, voteType } = body;
  
//   if (!songId || !sessionId || !voteType || !['UP', 'DOWN'].includes(voteType)) {
//     return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
//   }

//   try {
//     const existingVote = await prisma.vote.findUnique({
//       where: {
//         songId_sessionId: { songId, sessionId },
//       },
//     });

//     let status: 'created' | 'updated' | 'removed';

//     if (existingVote) {
//       if (existingVote.voteType === voteType) {
//         await prisma.vote.delete({
//           where: {
//             songId_sessionId: { songId, sessionId },
//           },
//         });
//         status = 'removed';
//       } else {
//         await prisma.vote.update({
//           where: {
//             songId_sessionId: { songId, sessionId },
//           },
//           data: { voteType: voteType as VoteType },
//         });
//         status = 'updated';
//       }
//     } else {
//       await prisma.vote.create({
//         data: {
//           songId,
//           sessionId,
//           voteType: voteType as VoteType,
//         },
//       });
//       status = 'created';
//     }

//     return NextResponse.json({ status });
//   } catch (err) {
//     console.error('Vote error:', err);
//     return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
//   }
// }

// // import { NextApiRequest, NextApiResponse } from 'next'
// // import { prisma } from '@/lib/prisma'
// // import { verifyToken } from '@/lib/auth'

// // export default async function handler(req: NextApiRequest, res: NextApiResponse) {
// //   if (req.method !== 'POST') {
// //     return res.status(405).json({ message: 'Method not allowed' })
// //   }

// //   const { id, songId } = req.query
// //   const { voteType } = req.body // 'UP' or 'DOWN'

// //   try {
// //     // Verify user token
// //     const authHeader = req.headers.authorization
// //     if (!authHeader) {
// //       return res.status(401).json({ message: 'No authorization header' })
// //     }

// //     const token = authHeader.split(' ')[1]
// //     const payload = verifyToken(token)

// //     if (!payload || payload.organizationId !== id || payload.type !== 'user' || !payload.sessionId) {
// //       return res.status(401).json({ message: 'Unauthorized' })
// //     }

// //     // Check if user session is still valid
// //     const session = await prisma.userSession.findFirst({
// //       where: {
// //         id: payload.sessionId,
// //         validUntil: { gt: new Date() }
// //       }
// //     })

// //     if (!session) {
// //       return res.status(401).json({ message: 'Session expired' })
// //     }

// //     // Check if user already voted for this song
// //     const existingVote = await prisma.vote.findUnique({
// //       where: {
// //         songId_sessionId: {
// //           songId: songId as string,
// //           sessionId: session.id
// //         }
// //       }
// //     })

// //     if (existingVote) {
// //       return res.status(400).json({ message: 'Already voted for this song' })
// //     }

// //     // Create vote
// //     await prisma.vote.create({
// //       data: {
// //         songId: songId as string,
// //         sessionId: session.id,
// //         voteType: voteType as 'UP' | 'DOWN'
// //       }
// //     })

// //     // Update song vote count
// //     const updateData = voteType === 'UP' 
// //       ? { upvotes: { increment: 1 } }
// //       : { downvotes: { increment: 1 } }

// //     const updatedSong = await prisma.song.update({
// //       where: { id: songId as string },
// //       data: updateData
// //     })

// //     res.status(200).json({
// //       message: 'Vote recorded successfully',
// //       song: updatedSong
// //     })
// //   } catch (error) {
// //     console.error('Vote error:', error)
// //     res.status(500).json({ message: 'Internal server error' })
// //   }
// // }