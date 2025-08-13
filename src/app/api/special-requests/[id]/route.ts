// app/api/special-requests/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { RequestStatus } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest
) {
  try {
    const match = request.nextUrl.pathname.match(/\/special-requests\/(.*)\//);

  const id = match ? match[1] : null;
   if (!id) {

  return NextResponse.json({ error: 'Organization ID not found in URL' }, { status: 400 });

  }
    const { status } = await request.json();
    const upperStatus = status.toUpperCase();

    // Check if the uppercase status is a valid enum value
    if (!(upperStatus in RequestStatus)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    // Now we can safely cast it to the correct enum type
    const data: { status: RequestStatus; visibleToAll?: boolean } = {
      status: upperStatus as RequestStatus,
    };

    // If approved, make it visible to all users
    if (upperStatus === 'APPROVED') {
      data.visibleToAll = true;
    }

    const updated = await prisma.specialRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating special request:', error);
    return NextResponse.json(
      { error: 'Failed to update special request' },
      { status: 500 }
    );
  }
}

// // app/api/special-requests/[id]/route.ts
// import { prisma } from '@/lib/prisma';
// import { RequestStatus } from '@prisma/client';
// import { NextResponse } from 'next/server';

// export async function PATCH(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
    
//     const { status } = await req.json();
//     const upperStatus = status.toUpperCase();

//     const data: { status: RequestStatus; visibleToAll?: boolean } = {
//       status: upperStatus as RequestStatus,
//     };

    
//     // If approved, make it visible to all users
//     if (upperStatus === 'APPROVED') {
//       data.visibleToAll = true;
//     }

//     const updated = await prisma.specialRequest.update({
//       where: { id: params.id },
//       data,
//     });

//     return NextResponse.json(updated, { status: 200 });
//   } catch (error) {
//     console.error('Error updating special request:', error);
//     return NextResponse.json(
//       { error: 'Failed to update special request' },
//       { status: 500 }
//     );
//   }
// }



// // export async function PATCH(
// //   req: Request,
// //   { params }: { params: { id: string } }
// // ) {
// //   try {
// //     const { status } = await req.json();

// //     const updated = await prisma.specialRequest.update({
// //       where: { id: params.id },
// //       data: { status },
// //     });

// //     return NextResponse.json(updated, { status: 200 });
// //   } catch (error) {
// //     console.error(error);
// //     return NextResponse.json(
// //       { error: 'Failed to update special request' },
// //       { status: 500 }
// //     );
// //   }
// // }
