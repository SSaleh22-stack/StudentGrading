import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const file = await prisma.gradeFile.findFirst({
      where: {
        id: fileId,
        ownerId: userId
      },
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
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Load grades for all pages
    const pagesWithGrades = await Promise.all(
      file.pages.map(async (page: any) => {
        const grades = await prisma.gradeValue.findMany({
          where: { pageId: page.id }
        })

        const attendanceRecords = page.type === 'attendance'
          ? await prisma.attendanceRecord.findMany({
              where: { pageId: page.id }
            })
          : []

        return {
          ...page,
          grades: grades.map((g: any) => ({
            id: g.id,
            columnId: g.columnId,
            studentId: g.studentId,
            value: g.value
          })),
          attendanceRecords: attendanceRecords.map((a: any) => ({
            id: a.id,
            studentId: a.studentId,
            date: a.date,
            status: a.status
          }))
        }
      })
    )

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
      pages: pagesWithGrades.map((page: any) => ({
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
        grades: page.grades,
        attendanceRecords: page.attendanceRecords
      }))
    }

    return NextResponse.json({ file: transformedFile })
  } catch (error: any) {
    console.error('Get file error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get file' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { name, description, students, pages } = body

    // Verify ownership
    const existingFile = await prisma.gradeFile.findFirst({
      where: {
        id: fileId,
        ownerId: userId
      }
    })

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Update file
    const file = await prisma.gradeFile.update({
      where: { id: fileId },
      data: {
        name,
        description,
        updatedAt: new Date()
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

    // Update students if provided
    if (students) {
      // Delete existing students
      await prisma.student.deleteMany({
        where: { fileId: fileId }
      })

      // Create new students
      if (students.length > 0) {
        await prisma.student.createMany({
          data: students.map((s: any) => ({
            fileId: fileId,
            name: s.name,
            studentId: s.studentId
          }))
        })
      }
    }

    // Update pages if provided
    if (pages) {
      // This is complex - for now, we'll handle it in a separate endpoint
      // For full implementation, you'd need to sync pages, columns, grades, etc.
    }

    return NextResponse.json({ 
      file: {
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
    })
  } catch (error: any) {
    console.error('Update file error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update file' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const file = await prisma.gradeFile.findFirst({
      where: {
        id: fileId,
        ownerId: userId
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete file (cascade will delete related records)
    await prisma.gradeFile.delete({
      where: { id: fileId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete file' },
      { status: 500 }
    )
  }
}

