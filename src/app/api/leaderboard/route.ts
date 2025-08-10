// import { prisma } from '@/lib/prisma';
// import { NextRequest, NextResponse } from 'next/server';

// // DB song matches Prisma DB schema (primaryArtists is string)
// // NOTE: We now reference OrgSong for organization-specific data
// interface DbOrgSong {
//   id: string;
//   songMetadataId: string;
//   organizationId: string;
//   jiosaavnId: string;
//   upvotes: number;
//   downvotes: number;
//   paidBoosts?: number;
//   playCount?: number;
//   lastPlayed: Date | null;
//   addedBy: string | null;
//   timeAdded: Date;
//   votes: { voteType: string }[];
// }

// // NOTE: We now reference SongMetadata for static song data
// // The 'primaryArtists' field is now of type 'Json' in the database
// interface DbSongMetadata {
//   id: string;
//   jiosaavnId: string;
//   name: string;
//   primaryArtists: string | null;
//   image: string;
//   duration: string;
//   album: string | null;
//   year: string | null;
//   downloadUrl: string | null;
// }

// // API song matches what you want to return (primaryArtists parsed)
// interface ApiSong {
//   id: string; // This will now be the OrgSong ID
//   name: string;
//   primaryArtists: { name: string }[];
//   image: string;
//   duration: string;
//   album: string | null;
//   year: string | null;
//   downloadUrl: string | null;
// }

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const organizationId = searchParams.get('organizationId');
//   const sessionId = searchParams.get('sessionId');

//   if (!organizationId || !sessionId) {
//     return NextResponse.json({ error: 'organizationId and sessionId required' }, { status: 400 });
//   }

//   try {
//     const orgSongs = await prisma.orgSong.findMany({
//       where: { organizationId },
//       include: {
//         songMetadata: true, // Fetch the related song metadata
//         votes: {
//           where: { sessionId },
//           select: { voteType: true },
//         },
//       },
//     });

//     const leaderboard = orgSongs
//       .map((orgSong) => {
//         const songMetadata = orgSong.songMetadata;
//         let parsedArtists: { name: string }[] = [];

//         // 🚨 FIX 1: Explicitly check for a string type and cast
//         if (songMetadata?.primaryArtists && typeof songMetadata.primaryArtists === 'string') {
//           parsedArtists = songMetadata.primaryArtists
//             .split(',')
//             .map((artist) => ({ name: artist.trim() }));
//         }

//         const apiSong: ApiSong = {
//           id: orgSong.id,
//           name: songMetadata?.name || '',
//           primaryArtists: parsedArtists,
//           image: songMetadata?.image || '',
//           duration: songMetadata?.duration || '',
//           album: songMetadata?.album || null,
//           year: songMetadata?.year || null,
//           downloadUrl: songMetadata?.downloadUrl || null,
//         };

//         return {
//           song: apiSong,
//           userVote: orgSong.votes[0]?.voteType ?? null,
//           score:
//             orgSong.upvotes -
//             orgSong.downvotes +
//             (orgSong.paidBoosts ?? 0) * 10 +
//             (orgSong.playCount ?? 0),
//           // 🚨 FIX 2: Include timeAdded in the object for sorting
//           timeAdded: orgSong.timeAdded,
//         };
//       })
//       .sort((a, b) => {
//         if (b.score !== a.score) return b.score - a.score;

//         // 🚨 FIX 2: Use the timeAdded property directly from the mapped object
//         const aTime = a.timeAdded.getTime();
//         const bTime = b.timeAdded.getTime();

//         // Earlier time = higher rank
//         return aTime - bTime;
//       })
//       .map((entry, index) => ({
//         ...entry,
//         rank: index + 1,
//       }));

//     return NextResponse.json(leaderboard);
//   } catch (error) {
//     console.error('Failed to fetch leaderboard:', error);
//     return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
//   }
// }

// export async function DELETE(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const organizationId = searchParams.get('organizationId');
//   const orgSongId = searchParams.get('songId'); // Renamed from songId

//   if (!organizationId || !orgSongId) {
//     return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
//   }

//   try {
//     if (orgSongId) {
//       await prisma.orgSong.deleteMany({
//         where: {
//           organizationId,
//           jiosaavnId: orgSongId,
//         },
//       });
//     } else {
//       await prisma.orgSong.deleteMany({
//         where: { organizationId },
//       });
//     }

//     return NextResponse.json({ message: orgSongId ? 'Song removed successfully' : 'Leaderboard cleared successfully' });
//   } catch (error) {
//     console.error('Error removing song(s):', error);
//     return NextResponse.json({ error: 'Failed to remove song(s)' }, { status: 500 });
//   }
// }

// import { prisma } from '@/lib/prisma';
// import { NextRequest, NextResponse } from 'next/server';

// // DB song matches Prisma DB schema (primaryArtists is string)
// // NOTE: We now reference OrgSong for organization-specific data
// interface DbOrgSong {
//   id: string;
//   songMetadataId: string;
//   organizationId: string;
//   jiosaavnId: string;
//   upvotes: number;
//   downvotes: number;
//   paidBoosts?: number;
//   playCount?: number;
//   lastPlayed: Date | null;
//   addedBy: string | null;
//   timeAdded: Date;
//   votes: { voteType: string }[];
// }

// // NOTE: We now reference SongMetadata for static song data
// interface DbSongMetadata {
//   id: string;
//   jiosaavnId: string;
//   name: string;
//   primaryArtists: string | null;
//   image: string;
//   duration: string;
//   album: string | null;
//   year: string | null;
//   downloadUrl: string | null;
// }

