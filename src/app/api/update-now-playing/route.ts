
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'

import { NowPlayingState, Song } from '@/lib/song';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');

        if (!organizationId) {
            return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
        }
        
        const nowPlayingState = await prisma.nowPlayingState.findUnique({
            where: { organizationId },
            include: {
                currentSong: true,
                previousSong: true,
            },
        });

        if (!nowPlayingState) {
            return NextResponse.json({
                nowPlayingState: null
            }, { status: 200 });
        }

        // ---
        // A helper function to safely format the song object
        const formatSongForResponse = (song: typeof nowPlayingState.currentSong): Song | null => {
            if (!song) return null;

            let artistsArray: { id?: string; name: string; }[];
            if (typeof song.primaryArtists === 'string') {
                artistsArray = song.primaryArtists
                    .replace(/"/g, '')
                    .split(',')
                    .map(artistName => ({ name: artistName.trim() }));
            } else {
                // If it's already an array, use it directly (for older data or inconsistent saves)
                artistsArray = song.primaryArtists;
            }

            // Correctly format the date fields to strings to match the Song interface
            const formattedLastPlayed = song.lastPlayed ? song.lastPlayed.toISOString() : undefined;

            return {
                ...song,
                primaryArtists: artistsArray,
                lastPlayed: formattedLastPlayed,
            } as Song; // Type cast here to satisfy the Song interface
        };
        // ---

        // Build the final response object with the correctly formatted songs
        const formattedResponseState: NowPlayingState = {
            organizationId: nowPlayingState.organizationId,
            updatedAt: nowPlayingState.updatedAt.toISOString(),
            currentSong: formatSongForResponse(nowPlayingState.currentSong),
            previousSong: formatSongForResponse(nowPlayingState.previousSong),
        };
        
        return NextResponse.json({
            nowPlayingState: formattedResponseState
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching now playing state:', error);

        return NextResponse.json({ error: 'Failed to fetch now playing state' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// export async function GET(request: Request) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const organizationId = searchParams.get('organizationId');

//         if (!organizationId) {
//             return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
//         }
//         const nowPlayingState = await prisma.nowPlayingState.findUnique({
//             where: { organizationId },
//             include: {
//                 currentSong: true,
//                 previousSong: true,
//             },
//         });
//             const formattedNowPlayingState = { ...nowPlayingState };

//         // Process currentSong
//         if (formattedNowPlayingState.currentSong && typeof formattedNowPlayingState.currentSong.primaryArtists === 'string') {
//             formattedNowPlayingState.currentSong.primaryArtists = formattedNowPlayingState.currentSong.primaryArtists
//                 .replace(/"/g, '')
//                 .split(',')
//                 .map(artistName => ({ name: artistName.trim() }));
//         }

//         // Process previousSong
//         if (formattedNowPlayingState.previousSong && typeof formattedNowPlayingState.previousSong.primaryArtists === 'string') {
//             formattedNowPlayingState.previousSong.primaryArtists = formattedNowPlayingState.previousSong.primaryArtists
//                 .replace(/"/g, '')
//                 .split(',')
//                 .map(artistName => ({ name: artistName.trim() }));
//         }
        
//         return NextResponse.json({
//             nowPlayingState: formattedNowPlayingState
//         }, { status: 200 });

//         // return NextResponse.json({
//         //     nowPlayingState
//         // }, { status: 200 });

//     } catch (error) {
//         console.error('Error fetching now playing state:', error);

//         return NextResponse.json({ error: 'Failed to fetch now playing state' }, { status: 500 });
//     } finally {
//         await prisma.$disconnect();
//     }
// }

export async function POST(request: Request) {
    try {
        const { organizationId, newCurrentSongId } = await request.json();

        if (!organizationId || newCurrentSongId === undefined) {
            return NextResponse.json({ error: 'Missing organizationId or newCurrentSongId' }, { status: 400 });
        }

        
        
        const existingNowPlayingState = await prisma.nowPlayingState.findUnique({
            where: { organizationId },
            select: { currentSongId: true }
        });

        const oldCurrentSongId = existingNowPlayingState?.currentSongId || null;

        const updatedNowPlayingState = await prisma.nowPlayingState.upsert({
            where: { organizationId },
            update: {
                currentSongId: newCurrentSongId,
                previousSongId: oldCurrentSongId,
            },
            create: {
                organizationId,
                currentSongId: newCurrentSongId,
                previousSongId: null,
            },
            include: {
                currentSong: true,
                previousSong: true,
            },
        });

        return NextResponse.json({
            message: 'Now playing state updated successfully',
            nowPlayingState: updatedNowPlayingState
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating now playing state:', error);
       
        return NextResponse.json({ error: 'Failed to update now playing state' }, { status: 500 });
    } 
}
