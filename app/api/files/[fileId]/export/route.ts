import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'
import { uploadGradeExport } from '@/lib/blob'

export async function POST(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, type, pageId } = body

    if (!content || !type || !['csv', 'pdf'].includes(type)) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters' },
        { status: 400 }
      )
    }

    // Verify file ownership
    const file = await prisma.gradeFile.findFirst({
      where: {
        id: params.fileId,
        ownerId: userId
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Upload to blob storage
    const url = await uploadGradeExport(params.fileId, content, type, pageId)

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export file' },
      { status: 500 }
    )
  }
}