// // API song matches what you want to return (primaryArtists parsed)
// interface ApiSong {
//   id: string; // This will now be the OrgSong ID
//   name: string;
//   primaryArtists: { name: string }[];
//   image: string;
//   duration: string;
//   album: string | null;
//   year: string | null;
//   downloadUrl: string | null;
// }

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const organizationId = searchParams.get('organizationId');
//   const sessionId = searchParams.get('sessionId');

//   if (!organizationId || !sessionId) {
//     return NextResponse.json({ error: 'organizationId and sessionId required' }, { status: 400 });
//   }

//   try {
//     const orgSongs = await prisma.orgSong.findMany({
//       where: { organizationId },
//       include: {
//         songMetadata: true, // Fetch the related song metadata
//         votes: {
//           where: { sessionId },
//           select: { voteType: true },
//         },
//       },
//     });

//     const leaderboard = orgSongs
//       .map((orgSong) => {
//         const songMetadata = orgSong.songMetadata;
//         let parsedArtists: { name: string }[] = [];

//         if (songMetadata?.primaryArtists) {
//           parsedArtists = songMetadata.primaryArtists
//             .split(',')
//             .map((artist) => ({ name: artist.trim() }));
//         }

//         const apiSong: ApiSong = {
//           id: orgSong.id,
//           name: songMetadata?.name || '',
//           primaryArtists: parsedArtists,
//           image: songMetadata?.image || '',
//           duration: songMetadata?.duration || '',
//           album: songMetadata?.album || null,
//           year: songMetadata?.year || null,
//           downloadUrl: songMetadata?.downloadUrl || null,
//         };

//         return {
//           song: apiSong,
//           userVote: orgSong.votes[0]?.voteType ?? null,
//           score:
//             orgSong.upvotes -
//             orgSong.downvotes +
//             (orgSong.paidBoosts ?? 0) * 10 +
//             (orgSong.playCount ?? 0),
//         };
//       })
//       .sort((a, b) => {
//         if (b.score !== a.score) return b.score - a.score;

//         const aTime = a.song.timeAdded?.getTime() || 0;
//         const bTime = b.song.timeAdded?.getTime() || 0;

//         // Earlier time = higher rank
//         return aTime - bTime;
//       })
//       .map((entry, index) => ({
//         ...entry,
//         rank: index + 1,
//       }));

//     return NextResponse.json(leaderboard);
//   } catch (error) {
//     console.error('Failed to fetch leaderboard:', error);
//     return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
//   }
// }

// export async function DELETE(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const organizationId = searchParams.get('organizationId');
//   const orgSongId = searchParams.get('orgSongId'); // Renamed from songId

//   if (!organizationId) {
//     return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
//   }

//   try {
//     if (orgSongId) {
//       await prisma.orgSong.deleteMany({
//         where: {
//           organizationId,
//           id: orgSongId,
//         },
//       });
//     } else {
//       await prisma.orgSong.deleteMany({
//         where: { organizationId },
//       });
//     }

//     return NextResponse.json({ message: orgSongId ? 'Song removed successfully' : 'Leaderboard cleared successfully' });
//   } catch (error) {
//     console.error('Error removing song(s):', error);
//     return NextResponse.json({ error: 'Failed to remove song(s)' }, { status: 500 });
//   }
// }
// // app/api/leaderboard/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// DB song matches Prisma DB schema (primaryArtists is string)
interface DbSong {
  id: string;
  name: string;
  primaryArtists: string  | null;
  image: string;
  duration: string;
  album: string;
  year: string;
  upvotes: number;
  downvotes: number;
  paidBoosts?: number;
  playCount?: number;
  lastPlayed: string;
  timeAdded: string;
  votes: { voteType: string }[];
}

// API song matches what you want to return (primaryArtists parsed)
interface ApiSong extends Omit<DbSong, 'primaryArtists' | 'votes'> {
  primaryArtists: { name: string }[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get('organizationId');
  const sessionId = searchParams.get('sessionId');

  if (!organizationId || !sessionId) {
    return NextResponse.json({ error: 'organizationId and sessionId required' }, { status: 400 });
  }

  try {
    const songs = await prisma.song.findMany({
      where: { organizationId },
      include: {
        votes: {
          where: { sessionId },
          select: { voteType: true },
        },
      },
    });

    const leaderboard = songs
      .map((song) => {
        let parsedArtists: { name: string }[] = [];

        if (typeof song.primaryArtists === 'string') {
          parsedArtists = song.primaryArtists
            .split(',')
            .map((artist) => ({ name: artist.trim() }));
        }

        const apiSong = {
          ...song,
          primaryArtists: parsedArtists,
        };

        return {
          song: apiSong,
          userVote: song.votes[0]?.voteType ?? null,
          score:
            song.upvotes -
            song.downvotes +
            (song.paidBoosts ?? 0) * 10 +
            (song.playCount ?? 0),
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;

        const aTime = new Date(a.song.timeAdded || 0).getTime();
        const bTime = new Date(b.song.timeAdded || 0).getTime();

        // Earlier time = higher rank
        return aTime - bTime;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get('organizationId');
  const songId = searchParams.get('songId'); // optional

  if (!organizationId) {
    return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
  }

  try {
    if (songId) {
      await prisma.song.deleteMany({
        where: {
          organizationId,
          id: songId,
        },
      });
    } else {
      await prisma.song.deleteMany({
        where: { organizationId },
      });
    }

    return NextResponse.json({ message: songId ? 'Song removed successfully' : 'Leaderboard cleared successfully' });
  } catch (error) {
    console.error('Error removing song(s):', error);
    return NextResponse.json({ error: 'Failed to remove song(s)' }, { status: 500 });
  }

}