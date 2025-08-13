import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma'


export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      name,
      email,
      password,
      djMode,
      autoPlay,
      songCooldownMinutes,
      qrValidityHours,
      votingEnabled,
      paymentEnabled,
      specialRequestsEnabled
    } = data;

    // Check if email already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { email }
    });

    if (existingOrg) {
      return NextResponse.json({ message: 'Organization with this email already exists' }, { status: 409 });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const newOrg = await prisma.organization.create({
      data: {
        name,
        email,
        password: hashedPassword,
        djMode,
        autoPlay,
        songCooldownMinutes: Number(songCooldownMinutes),
        qrValidityHours: Number(qrValidityHours),
        votingEnabled,
        paymentEnabled,
        specialRequestsEnabled
      }
    });

    return NextResponse.json({ organizationId: newOrg.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
