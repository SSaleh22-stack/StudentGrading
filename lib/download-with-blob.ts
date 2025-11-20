// Enhanced download functions with optional blob storage upload

import { downloadPageAsCSV, downloadFileAsCSV, downloadAttendanceAsCSV, generatePDFContent } from './download'
import { api } from './api'
import { GradeFile, Page, Student, Column, GradeValue, AttendanceRecord } from './types'

/**
 * Download CSV and optionally upload to blob storage
 */
export async function downloadPageAsCSVWithUpload(
  file: GradeFile,
  page: Page,
  students: Student[],
  columns: Column[],
  grades: GradeValue[],
  uploadToBlob: boolean = false
) {
  // Generate CSV content
  const sortedColumns = [...columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const headers = ['Student Name', 'Student ID', ...sortedColumns.map((col) => col.title)]
  const csvRows = [headers.join(',')]

  students.forEach((student) => {
    const row = [
      `"${student.name}"`,
      `"${student.studentId}"`,
      ...sortedColumns.map((col) => {
        const grade = grades.find(
          (g) => g.columnId === col.id && g.studentId === student.id
        )
        return grade?.value !== null && grade?.value !== undefined
          ? grade.value.toString()
          : ''
      }),
    ]
    csvRows.push(row.join(','))
  })

  const csvContent = csvRows.join('\n')

  // Download locally
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${file.name}_${page.name}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Upload to blob storage if requested
  if (uploadToBlob) {
    try {
      const blobUrl = await api.uploadExport(file.id, csvContent, 'csv', page.id)
      console.log('File uploaded to blob storage:', blobUrl)
      return blobUrl
    } catch (error) {
      console.error('Failed to upload to blob storage:', error)
      // Don't throw - local download already succeeded
    }
  }
}

/**
 * Download attendance CSV and optionally upload to blob storage
 */
export async function downloadAttendanceAsCSVWithUpload(
  file: GradeFile,
  page: Page,
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  date: string,
  uploadToBlob: boolean = false
) {
  const headers = ['Student Name', 'Student ID', 'Status']
  const csvRows = [headers.join(',')]

  students.forEach((student) => {
    const record = attendanceRecords.find(
      (r) => r.studentId === student.id && r.date === date
    )
    const status = record?.status || 'Not Marked'
    const row = [`"${student.name}"`, `"${student.studentId}"`, `"${status}"`]
    csvRows.push(row.join(','))
  })

  const csvContent = csvRows.join('\n')

  // Download locally
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${file.name}_${page.name}_${date}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Upload to blob storage if requested
  if (uploadToBlob) {
    try {
      const blobUrl = await api.uploadExport(file.id, csvContent, 'csv', page.id)
      console.log('File uploaded to blob storage:', blobUrl)
      return blobUrl
    } catch (error) {
      console.error('Failed to upload to blob storage:', error)
    }
  }
}

/**
 * Create a backup of a file and optionally upload to blob storage
 */
export async function createBackup(
  file: GradeFile,
  uploadToBlob: boolean = false
): Promise<string | null> {
  const backupData = {
    file,
    timestamp: new Date().toISOString(),
    version: '1.0',
  }

  // Download locally as JSON
  const jsonContent = JSON.stringify(backupData, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${file.name}_backup_${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Upload to blob storage if requested
  if (uploadToBlob) {
    try {
      const blobUrl = await api.uploadBackup(file.id, backupData)
      console.log('Backup uploaded to blob storage:', blobUrl)
      return blobUrl
    } catch (error) {
      console.error('Failed to upload backup to blob storage:', error)
      return null
    }
  }

  return null
}

