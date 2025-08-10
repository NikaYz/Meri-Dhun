// import { NextResponse } from "next/server";

// // This file is no longer needed.
// // The logic for checking and updating the last played song has been moved
// // directly into the play/route.ts API to improve efficiency and align
// // with the new database schema, where the `lastPlayed` timestamp is
// // now a field on the OrgSong model.
// // This route can be safely deleted from your project.

// export async function GET() {
//   return NextResponse.json({ message: "This endpoint is deprecated." }, { status: 410 });
// }

// export async function POST() {
//   return NextResponse.json({ message: "This endpoint is deprecated." }, { status: 410 });
// }
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; // adjust path to your prisma client

// Save or update the last played song for an organization
export async function POST(req: Request) {
  try {
    const { orgId, songId } = await req.json();

    if (!orgId || !songId) {
      return NextResponse.json({ error: "orgId and songId are required" }, { status: 400 });
    }
    const song = await prisma.song.findUnique({
      where: { id: songId }
    });
    if(!song){
      return NextResponse.json({ error: "songId not valid" }, { status: 400 });
    }
    // Either create or update the existing record
    const lastPlayed = await prisma.lastPlayedSong.upsert({
        where: {
          orgId_songId: { orgId, songId: song.jiosaavnId }, // ✅ must wrap in compound key object
        },
        update: {
          playedAt: new Date(),
        },
        create: {
          orgId,
          songId : song.jiosaavnId,
          playedAt: new Date(),
        },
      });
    return NextResponse.json(lastPlayed);
  } catch (error) {
    console.error("Error saving last played song:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const songId = searchParams.get("songId");
    if (!orgId || !songId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const lastPlayed = await prisma.lastPlayedSong.findFirst({
      where: { orgId,songId },
    });

    if (!lastPlayed) {
      return NextResponse.json({ message: "No song found for this organization" }, { status: 404 });
    }

    return NextResponse.json(lastPlayed);
  } catch (error) {
    console.error("Error fetching last played song:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
