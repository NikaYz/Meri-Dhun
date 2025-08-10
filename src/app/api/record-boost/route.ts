// import { NextRequest, NextResponse } from 'next/server';
// import Stripe from 'stripe'
// import { prisma } from '@/lib/prisma'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// export async function POST(req: Request) {
//   try {
//     const { sessionId } = await req.json();
    
//     if (!sessionId) {
//       return NextResponse.json({ message: 'Missing session ID' }, { status: 400 });
//     }

//     // Retrieve session from Stripe
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
    
//     if (!session.metadata) {
//       return NextResponse.json({ message: 'Missing metadata in session' }, { status: 400 });
//     }

//     // 🚨 Changed songId to orgSongId to match new database schema
//     const { orgSongId, userId, boostAmount } = session.metadata;

//     if (!orgSongId || !userId || !boostAmount) {
//       return NextResponse.json({ message: 'Incomplete metadata in session' }, { status: 400 });
//     }

//     // Fetch the user session to validate it exists
//     const userSession = await prisma.userSession.findUnique({
//       where: { id: userId },
//     });

//     if (!userSession) {
//       return NextResponse.json({ message: 'User session not found' }, { status: 404 });
//     }

//     const amount = parseFloat(boostAmount);
//     const boostPoints = Math.floor(amount / 5);

//     // 🚨 Create boost entry referencing the OrgSong, not the old Song model
//     await prisma.boost.create({
//       data: {
//         orgSongId, // Updated from songId
//         sessionId: userId,
//         amount,
//         boostPoints,
//       },
//     });

//     // 🚨 Update OrgSong's paid boost count
//     await prisma.orgSong.update({
//       where: { id: orgSongId }, // Updated from songId
//       data: {
//         paidBoosts: { increment: boostPoints },
//       },
//     });

//     // Mark user session as paid
//     await prisma.userSession.update({
//       where: { id: userId },
//       data: {
//         hasPaid: true,
//       },
//     });

//     return NextResponse.json({
//       message: 'Boost recorded successfully',
//       boostPoints,
//       orgSongId, // Updated from songId
//       userId,
//     });
//   } catch (error) {
//     console.error('Record Boost Error:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return NextResponse.json({ message: 'Missing session ID' }, { status: 400 });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session.metadata) {
      return NextResponse.json({ message: 'Missing metadata in session' }, { status: 400 });
    }

    const { songId, userId, boostAmount } = session.metadata;

    if (!songId || !userId || !boostAmount) {
      return NextResponse.json({ message: 'Incomplete metadata in session' }, { status: 400 });
    }

    // Fetch the user session to validate it exists
    const userSession = await prisma.userSession.findUnique({
      where: { id: userId },
    });

    if (!userSession) {
      return NextResponse.json({ message: 'User session not found' }, { status: 404 });
    }

    const amount = parseFloat(boostAmount);
    const boostPoints = Math.floor(amount / 5);

    // Create boost entry
    await prisma.boost.create({
      data: {
        songId,
        sessionId: userId,
        amount,
        boostPoints,
      },
    });

    // Update song's paid boost count
    await prisma.song.update({
      where: { id: songId },
      data: {
        paidBoosts: { increment: boostPoints },
      },
    });

    // Mark user session as paid
    await prisma.userSession.update({
      where: { id: userId },
      data: {
        hasPaid: true,
      },
    });

    return NextResponse.json({
      message: 'Boost recorded successfully',
      boostPoints,
      songId,
      userId,
    });
  } catch (error) {
    console.error('Record Boost Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id, songId } = req.query
  const { amount } = req.body // Payment amount in dollars

  try {
    // Verify user token
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)

    if (!payload || payload.organizationId !== id || payload.type !== 'user' || !payload.sessionId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Check if user session is still valid
    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        validUntil: { gt: new Date() }
      }
    })

    if (!session) {
      return res.status(401).json({ message: 'Session expired' })
    }

    // Calculate boost points ($5 = 1 boost point)
    const boostPoints = Math.floor(amount / 5)

    // Create boost record
    await prisma.boost.create({
      data: {
        songId: songId as string,
        sessionId: session.id,
        amount,
        boostPoints
      }
    })

    // Update song boost count
    const updatedSong = await prisma.song.update({
      where: { id: songId as string },
      data: {
        paidBoosts: { increment: boostPoints }
      }
    })

    // Mark session as having paid
    await prisma.userSession.update({
      where: { id: session.id },
      data: { hasPaid: true }
    })

    res.status(200).json({
      message: 'Song boosted successfully',
      boostPoints,
      song: updatedSong
    })
  } catch (error) {
    console.error('Boost error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}