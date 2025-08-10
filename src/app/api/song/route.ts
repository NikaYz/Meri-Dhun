// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { verifyToken } from '@/lib/auth';
// import { Song } from '@/lib/song';

// const COOLDOWN_MS_DEFAULT = 20 * 60 * 1000;

// /**
//  * Retrieves the last played timestamp for a specific song in an organization.
//  * @param orgSongId The ID of the OrgSong to check.
//  * @returns The last played timestamp or null if not found.
//  */
// async function getLastPlayed(orgSongId: string) {
//   const playHistoryEntry = await prisma.playHistory.findFirst({
//     where: { orgSongId },
//     orderBy: { playedAt: 'desc' },
//   });
//   return playHistoryEntry ? playHistoryEntry.playedAt : null;
// }

// export async function POST(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const orgid = searchParams.get('orgid');

//   if (!orgid) {
//     return NextResponse.json({ message: 'Missing organization ID' }, { status: 400 });
//   }

//   try {
//     const authHeader = req.headers.get('authorization');
//     if (!authHeader) {
//       return NextResponse.json({ message: 'No authorization header' }, { status: 401 });
//     }

//     const token = authHeader.split(' ')[1];
//     const payload = await verifyToken(token);

//     if (!payload || payload.organizationId !== orgid) {
//       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await req.json();
//     console.log('Incoming request body:', JSON.stringify(body, null, 2));

//     const { song }: { song: Song } = body;
//     const { id: jiosaavnId, name, primaryArtists, image, duration, album, year, downloadUrl } = song;

//     // --- Start of new logic with SongMetadata and OrgSong tables ---

//     // 1. Find or create the SongMetadata entry
//     let songMetadata = await prisma.songMetadata.findUnique({
//       where: { jiosaavnId },
//     });

//     if (!songMetadata) {
//       songMetadata = await prisma.songMetadata.create({
//         data: {
//           jiosaavnId,
//           name,
//           primaryArtists: JSON.stringify(primaryArtists), // Store as string
//           image,
//           duration,
//           album,
//           year,
//           downloadUrl,
//         },
//       });
//     }

//     // 2. Find or create the OrgSong entry
//     let orgSong = await prisma.orgSong.findFirst({
//       where: {
//         organizationId: orgid,
//         songMetadataId: songMetadata.id,
//       },
//     });

//     // 3. Get organization-specific cooldown period
//     const organization = await prisma.organization.findUnique({
//       where: { id: orgid },
//       select: { songCooldownMinutes: true },
//     });
//     const COOLDOWN_MS = (organization?.songCooldownMinutes ?? 20) * 60 * 1000;
//     console.log("org_song_id" , orgSong)
//     // 4. Check last played cooldown
//     const lastPlayed = orgSong ? await getLastPlayed(orgSong.id) : null;
//     if (lastPlayed) {
//       const lastPlayedTime = new Date(lastPlayed).getTime();
//       const now = Date.now();
//       const diff = now - lastPlayedTime;

//       if (diff < COOLDOWN_MS) {
//         const remainingMs = COOLDOWN_MS - diff;
//         const remainingMinutes = Math.ceil(remainingMs / 60000);

//         return NextResponse.json(
//           {
//             message: `This song was recently played. Please try again in ${remainingMinutes} minute(s).`,
//             cooldownEndsAt: new Date(lastPlayedTime + COOLDOWN_MS)
//           },
//           { status: 429 } // Too Many Requests
//         );
//       }
//     }

//     // 5. Update or create the OrgSong and PlayHistory
//     if (orgSong) {
//       // If song exists, increment play count
//       orgSong = await prisma.orgSong.update({
//         where: { id: orgSong.id },
//         data: {
//           playCount: { increment: 1 },
//           lastPlayed: new Date(),
//         },
//       });
//     } else {
//       // If it's a new song for this organization, create the entry
//       orgSong = await prisma.orgSong.create({
//         data: {
//           organizationId: orgid,
//           songMetadataId: songMetadata.id,
//           jiosaavnId: jiosaavnId,
//           playCount: 1,
//           lastPlayed: new Date(),
//           addedBy: payload.sessionId || payload.organizationId,
//         },
//       });
//     }

