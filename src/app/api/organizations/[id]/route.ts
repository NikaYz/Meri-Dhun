import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params; 
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
    
//     const awaitedParams = await params;
//     const orgId = awaitedParams.id;

    if (!orgId) {
      return new Response(JSON.stringify({ error: 'Organization ID is required' }), { status: 400 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      
    });

    if (!organization) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ djAvailable: organization.djMode }), { status: 200 });
  } catch (error) {
    console.error('Error fetching DJ availability', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
