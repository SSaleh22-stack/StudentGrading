// Local storage utilities for managing grade files

import { GradeFile, Page } from "./types";

const STORAGE_KEY = "studentGrading_files";
const USER_KEY = "currentUser";

export function getCurrentUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_KEY) || localStorage.getItem("userEmail");
}

export function setCurrentUser(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, email);
}

export function getAllFiles(): GradeFile[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getFilesByOwner(owner: string): GradeFile[] {
  const allFiles = getAllFiles();
  return allFiles.filter((file) => file.owner === owner);
}

export function getLatestFiles(owner: string, count: number = 4): GradeFile[] {
  const files = getFilesByOwner(owner);
  // Sort by updatedAt (most recent first)
  return files
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, count);
}

export function getFileById(id: string): GradeFile | null {
  const allFiles = getAllFiles();
  const file = allFiles.find((file) => file.id === id) || null;
  if (file) {
    return migrateFile(file);
  }
  return null;
}

export function saveFile(file: GradeFile): void {
  if (typeof window === "undefined") return;
  const allFiles = getAllFiles();
  const existingIndex = allFiles.findIndex((f) => f.id === file.id);
  
  if (existingIndex >= 0) {
    allFiles[existingIndex] = file;
  } else {
    allFiles.push(file);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
}

export function deleteFile(id: string): void {
  if (typeof window === "undefined") return;
  const allFiles = getAllFiles();
  const filtered = allFiles.filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function createNewFile(
  name: string,
  owner: string,
  description?: string
): GradeFile {
  const now = new Date().toISOString();
  const newFile: GradeFile = {
    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    owner,
    name,
    description,
    createdAt: now,
    updatedAt: now,
    students: [],
    pages: [], // Will be populated by the wizard
  };
  saveFile(newFile);
  return newFile;
}

// Migration helper: convert old file format to new format
export function migrateFile(file: GradeFile): GradeFile {
  if (file.pages && file.pages.length > 0) {
    return file; // Already migrated
  }

  // Migrate old format to new format
  const defaultPage: Page = {
    id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: "Grading",
    type: "grading",
    columns: file.columns || [],
    grades: file.grades || [],
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };

  return {
    ...file,
    pages: [defaultPage],
    columns: undefined,
    grades: undefined,
  };
}