//     // Record the play history
//     await prisma.playHistory.create({
//       data: {
//         organizationId: orgid,
//         orgSongId: orgSong.id,
//         playedBy: payload.type === 'ADMIN' ? 'DJ' : 'System',
//       },
//     });

//     return NextResponse.json(orgSong, { status: 201 });

//   } catch (error) {
//     console.error('Add song error:', error instanceof Error ? error.message : error);
//     return NextResponse.json(
//       { message: error instanceof Error ? error.message : 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Song } from '@/lib/song';
// const COOLDOWN_MS = 20 * 60 * 1000;
const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; 

export async function getLastPlayed(orgId: string, songId: string) {
  const res = await fetch(
    `${baseUrl}/api/last-played?orgId=${orgId}&songId=${songId}`,
    { method: "GET" }
  );
  if (res.status === 404) {
    return null; // no last played yet
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch last played: ${res.status}`);
  }

  return res.json();
  
}
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgid = searchParams.get('orgid');

  if (!orgid) {
    return NextResponse.json({ message: 'Missing organization ID' }, { status: 400 });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);

    if (!payload || payload.organizationId !== orgid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Incoming request body:', JSON.stringify(body, null, 2));

    const { song }: { song: Song } = body;
    const { id: jiosaavnId, name, primaryArtists, image, duration, album, year, downloadUrl } = song;

    const existingSong = await prisma.song.findFirst({
      where: {
        jiosaavnId,
        organizationId: orgid,
      },
    });
    const Organization = await prisma.organization.findUnique({
      where:{
        id: orgid,
      }
    })
    const COOLDOWN_MS = (Organization?.songCooldownMinutes ?? 20) * 60 * 1000;
    const lastPlayedT = await getLastPlayed(orgid, jiosaavnId);

    if (existingSong ) {
      if(lastPlayedT){
        const lastPlayedTime = new Date(lastPlayedT.playedAt).getTime();
        const now = Date.now();
        const diff = now - lastPlayedTime;

        if (diff < COOLDOWN_MS) {
          const remainingMs = COOLDOWN_MS - diff;
          const remainingMinutes = Math.ceil(remainingMs / 60000);

          return NextResponse.json(
            { 
              message: `This song was recently played. Please try again in ${remainingMinutes} minute(s).`, 
              cooldownEndsAt: new Date(lastPlayedTime + COOLDOWN_MS) 
            },
            { status: 429 } // Too Many Requests
          );
        }
      }
      const updatedSong = await prisma.song.update({
        where: { id: existingSong.id },
        data: {
          playCount: { increment: 1 },
          //lastPlayed: new Date(),
        },
      });
      
      await prisma.playHistory.create({
        data: {
          organizationId: orgid,
          songId: existingSong.id,
          playedBy: payload.type === 'ADMIN' ? 'DJ' : 'System',
        },
      });

      return NextResponse.json(updatedSong);
    }
      if(lastPlayedT){
        const lastPlayedTime = new Date(lastPlayedT.playedAt).getTime();
        const now = Date.now();
        const diff = now - lastPlayedTime;

        if (diff < COOLDOWN_MS) {
          const remainingMs = COOLDOWN_MS - diff;
          const remainingMinutes = Math.ceil(remainingMs / 60000);

          return NextResponse.json(
            { 
              message: `This song was recently played. Please try again in ${remainingMinutes} minute(s).`, 
              cooldownEndsAt: new Date(lastPlayedTime + COOLDOWN_MS) 
            },
            { status: 429 } 
          );
        }
      
      }
    const newSong = await prisma.song.create({
      data: {
        jiosaavnId,
        name,
        primaryArtists,
        image,
        duration,
        album,
        year,
        downloadUrl,
        organizationId: orgid,
        playCount: 1,
        lastPlayed: new Date(),
        addedBy: payload.sessionId || payload.organizationId,
      },
    });

    await prisma.playHistory.create({
      data: {
        organizationId: orgid,
        songId: newSong.id,
        playedBy: payload.type === 'ADMIN' ? 'DJ' : 'System',
      },
    });

    return NextResponse.json(newSong, { status: 201 });
  } catch (error) {
    console.error('Add song error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
