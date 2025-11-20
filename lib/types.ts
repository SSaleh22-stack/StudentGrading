// Core TypeScript types for the Student Grading application

export type ColumnType = "input" | "sum" | "max" | "average" | "round";
export type PageType = "grading" | "attendance";

export interface Column {
  id: string;
  title: string;
  type: ColumnType;
  // For sum/max/average columns, store which columns are included in the calculation
  sourceColumnIds?: string[];
  // For round column, store rounding type (0.25, 0.5, 0.75, or 1.0)
  roundTo?: 0.25 | 0.5 | 0.75 | 1.0;
  // Column order for sorting
  order?: number;
  // Pin column to keep it in place
  pinned?: boolean;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  // Allow additional fields from CSV imports
  [key: string]: string | number | undefined;
}

export interface GradeValue {
  columnId: string;
  studentId: string;
  value: number | null;
}

export interface Page {
  id: string;
  name: string;
  type: PageType;
  columns: Column[];
  grades: GradeValue[];
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = "present" | "absent" | "excused";

export interface AttendanceRecord {
  date: string; // ISO date string
  studentId: string;
  status: AttendanceStatus;
}

export interface AttendancePage extends Page {
  type: "attendance";
  attendanceRecords: AttendanceRecord[];
}

export interface GradeFile {
  id: string;
  owner: string; // For now, just a user identifier
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  students: Student[];
  pages: Page[]; // Multiple pages/sheets in one file
  // Legacy support - if pages is empty, use these
  columns?: Column[];
  grades?: GradeValue[];
}

