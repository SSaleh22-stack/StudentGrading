# Vercel Blob Storage Setup

This project now supports Vercel Blob storage for storing file exports and backups.

## Setup

1. **Add your Blob token to environment variables:**

   Create or update `.env.local`:
   ```env
   BLOB_READ_WRITE_TOKEN="your_vercel_blob_token_here"
   ```

2. **The token is already configured:**
   ```
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_s2Ak7AHRQGORsBsS_fDFSxYImQLXVd4mXnNWwRf6omtrdGZ"
   ```

## Features

### File Exports
- CSV exports can be automatically uploaded to blob storage
- PDF exports can be stored in blob storage
- Files are organized by file ID and page ID
- Timestamped filenames for version tracking

### Backups
- Create JSON backups of entire grade files
- Automatic timestamping
- Organized by file ID

## Usage

### In Components

The blob storage is integrated into the download functions. To enable automatic upload:

```typescript
import { downloadPageAsCSVWithUpload } from '@/lib/download-with-blob'

// Download and upload to blob
await downloadPageAsCSVWithUpload(
  file,
  page,
  students,
  columns,
  grades,
  true // Set to true to upload to blob storage
)
```

### API Routes

The following API routes are available:

- `POST /api/files/[fileId]/export` - Upload an export (CSV/PDF)
- `POST /api/files/[fileId]/backup` - Create a backup

### Direct Blob Functions

```typescript
import { uploadFile, uploadGradeExport, uploadBackup } from '@/lib/blob'

// Upload any file
const url = await uploadFile('path/to/file.csv', csvContent, 'text/csv')

// Upload grade export
const url = await uploadGradeExport(fileId, csvContent, 'csv', pageId)

// Upload backup
const url = await uploadBackup(fileId, jsonContent)
```

## File Organization

Files are stored with the following structure:

```
exports/
  {fileId}/
    {pageId}_{timestamp}.csv
    full_{timestamp}.csv
    {pageId}_{timestamp}.pdf

backups/
  {fileId}/
    backup_{timestamp}.json
```

## Security

- All files are stored as public (accessible via URL)
- File ownership is verified before upload
- Only authenticated users can upload files
- Files are associated with the user's file ID

## Notes

- Blob storage is optional - the app works without it
- If `BLOB_READ_WRITE_TOKEN` is not set, blob features are disabled
- Local downloads still work even if blob upload fails
- Blob storage is useful for:
  - Sharing exports with others
  - Long-term backup storage
  - Accessing files from multiple devices
  - Integration with other services

