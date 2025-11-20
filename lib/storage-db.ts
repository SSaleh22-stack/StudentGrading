// Database-backed storage utilities (replaces lib/storage.ts)
// This file provides the same interface as storage.ts but uses the API

import { GradeFile } from './types'
import { api, getCurrentUserId } from './api'

// Keep localStorage as fallback for migration period
const STORAGE_KEY = 'studentGrading_files'
const USER_KEY = 'currentUser'

export async function getCurrentUser(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  
  // Try to get from API first
  try {
    const userData = await api.getCurrentUser()
    if (userData?.user) {
      return userData.user.id
    }
  } catch {
    // Fallback to localStorage
  }
  
  return localStorage.getItem(USER_KEY) || localStorage.getItem('userEmail')
}

export function setCurrentUser(email: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, email)
}

export async function getAllFiles(): Promise<GradeFile[]> {
  try {
    return await api.getFiles()
  } catch (error) {
    console.error('Failed to fetch files from API, using localStorage fallback:', error)
    // Fallback to localStorage
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
}

export async function getFilesByOwner(owner: string): Promise<GradeFile[]> {
  const allFiles = await getAllFiles()
  return allFiles.filter((file) => file.owner === owner)
}

export async function getLatestFiles(owner: string, count: number = 4): Promise<GradeFile[]> {
  const files = await getFilesByOwner(owner)
  return files
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, count)
}

export async function getFileById(id: string): Promise<GradeFile | null> {
  try {
    return await api.getFile(id)
  } catch (error) {
    console.error('Failed to fetch file from API, using localStorage fallback:', error)
    // Fallback to localStorage
    const allFiles = await getAllFiles()
    const file = allFiles.find((file) => file.id === id) || null
    if (file) {
      return migrateFile(file)
    }
    return null
  }
}

export async function saveFile(file: GradeFile): Promise<void> {
  try {
    // Use sync endpoint to save the entire file structure
    await api.syncFile(file.id, file)
    
    // Also update localStorage as backup
    if (typeof window !== 'undefined') {
      const allFiles = await getAllFiles()
      const existingIndex = allFiles.findIndex((f) => f.id === file.id)
      
      if (existingIndex >= 0) {
        allFiles[existingIndex] = file
      } else {
        allFiles.push(file)
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles))
    }
  } catch (error) {
    console.error('Failed to save file to API, using localStorage fallback:', error)
    // Fallback to localStorage
    if (typeof window === 'undefined') return
    const allFiles = await getAllFiles()
    const existingIndex = allFiles.findIndex((f) => f.id === file.id)
    
    if (existingIndex >= 0) {
      allFiles[existingIndex] = file
    } else {
      allFiles.push(file)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles))
  }
}

export async function deleteFile(id: string): Promise<void> {
  try {
    await api.deleteFile(id)
    
    // Also remove from localStorage
    if (typeof window !== 'undefined') {
      const allFiles = await getAllFiles()
      const filtered = allFiles.filter((f) => f.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    }
  } catch (error) {
    console.error('Failed to delete file from API, using localStorage fallback:', error)
    // Fallback to localStorage
    if (typeof window === 'undefined') return
    const allFiles = await getAllFiles()
    const filtered = allFiles.filter((f) => f.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }
}

export async function createNewFile(
  name: string,
  owner: string,
  description?: string
): Promise<GradeFile> {
  try {
    const file = await api.createFile({
      name,
      description,
      students: []
    })
    return file
  } catch (error) {
    console.error('Failed to create file via API, using localStorage fallback:', error)
    // Fallback to localStorage
    const now = new Date().toISOString()
    const newFile: GradeFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      owner,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      students: [],
      pages: [],
    }
    await saveFile(newFile)
    return newFile
  }
}

// Migration helper: convert old file format to new format
import { Page } from './types'
export function migrateFile(file: GradeFile): GradeFile {
  if (file.pages && file.pages.length > 0) {
    return file // Already migrated
  }

  // Migrate old format to new format
  const defaultPage: Page = {
    id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Grading',
    type: 'grading',
    columns: file.columns || [],
    grades: file.grades || [],
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  }

  return {
    ...file,
    pages: [defaultPage],
    columns: undefined,
    grades: undefined,
  }
}

