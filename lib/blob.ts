// Vercel Blob storage utilities
// Blob storage functionality removed - using localStorage instead
// This file is kept for API route compatibility but doesn't use @vercel/blob

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
  // Stub implementation - blob storage not used with localStorage
  throw new Error('Blob storage is not available. Using localStorage instead.')
}

/**
 * List files in blob storage (with optional prefix filter)
 * @param prefix - Optional prefix to filter files
 * @returns Array of blob metadata
 */
export async function listFiles(prefix?: string) {
  // Stub implementation - blob storage not used with localStorage
  return []
}

/**
 * Delete a file from blob storage
 * @param url - The URL of the file to delete
 */
export async function deleteFile(url: string) {
  // Stub implementation - blob storage not used with localStorage
}

/**
 * Get file metadata
 * @param url - The URL of the file
 */
export async function getFileInfo(url: string) {
  // Stub implementation - blob storage not used with localStorage
  return null
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
  // Stub implementation - blob storage not used with localStorage
  throw new Error('Blob storage is not available. Using localStorage instead.')
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
  // Stub implementation - blob storage not used with localStorage
  throw new Error('Blob storage is not available. Using localStorage instead.')
}

