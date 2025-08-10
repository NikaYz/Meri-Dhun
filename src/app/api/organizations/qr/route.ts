import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get('id');

  if (!organizationId) {
    return NextResponse.json({ message: 'Missing organization ID' }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { qrToken: true, qrExpiresAt: true },
  });

  if (!org) {
    return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
  }

  const now = new Date();
  let token = org.qrToken ?? '';
  let expiresAt = org.qrExpiresAt ?? new Date(0);

  if (!token || !expiresAt || expiresAt <= now) {
    token = randomUUID();
    expiresAt = new Date(Date.now() + 30000);

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        qrToken: token,
        qrExpiresAt: expiresAt,
      },
    });
  }

  return NextResponse.json({ token, expiresAt });
}
