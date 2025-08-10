// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { VoteType } from '@prisma/client';

// export async function POST(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const orgid = searchParams.get('orgid');

//   if (!orgid) {
//     return NextResponse.json({ message: 'Missing organization ID' }, { status: 400 });
//   }

//   const body = await req.json();
//   const { orgSongId, sessionId, voteType } = body;

//   if (!orgSongId || !sessionId || !voteType || !['UP', 'DOWN'].includes(voteType)) {
//     return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
//   }

//   try {
//     const existingVote = await prisma.vote.findUnique({
//       where: {
//         orgSongId_sessionId: {
//           orgSongId,
//           sessionId,
//         },
//       },
//     });

//     let status: 'created' | 'updated' | 'removed';

//     if (existingVote) {
//       if (existingVote.voteType === voteType) {
//         // ➖ User removed their vote
//         await prisma.vote.delete({
//           where: {
//             orgSongId_sessionId: {
//               orgSongId,
//               sessionId,
//             },
//           },
//         });

//         // Update the OrgSong vote counts
//         await prisma.orgSong.update({
//           where: { id: orgSongId },
//           data: {
//             upvotes: voteType === 'UP' ? { decrement: 1 } : undefined,
//             downvotes: voteType === 'DOWN' ? { decrement: 1 } : undefined,
//           },
//         });

//         status = 'removed';
//       } else {
//         // 🔁 User changed vote (UP <-> DOWN)
//         await prisma.vote.update({
//           where: {
//             orgSongId_sessionId: {
//               orgSongId,
//               sessionId,
//             },
//           },
//           data: { voteType: voteType as VoteType },
//         });

//         await prisma.orgSong.update({
//           where: { id: orgSongId },
//           data: {
//             upvotes: voteType === 'UP' ? { increment: 1 } : { decrement: 1 },
//             downvotes: voteType === 'DOWN' ? { increment: 1 } : { decrement: 1 },
//           },
//         });

//         status = 'updated';
//       }
//     } else {
//       // ➕ New vote
//       await prisma.vote.create({
//         data: {
//           orgSongId,
//           sessionId,
//           voteType: voteType as VoteType,
//         },
//       });

//       await prisma.orgSong.update({
//         where: { id: orgSongId },
//         data: {
//           upvotes: voteType === 'UP' ? { increment: 1 } : undefined,
//           downvotes: voteType === 'DOWN' ? { increment: 1 } : undefined,
//         },
//       });

//       status = 'created';
//     }

//     return NextResponse.json({ status });
//   } catch (err) {
//     console.error('Vote error:', err);
//     return NextResponse.json(
//       { message: err instanceof Error ? err.message : 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VoteType } from '@prisma/client';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgid = searchParams.get('orgid');

  if (!orgid) {
    return NextResponse.json({ message: 'Missing organization ID' }, { status: 400 });
  }

  const body = await req.json();
  const { songId: jiosaavnId, sessionId, voteType } = body;
console.log(body)
  if (!jiosaavnId || !sessionId || !voteType || !['UP', 'DOWN'].includes(voteType)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    
    const songId = jiosaavnId;

    const existingVote = await prisma.vote.findUnique({
      where: {
        songId_sessionId: {
          songId,
          sessionId,
        },
      },
    });

    let status: 'created' | 'updated' | 'removed';

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // ➖ User removed their vote
        await prisma.vote.delete({
          where: {
            songId_sessionId: {
              songId,
              sessionId,
            },
          },
        });

        // Update the song vote counts
        await prisma.song.update({
          where: { id: songId },
          data: {
            upvotes: voteType === 'UP' ? { decrement: 1 } : undefined,
            downvotes: voteType === 'DOWN' ? { decrement: 1 } : undefined,
          },
        });

        status = 'removed';
      } else {
        // 🔁 User changed vote (UP <-> DOWN)
        await prisma.vote.update({
          where: {
            songId_sessionId: {
              songId,
              sessionId,
            },
          },
          data: { voteType: voteType as VoteType },
        });

        await prisma.song.update({
          where: { id: songId },
          data: {
            upvotes: voteType === 'UP' ? { increment: 1 } : { decrement: 1 },
            downvotes: voteType === 'DOWN' ? { increment: 1 } : { decrement: 1 },
          },
        });

        status = 'updated';
      }
    } else {
      // ➕ New vote
      await prisma.vote.create({
        data: {
          songId,
          sessionId,
          voteType: voteType as VoteType,
        },
      });

      await prisma.song.update({
        where: { id: songId },
        data: {
          upvotes: voteType === 'UP' ? { increment: 1 } : undefined,
          downvotes: voteType === 'DOWN' ? { increment: 1 } : undefined,
        },
      });

      status = 'created';
    }

    return NextResponse.json({ status });
  } catch (err) {
    console.error('Vote error:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
