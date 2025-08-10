import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
  organizationId: string
  sessionId?: string
  type: 'ADMIN' | 'USER'
  
}
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export const generateQRToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const createUserSession = async (organizationId: string, validityHours: number = 1, role: "USER" | "ADMIN" = "USER") => {
  const sessionToken = generateQRToken()
  const validUntil = new Date(Date.now() + validityHours * 60 * 60 * 1000)

  const session = await prisma.userSession.create({
    data: {
      sessionToken,
      organizationId,
      validUntil,
      role
    },
  })

  return session
}