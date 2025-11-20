import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (!subscription) {
      return NextResponse.json({ subscription: null })
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        expiresAt: subscription.expiresAt.toISOString(),
        createdAt: subscription.createdAt.toISOString(),
        updatedAt: subscription.updatedAt.toISOString()
      }
    })
  } catch (error: any) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      )
    }

    // Calculate expiration date
    const now = new Date()
    let expiresAt: Date

    if (plan === 'trial') {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    } else if (plan === 'monthly') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    } else if (plan === 'yearly') {
      expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 365 days
    } else {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        expiresAt
      },
      create: {
        userId,
        plan,
        expiresAt
      }
    })

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        expiresAt: subscription.expiresAt.toISOString(),
        createdAt: subscription.createdAt.toISOString(),
        updatedAt: subscription.updatedAt.toISOString()
      }
    })
  } catch (error: any) {
    console.error('Set subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set subscription' },
      { status: 500 }
    )
  }
}

