// Auth functionality removed - using localStorage instead
// This file is kept for API route compatibility but doesn't use jsonwebtoken

import { NextRequest } from 'next/server'

export interface AuthUser {
  userId: string
  email: string
}

export async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  // Stub implementation - not used with localStorage
  return null
}

export function generateToken(userId: string, email: string): string {
  // Stub implementation - not used with localStorage
  return ''
}

