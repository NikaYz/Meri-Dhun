// app/api/org/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, createUserSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    console.log(email,password);
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    const organization = await prisma.organization.findUnique({
      where: { email },
    });
    if (!organization) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, organization.password);

    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    const session = await createUserSession(organization.id, 12,"ADMIN");
    
    const token = generateToken({
          organizationId: organization.id,
          sessionId: session.id,
          type: 'ADMIN',
        });


    return NextResponse.json({
      message: 'Login successful',
      token,
      sessionId: session.id,
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        validUntil: session.validUntil,
      },
    });
  } catch (error) {
    console.error('Org login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}