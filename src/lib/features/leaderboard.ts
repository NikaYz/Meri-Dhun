import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../prisma'
import { hashPassword, generateToken } from '../auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { email }
    })

    if (existingOrg) {
      return res.status(400).json({ message: 'Organization already exists' })
    }

    const hashedPassword = await hashPassword(password)
    
    const organization = await prisma.organization.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })

    // Generate JWT token
    const token = generateToken({
      organizationId: organization.id,
      type: 'ADMIN'
    })

    res.status(201).json({
      message: 'Organization registered successfully',
      token,
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}