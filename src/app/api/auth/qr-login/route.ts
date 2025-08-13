import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, createUserSession, verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, qrToken, token } = body;

    if (!organizationId || !qrToken) {
      return NextResponse.json({ message: 'Missing organization ID or QR token' }, { status: 400 });
    }

    // 🔐 Step 1: Verify token if sent
    if (token) {
      try {
        const decoded = verifyToken(token);
        if (!decoded) {
  return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
}

        if (decoded.organizationId === organizationId && decoded.sessionId) {
          const existingSession = await prisma.userSession.findUnique({
            where: { id: decoded.sessionId },
          });

          if (
            existingSession &&
            new Date(existingSession.validUntil) > new Date()
          ) {

            // ✅ Reuse valid session
            return NextResponse.json({
              message: 'Reused existing session',
              token,
              sessionId: existingSession.id,
              validUntil: existingSession.validUntil,
            });
          }
        }
      } catch {
        console.warn('Invalid or expired token, creating new session');
      }
    }

    // ✅ Step 2: Verify QR token and organization
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        qrToken,
        qrExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ message: 'Invalid or expired QR code' }, { status: 401 });
    }


    const session = await createUserSession(organizationId, organization.qrValidityHours);

    const newToken = generateToken({
      organizationId: organization.id,
      sessionId: session.id,
      type: 'USER',
    });

    return NextResponse.json({
      message: 'QR login successful',
      token: newToken,
      sessionId: session.id,
      validUntil: session.validUntil,
      organization: {
        id: organization.id,
        name: organization.name,
        djMode: organization.djMode,
        votingEnabled: organization.votingEnabled,
        paymentEnabled: organization.paymentEnabled,
        specialRequestsEnabled: organization.specialRequestsEnabled,
      },
    });
  } catch (error) {
    console.error('QR login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { generateToken, createUserSession } from '@/lib/auth';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { organizationId, qrToken } = body;

//     if (!organizationId || !qrToken) {
//       return NextResponse.json({ message: 'Missing organization ID or QR token' }, { status: 400 });
//     }

//     // Find organization and verify QR token
//     const organization = await prisma.organization.findFirst({
//       where: {
//         id: organizationId,
//         qrToken,
//         qrExpiresAt: {
//           gt: new Date()
//         }
//       }
//     });

//     if (!organization) {
//       return NextResponse.json({ message: 'Invalid or expired QR code' }, { status: 401 });
//     }

//     // Create user session
//     const session = await createUserSession(organizationId, organization.qrValidityHours);

//     // Generate JWT token for user
//     const token = generateToken({
//       organizationId: organization.id,
//       sessionId: session.id,
//       type: 'user'
//     });

//     return NextResponse.json({
//       message: 'QR login successful',
//       token,
//       sessionId: session.id,
//       validUntil: session.validUntil,
//       organization: {
//         id: organization.id,
//         name: organization.name,
//         djMode: organization.djMode,
//         votingEnabled: organization.votingEnabled,
//         paymentEnabled: organization.paymentEnabled,
//         specialRequestsEnabled: organization.specialRequestsEnabled,
//       }
//     });
//   } catch (error) {
//     console.error('QR login error:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }
