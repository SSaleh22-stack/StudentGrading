import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if database is available
    const dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable) {
      return NextResponse.json(
        { 
          error: 'Database not configured',
          code: 'DB_NOT_AVAILABLE',
          files: []
        },
        { status: 503 }
      )
    }

    const files = await prisma.gradeFile.findMany({
      where: { ownerId: userId },
      include: {
        students: {
          orderBy: { createdAt: 'asc' }
        },
        pages: {
          include: {
            columns: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Transform to match GradeFile type
    const transformedFiles = files.map((file: any) => ({
      id: file.id,
      owner: file.ownerId, // Keep owner as email/string for compatibility
      name: file.name,
      description: file.description,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
      students: file.students.map((s: any) => ({
        id: s.id,
        name: s.name,
        studentId: s.studentId
      })),
      pages: file.pages.map((page: any) => ({
        id: page.id,
        name: page.name,
        type: page.type as any,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
        columns: page.columns.map((col: any) => ({
          id: col.id,
          title: col.title,
          type: col.type as any,
          order: col.order,
          pinned: col.pinned,
          sourceColumns: col.sourceColumns as any,
          roundTo: col.roundTo
        })),
        grades: [], // Will be loaded separately
        attendanceRecords: [] // Will be loaded separately
      }))
    }))

    return NextResponse.json({ files: transformedFiles })
  } catch (error: any) {
    console.error('Get files error:', error)
    // Always return JSON, even on errors
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get files',
        code: 'INTERNAL_ERROR',
        files: []
      },
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
    const { name, description, students } = body

    if (!name) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      )
    }

    const file = await prisma.gradeFile.create({
      data: {
        ownerId: userId,
        name,
        description,
        students: {
          create: (students || []).map((s: any) => ({
            name: s.name,
            studentId: s.studentId
          }))
        },
        pages: {
          create: {
            name: 'Grading',
            type: 'grading',
            columns: []
          }
        }
      },
      include: {
        students: true,
        pages: {
          include: {
            columns: true
          }
        }
      }
    })

    // Transform to match GradeFile type
    const transformedFile = {
      id: file.id,
      owner: file.ownerId,
      name: file.name,
      description: file.description,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
      students: file.students.map((s: any) => ({
        id: s.id,
        name: s.name,
        studentId: s.studentId
      })),
      pages: file.pages.map((page: any) => ({
        id: page.id,
        name: page.name,
        type: page.type as any,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
        columns: page.columns.map((col: any) => ({
          id: col.id,
          title: col.title,
          type: col.type as any,
          order: col.order,
          pinned: col.pinned,
          sourceColumns: col.sourceColumns as any,
          roundTo: col.roundTo
        })),
        grades: [],
        attendanceRecords: []
      }))
    }

    return NextResponse.json({ file: transformedFile }, { status: 201 })
  } catch (error: any) {
    console.error('Create file error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create file' },
      { status: 500 }
    )
  }
}

