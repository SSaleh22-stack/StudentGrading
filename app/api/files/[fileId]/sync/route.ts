import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'
import { GradeFile } from '@/lib/types'

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
    const file: GradeFile = body.file

    // Verify ownership
    const existingFile = await prisma.gradeFile.findFirst({
      where: {
        id: params.fileId,
        ownerId: userId
      }
    })

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Update file basic info
    await prisma.gradeFile.update({
      where: { id: params.fileId },
      data: {
        name: file.name,
        description: file.description,
        updatedAt: new Date()
      }
    })

    // Sync students
    if (file.students) {
      const existingStudents = await prisma.student.findMany({
        where: { fileId: params.fileId }
      })

      const existingStudentIds = new Set(existingStudents.map(s => s.id))
      const newStudentIds = new Set(file.students.map(s => s.id))

      // Delete removed students
      const toDelete = existingStudents.filter(s => !newStudentIds.has(s.id))
      if (toDelete.length > 0) {
        await prisma.student.deleteMany({
          where: {
            id: { in: toDelete.map(s => s.id) }
          }
        })
      }

      // Create or update students
      for (const student of file.students) {
        if (existingStudentIds.has(student.id)) {
          await prisma.student.update({
            where: { id: student.id },
            data: {
              name: student.name,
              studentId: student.studentId
            }
          })
        } else {
          await prisma.student.create({
            data: {
              id: student.id,
              fileId: params.fileId,
              name: student.name,
              studentId: student.studentId
            }
          })
        }
      }
    }

    // Sync pages, columns, grades, and attendance
    if (file.pages) {
      for (const page of file.pages) {
        // Update or create page
        await prisma.page.upsert({
          where: { id: page.id },
          update: {
            name: page.name,
            type: page.type,
            updatedAt: new Date()
          },
          create: {
            id: page.id,
            fileId: params.fileId,
            name: page.name,
            type: page.type
          }
        })

        // Sync columns
        if (page.columns) {
          const existingColumns = await prisma.column.findMany({
            where: { pageId: page.id }
          })
          const existingColumnIds = new Set(existingColumns.map(c => c.id))
          const newColumnIds = new Set(page.columns.map(c => c.id))

          // Delete removed columns
          const toDelete = existingColumns.filter(c => !newColumnIds.has(c.id))
          if (toDelete.length > 0) {
            await prisma.column.deleteMany({
              where: {
                id: { in: toDelete.map(c => c.id) }
              }
            })
          }

          // Create or update columns
          for (const column of page.columns) {
            await prisma.column.upsert({
              where: { id: column.id },
              update: {
                title: column.title,
                type: column.type,
                order: column.order,
                pinned: column.pinned,
                sourceColumns: column.sourceColumns as any,
                roundTo: column.roundTo
              },
              create: {
                id: column.id,
                pageId: page.id,
                title: column.title,
                type: column.type,
                order: column.order,
                pinned: column.pinned,
                sourceColumns: column.sourceColumns as any,
                roundTo: column.roundTo
              }
            })
          }
        }

        // Sync grades
        if (page.grades) {
          // Delete all existing grades for this page
          await prisma.gradeValue.deleteMany({
            where: { pageId: page.id }
          })

          // Create new grades
          if (page.grades.length > 0) {
            await prisma.gradeValue.createMany({
              data: page.grades.map((g: any) => ({
                pageId: page.id,
                studentId: g.studentId,
                columnId: g.columnId,
                value: g.value
              }))
            })
          }
        }

        // Sync attendance records
        if (page.type === 'attendance' && (page as any).attendanceRecords) {
          const attendanceRecords = (page as any).attendanceRecords

          // Delete all existing attendance records for this page
          await prisma.attendanceRecord.deleteMany({
            where: { pageId: page.id }
          })

          // Create new attendance records
          if (attendanceRecords.length > 0) {
            await prisma.attendanceRecord.createMany({
              data: attendanceRecords.map((a: any) => ({
                pageId: page.id,
                studentId: a.studentId,
                date: a.date,
                status: a.status
              }))
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Sync file error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync file' },
      { status: 500 }
    )
  }
}

