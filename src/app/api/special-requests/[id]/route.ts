// app/api/special-requests/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    const upperStatus = status.toUpperCase();

    const data: any = { status: upperStatus };
    
    // If approved, make it visible to all users
    if (upperStatus === 'APPROVED') {
      data.visibleToAll = true;
    }

    const updated = await prisma.specialRequest.update({
      where: { id: params.id },
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



// export async function PATCH(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { status } = await req.json();

//     const updated = await prisma.specialRequest.update({
//       where: { id: params.id },
//       data: { status },
//     });

//     return NextResponse.json(updated, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: 'Failed to update special request' },
//       { status: 500 }
//     );
//   }
// }
