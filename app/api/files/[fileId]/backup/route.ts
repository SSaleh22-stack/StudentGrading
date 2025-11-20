import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'
import { uploadBackup } from '@/lib/blob'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Verify file ownership
    const file = await prisma.gradeFile.findFirst({
      where: {
        id: fileId,
        ownerId: userId
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Upload backup to blob storage
    const url = await uploadBackup(fileId, JSON.stringify(content))

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('Backup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create backup' },
      { status: 500 }
    )
  }
}

