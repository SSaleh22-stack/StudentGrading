import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with error handling
let prismaInstance: PrismaClient | null = null

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  }
} catch (error) {
  console.warn('Failed to initialize Prisma client:', error)
  // Prisma will be null if database is not configured
  prismaInstance = null
}

export const prisma = prismaInstance as PrismaClient

// Helper to check if database is available
export async function isDatabaseAvailable(): Promise<boolean> {
  if (!prisma) return false
  
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.warn('Database not available:', error)
    return false
  }
}

