// Database functionality removed - using localStorage instead
// This file is kept for API route compatibility but doesn't use Prisma

export const prisma = null as any

// Helper to check if database is available
export async function isDatabaseAvailable(): Promise<boolean> {
  return false
}

