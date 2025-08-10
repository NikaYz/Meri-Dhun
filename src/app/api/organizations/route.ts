
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma';
export async function POST(req: NextRequest) {
  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const organization = await prisma.organization.findUnique({
        where: { id },
      });
  return NextResponse.json({
    organizationName: organization?.name 
  })
}
