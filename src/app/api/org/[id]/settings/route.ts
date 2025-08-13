import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// The GET and PATCH functions now have identical, robust function signatures
export async function GET(
  request: NextRequest
) {
  const match = request.nextUrl.pathname.match(/\/org\/(.*)\/settings/);

  const id = match ? match[1] : null;
 if (!id) {

  return NextResponse.json({ error: 'Organization ID not found in URL' }, { status: 400 });

  }
  try {
    const org = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        djMode: true,
        autoPlay: true,
        songCooldownMinutes: true,
        qrValidityHours: true,
        votingEnabled: true,
        paymentEnabled: true,
        specialRequestsEnabled: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Failed to fetch org' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {

  // Use a regular expression to safely extract the 'id' from the URL

  const match = request.nextUrl.pathname.match(/\/org\/(.*)\/settings/);

  const id = match ? match[1] : null;



  if (!id) {

  return NextResponse.json({ error: 'Organization ID not found in URL' }, { status: 400 });

  }



  try {

  const body = await request.json();

  const {

  djMode,

  autoPlay,

  songCooldownMinutes,

  qrValidityHours,

  votingEnabled,

  paymentEnabled,

  specialRequestsEnabled,

  } = body;



  if (

  typeof djMode !== 'boolean' ||
  typeof autoPlay !== 'boolean' ||
  typeof songCooldownMinutes !== 'number' ||
  typeof qrValidityHours !== 'number' ||
  typeof votingEnabled !== 'boolean' ||
  typeof paymentEnabled !== 'boolean' ||
  typeof specialRequestsEnabled !== 'boolean'
  ) {

  return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });

  }



  const updatedOrg = await prisma.organization.update({

  where: { id },

  data: {

  djMode,

  autoPlay,

  songCooldownMinutes,

  qrValidityHours,

  votingEnabled,

  paymentEnabled,

  specialRequestsEnabled,

  },

  });



  return NextResponse.json(updatedOrg);

  } catch (error) {

  console.error('Error updating organization:', error);

  return NextResponse.json({ error: 'Failed to update org' }, { status: 500 });

  }

}
// export async function PATCH(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   const { id } = context.params;

//   try {
//     const body = await request.json();
//     const {
//       djMode,
//       autoPlay,
//       songCooldownMinutes,
//       qrValidityHours,
//       votingEnabled,
//       paymentEnabled,
//       specialRequestsEnabled,
//     } = body;

//     // A more robust check for boolean and number types
//     const isBoolean = (val: unknown) => typeof val === 'boolean';
//     const isNumber = (val: unknown) => typeof val === 'number';

//     if (
//       !isBoolean(djMode) ||
//       !isBoolean(autoPlay) ||
//       !isNumber(songCooldownMinutes) ||
//       !isNumber(qrValidityHours) ||
//       !isBoolean(votingEnabled) ||
//       !isBoolean(paymentEnabled) ||
//       !isBoolean(specialRequestsEnabled)
//     ) {
//       return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
//     }

//     const updatedOrg = await prisma.organization.update({
//       where: { id },
//       data: {
//         djMode,
//         autoPlay,
//         songCooldownMinutes,
//         qrValidityHours,
//         votingEnabled,
//         paymentEnabled,
//         specialRequestsEnabled,
//       },
//     });

//     return NextResponse.json(updatedOrg);
//   } catch (error) {
//     console.error('Error updating organization:', error);
//     return NextResponse.json({ error: 'Failed to update org' }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   const params = await context.params; 
//   const { id } = params;

//   try {
//     const org = await prisma.organization.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         djMode: true,
//         autoPlay: true,
//         songCooldownMinutes: true,
//         qrValidityHours: true,
//         votingEnabled: true,
//         paymentEnabled: true,
//         specialRequestsEnabled: true,
//       },
//     });

//     if (!org) {
//       return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
//     }

//     return NextResponse.json(org);
//   } catch  {
//     return NextResponse.json({ error: 'Failed to fetch org' }, { status: 500 });
//   }
// }

// export async function PATCH(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const params = await context.params; // Await here
//   const { id } = params;

//   try {
//     const body = await request.json();

//     const {
//       djMode,
//       autoPlay,
//       songCooldownMinutes,
//       qrValidityHours,
//       votingEnabled,
//       paymentEnabled,
//       specialRequestsEnabled,
//     } = body;

//     // Basic validation
//     if (
//       typeof djMode !== 'boolean' ||
//       typeof autoPlay !== 'boolean' ||
//       typeof songCooldownMinutes !== 'number' ||
//       typeof qrValidityHours !== 'number' ||
//       typeof votingEnabled !== 'boolean' ||
//       typeof paymentEnabled !== 'boolean' ||
//       typeof specialRequestsEnabled !== 'boolean'
//     ) {
//       return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
//     }

//     const updatedOrg = await prisma.organization.update({
//       where: { id },
//       data: {
//         djMode,
//         autoPlay,
//         songCooldownMinutes,
//         qrValidityHours,
//         votingEnabled,
//         paymentEnabled,
//         specialRequestsEnabled,
//       },
//     });

//     return NextResponse.json(updatedOrg);
//   } catch{
//     return NextResponse.json({ error: 'Failed to update org' }, { status: 500 });
//   }
// }
