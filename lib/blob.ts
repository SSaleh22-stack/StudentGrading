// Vercel Blob storage utilities

import { put, list, del, head } from '@vercel/blob'

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

if (!BLOB_READ_WRITE_TOKEN) {
  console.warn('BLOB_READ_WRITE_TOKEN is not set. Blob storage features will be disabled.')
}

/**
 * Upload a file to Vercel Blob storage
 * @param filename - The name/path for the file
 * @param content - File content (string, Buffer, or Blob)
 * @param contentType - MIME type (e.g., 'text/csv', 'application/pdf')
 * @returns The URL of the uploaded file
 */
export async function uploadFile(
  filename: string,
  content: string | Buffer | Blob,
  contentType?: string
): Promise<string> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error('Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN.')
  }

  try {
    const blob = await put(filename, content, {
      access: 'public',
      contentType,
      token: BLOB_READ_WRITE_TOKEN,
    })
    return blob.url
  } catch (error) {
    console.error('Error uploading file to blob storage:', error)
    throw error
  }
}

/**
 * List files in blob storage (with optional prefix filter)
 * @param prefix - Optional prefix to filter files
 * @returns Array of blob metadata
 */
export async function listFiles(prefix?: string) {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error('Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN.')
  }

  try {
    const { blobs } = await list({
      prefix,
      token: BLOB_READ_WRITE_TOKEN,
    })
    return blobs
  } catch (error) {
    console.error('Error listing files from blob storage:', error)
    throw error
  }
}

/**
 * Delete a file from blob storage
 * @param url - The URL of the file to delete
 */
export async function deleteFile(url: string) {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error('Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN.')
  }

  try {
    await del(url, {
      token: BLOB_READ_WRITE_TOKEN,
    })
  } catch (error) {
    console.error('Error deleting file from blob storage:', error)
    throw error
  }
}

/**
 * Get file metadata
 * @param url - The URL of the file
 */
export async function getFileInfo(url: string) {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error('Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN.')
  }

  try {
    const blob = await head(url, {
      token: BLOB_READ_WRITE_TOKEN,
    })
    return blob
  } catch (error) {
    console.error('Error getting file info from blob storage:', error)
    throw error
  }
}

/**
 * Upload a grade file export (CSV or PDF)
 * @param fileId - The grade file ID
 * @param content - File content
 * @param type - 'csv' or 'pdf'
 * @param pageId - Optional page ID if exporting a specific page
 * @returns The URL of the uploaded file
 */
export async function uploadGradeExport(
  fileId: string,
  content: string | Buffer | Blob,
  type: 'csv' | 'pdf',
  pageId?: string
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = pageId
    ? `exports/${fileId}/${pageId}_${timestamp}.${type}`
    : `exports/${fileId}/full_${timestamp}.${type}`
  
  const contentType = type === 'csv' ? 'text/csv' : 'application/pdf'
  
  return uploadFile(filename, content, contentType)
}

/**
 * Upload a backup of a grade file
 * @param fileId - The grade file ID
 * @param content - JSON content of the file
 * @returns The URL of the uploaded backup
 */
export async function uploadBackup(
  fileId: string,
  content: string | Buffer
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backups/${fileId}/backup_${timestamp}.json`
  
  return uploadFile(filename, content, 'application/json')
}

