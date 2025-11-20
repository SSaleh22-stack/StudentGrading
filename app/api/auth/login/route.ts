import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '@/lib/db'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if database is available
    const dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
      // Database not available - fallback to localStorage mode
      return NextResponse.json(
        { 
          error: 'Database not configured',
          code: 'DB_NOT_AVAILABLE',
          message: 'Please configure your database connection',
          fallback: true
        },
        { status: 503 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // User not found - return error to prompt signup
      return NextResponse.json(
        { 
          error: 'Account not found',
          code: 'USER_NOT_FOUND',
          message: 'Please sign up to create an account'
        },
        { status: 404 }
      )
    }

    // Generate token
    const token = generateToken(user.id, user.email)

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        workplace: user.workplace,
        createdAt: user.createdAt
      }
    })
  } catch (error: any) {
    console.error('Login error:', error)
    // Always return JSON, even on errors
    return NextResponse.json(
      { 
        error: error.message || 'Login failed',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

