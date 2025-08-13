
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma'
import { hashPassword } from '@/lib/auth';


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
    const hashedPassword = await hashPassword(password);

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
// import { NextApiRequest, NextApiResponse } from 'next'
// import { prisma } from '@/lib/prisma'
// import { hashPassword, generateToken } from '@/lib/auth'

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' })
//   }

//   try {
//     const { name, email, password } = req.body

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'Missing required fields' })
//     }

//     // Check if organization already exists
//     const existingOrg = await prisma.organization.findUnique({
//       where: { email }
//     })

//     if (existingOrg) {
//       return res.status(400).json({ message: 'Organization already exists' })
//     }

//     // Hash password
//     const hashedPassword = await hashPassword(password)

//     // Create organization
//     const organization = await prisma.organization.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//       }
//     })

//     // Generate JWT token
//     const token = generateToken({
//       organizationId: organization.id,
//       type: 'organization'
//     })

//     res.status(201).json({
//       message: 'Organization registered successfully',
//       token,
//       organization: {
//         id: organization.id,
//         name: organization.name,
//         email: organization.email,
//       }
//     })
//   } catch (error) {
//     console.error('Registration error:', error)
//     res.status(500).json({ message: 'Internal server error' })
//   }
// }