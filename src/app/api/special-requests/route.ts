// app/api/special-requests/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RequestStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const organizationId = searchParams.get('organizationId')

  if (!organizationId) {
    return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 })
  }

  try {
    const requests = await prisma.specialRequest.findMany({
      where: { organizationId },
      orderBy: { timestamp: 'desc' },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching special requests:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json()

//     if (!body.organizationId || !body.type || !body.message || !body.requestedBy) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
//     }
//     console.log(body);
//     const request = await prisma.specialRequest.create({
//       data: {
//         organizationId: body.organizationId,
//         message: body.message,
//         requestedBy: body.requestedBy,
//         paid: body.paid,
//         amount: body.amount,
//         status: body.status.toUpperCase(),
//         type : body.type.toUpperCase(),
//         timestamp: new Date(),
//       },
//     })

//     return NextResponse.json({ id: request.id }, { status: 201 })
//   } catch (error) {
//     console.error('Error creating special request:', error)
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.organizationId || !body.type || !body.message || !body.requestedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const request = await prisma.specialRequest.create({
      data: {
        organizationId: body.organizationId,
        message: body.message,
        requestedBy: body.requestedBy,
        paid: body.paid,
        amount: body.amount,
        status: body.status.toUpperCase(), // keep as is: "pending" | "approved" | ...
        type: body.type.toUpperCase(),
        visibleToAll: body.visibleToAll || false,  
        fromRole: body.fromRole.toUpperCase() || 'USER',       // new
        isFirstFree: body.isFirstFree || false,  // new
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ id: request.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating special request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
