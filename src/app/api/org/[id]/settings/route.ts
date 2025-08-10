import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const params = await context.params; 
  const { id } = params;

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
    return NextResponse.json({ error: 'Failed to fetch org' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params; // Await here
  const { id } = params;

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

    // Basic validation
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
    return NextResponse.json({ error: 'Failed to update org' }, { status: 500 });
  }
}
