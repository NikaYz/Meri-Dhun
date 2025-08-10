// import { prisma } from '@/lib/prisma';
// import { NextResponse } from 'next/server';
// import { randomUUID } from 'crypto';

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const organizationId = searchParams.get('id');
//   console.log(organizationId)

//   if (!organizationId) {
//     return NextResponse.json({ message: 'Missing organization ID' }, { status: 400 });
//   }

//   const token = randomUUID();
//   const expiresAt = new Date(Date.now() + 20000);

//   await prisma.organization.update({
//     where: { id: organizationId },
//     data: {
//       qrToken: token,
//       qrExpiresAt: expiresAt,
//     },
//   });

//   return NextResponse.json({ token });
// }
