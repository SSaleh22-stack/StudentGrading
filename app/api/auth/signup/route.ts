import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '@/lib/db'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, dateOfBirth, gender, workplace } = body

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if database is available
    const dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        workplace,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        workplace: true,
        createdAt: true
      }
    })

    // Generate token
    const token = generateToken(user.id, user.email)

    return NextResponse.json({ 
      user,
      token 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Signup error:', error)
    // Always return JSON, even on errors
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create user',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

