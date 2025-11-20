"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { GradeFile, Column, Student, GradeValue, Page } from "@/lib/types";
import GradeCell from "./GradeCell";
import ColumnHeader from "./ColumnHeader";
import AddColumnModal from "./AddColumnModal";
import AddMultipleColumnsModal from "./AddMultipleColumnsModal";
import Button from "../ui/Button";
import { saveFile } from "@/lib/storage";
import { downloadPageAsCSV, generatePDFContent } from "@/lib/download";
import { hasActiveSubscription } from "@/lib/subscription";
import { useRouter } from "next/navigation";

interface GradeTableProps {
  file: GradeFile;
  page: Page;
  onFileUpdate: (updatedFile: GradeFile) => void;
}

export default function GradeTable({
  file,
  page,
  onFileUpdate,
}: GradeTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>(page.columns || []);
  const [students, setStudents] = useState<Student[]>(file.students);
  const [grades, setGrades] = useState<GradeValue[]>(page.grades || []);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isAddMultipleColumnsOpen, setIsAddMultipleColumnsOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [studentSortBy, setStudentSortBy] = useState<"name" | "id" | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [showColumnActions, setShowColumnActions] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const isInitialMount = useRef(true);
  
  const hasSubscription = hasActiveSubscription();
  
  const checkSubscription = () => {
    if (!hasActiveSubscription()) {
      alert(t("subscription.needSubscription"));
      router.push("/pricing");
      return false;
    }
    return true;
  };

  // Calculate computed values for sum/max columns
  const getComputedValue = useCallback(
    (column: Column, studentId: string): number | null => {
      if (column.type === "input") {
        const grade = grades.find(
          (g) => g.columnId === column.id && g.studentId === studentId
        );
        return grade?.value ?? null;
      }

      if (
        column.type === "sum" ||
        column.type === "max" ||
        column.type === "average"
      ) {
        if (!column.sourceColumnIds || column.sourceColumnIds.length === 0) {
          return null;
        }

        const values = column.sourceColumnIds
          .map((sourceId) => {
            const grade = grades.find(
              (g) => g.columnId === sourceId && g.studentId === studentId
            );
            return grade?.value;
          })
          .filter((v): v is number => v !== null && v !== undefined);

        if (values.length === 0) return null;

        if (column.type === "sum") {
          return values.reduce((sum, val) => sum + val, 0);
        } else if (column.type === "max") {
          return Math.max(...values);
        } else if (column.type === "average") {
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        }
      }

      if (column.type === "round") {
        if (!column.sourceColumnIds || column.sourceColumnIds.length === 0) {
          return null;
        }

        const sourceId = column.sourceColumnIds[0];
        const grade = grades.find(
          (g) => g.columnId === sourceId && g.studentId === studentId
        );

        if (grade?.value === null || grade?.value === undefined) {
          return null;
        }

        const roundTo = column.roundTo ?? 1.0;
        return Math.round(grade.value / roundTo) * roundTo;
      }

      return null;
    },
    [grades]
  );

  // Auto-save function with debouncing
  const handleAutoSave = useCallback(() => {
    setSaveStatus("saving");

    // Update the current page
    const updatedPages = file.pages?.map((p) =>
      p.id === page.id
        ? {
            ...p,
            columns,
            grades,
            updatedAt: new Date().toISOString(),
          }
        : p
    ) || [];

    const updatedFile: GradeFile = {
      ...file,
      students,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    saveFile(updatedFile);
    onFileUpdate(updatedFile);

    setTimeout(() => {
      setSaveStatus("saved");
    }, 500);
  }, [
    file,
    page.id,
    columns,
    students,
    grades,
    onFileUpdate,
  ]);

  // Update when page changes
  useEffect(() => {
    const cols = page.columns || [];
    // Ensure all columns have order values
    const orderedCols = cols.map((col, idx) => ({
      ...col,
      order: col.order ?? idx,
    }));
    setColumns(orderedCols);
    setGrades(page.grades || []);
    isInitialMount.current = true;
  }, [page.id, page.columns, page.grades]);

  // Debounced auto-save
  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    setSaveStatus("unsaved");

    const timeout = setTimeout(() => {
      handleAutoSave();
    }, 1000); // 1 second debounce

    setAutoSaveTimeout(timeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [columns, students, grades]);

  // Manual save
  const handleManualSave = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    handleAutoSave();
  };

  // Update grade value
  const handleGradeChange = (
    columnId: string,
    studentId: string,
    value: number | null
  ) => {
    if (!checkSubscription()) return;
    
    setGrades((prev) => {
      const existing = prev.findIndex(
        (g) => g.columnId === columnId && g.studentId === studentId
      );

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { columnId, studentId, value };
        return updated;
      } else {
        return [...prev, { columnId, studentId, value }];
      }
    });
  };

  // Add new column
  const handleAddColumn = (column: Column) => {
    if (!checkSubscription()) return;
    
    const maxOrder = Math.max(...columns.map((c) => c.order || 0), -1);
    const newColumn = { ...column, order: maxOrder + 1 };
    setColumns([...columns, newColumn]);
    setIsAddColumnOpen(false);
  };

  // Sort columns by order (pinned columns stay at their position)
  const sortedColumns = [...columns].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    // Pinned columns maintain their order relative to each other
    // Unpinned columns can be reordered but pinned ones stay fixed
    return orderA - orderB;
  });

  // Sort students
  const sortedStudents = [...students].sort((a, b) => {
    if (!studentSortBy) return 0;
    if (studentSortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (studentSortBy === "id") {
      return a.studentId.localeCompare(b.studentId);
    }
    return 0;
  });

  // Reorder columns
  const handleMoveColumn = (columnId: string, direction: "up" | "down") => {
    if (!checkSubscription()) return;
    
    const currentIndex = sortedColumns.findIndex((c) => c.id === columnId);
    if (currentIndex === -1) return;

    const column = sortedColumns[currentIndex];
    // Don't move pinned columns
    if (column.pinned) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedColumns.length) return;

    // Don't move past pinned columns
    if (sortedColumns[newIndex].pinned) return;

    const newColumns = [...sortedColumns];
    [newColumns[currentIndex], newColumns[newIndex]] = [
      newColumns[newIndex],
      newColumns[currentIndex],
    ];

    // Update order values
    newColumns.forEach((col, idx) => {
      col.order = idx;
    });

    setColumns(newColumns);
  };

  // Update column
  const handleUpdateColumn = (updatedColumn: Column) => {
    if (!checkSubscription()) return;
    
    setColumns((prev) =>
      prev.map((col) => (col.id === updatedColumn.id ? updatedColumn : col))
    );
    setEditingColumn(null);
  };

  // Delete column
  const handleDeleteColumn = (columnId: string) => {
    if (!checkSubscription()) return;
    
    if (
      !confirm(
        t("grading.confirmDeleteColumn")
      )
    ) {
      return;
    }

    setColumns((prev) => prev.filter((col) => col.id !== columnId));
    setGrades((prev) => prev.filter((g) => g.columnId !== columnId));
  };

  // Delete multiple columns
  const handleDeleteSelectedColumns = () => {
    if (!checkSubscription()) return;
    
    if (selectedColumns.size === 0) return;
    if (
      !confirm(
        t("grading.confirmDeleteColumns", { count: selectedColumns.size })
      )
    ) {
      return;
    }

    setColumns((prev) =>
      prev.filter((col) => !selectedColumns.has(col.id))
    );
    setGrades((prev) =>
      prev.filter((g) => !selectedColumns.has(g.columnId))
    );
    setSelectedColumns(new Set());
    // Keep selection mode open for multiple actions
  };

  // Pin/unpin columns
  const handlePinColumns = () => {
    if (!checkSubscription()) return;
    
    setColumns((prev) =>
      prev.map((col) =>
        selectedColumns.has(col.id) ? { ...col, pinned: !col.pinned } : col
      )
    );
    // Keep selection mode open for multiple actions
  };

  // Move selected columns
  const handleMoveSelectedColumns = (direction: "left" | "right") => {
    if (!checkSubscription()) return;
    
    const selectedArray = Array.from(selectedColumns);
    if (selectedArray.length === 0) return;

    const newColumns = [...sortedColumns];
    const indices = selectedArray
      .map((id) => newColumns.findIndex((c) => c.id === id))
      .filter((idx) => idx !== -1 && !newColumns[idx].pinned); // Exclude pinned columns

    if (indices.length === 0) return;

    if (direction === "left") {
      // Move left (decrease order)
      indices.forEach((idx) => {
        if (idx > 0 && !newColumns[idx - 1].pinned) {
          [newColumns[idx], newColumns[idx - 1]] = [
            newColumns[idx - 1],
            newColumns[idx],
          ];
        }
      });
    } else {
      // Move right (increase order)
      for (let i = indices.length - 1; i >= 0; i--) {
        const idx = indices[i];
        if (idx < newColumns.length - 1 && !newColumns[idx + 1].pinned) {
          [newColumns[idx], newColumns[idx + 1]] = [
            newColumns[idx + 1],
            newColumns[idx],
          ];
        }
      }
    }

    // Update order values
    newColumns.forEach((col, idx) => {
      col.order = idx;
    });

    setColumns(newColumns);
    // Keep selection mode open for multiple actions
  };

  // Toggle column selection
  const toggleColumnSelection = (columnId: string) => {
    setSelectedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  // Enter selection mode
  const enterSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedColumns(new Set());
  };

  // Exit selection mode
  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedColumns(new Set());
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (checkSubscription()) setIsAddColumnOpen(true);
              }}
              disabled={!hasSubscription}
            >
              + {t("grading.addColumn")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (checkSubscription()) setIsAddMultipleColumnsOpen(true);
              }}
              disabled={!hasSubscription}
            >
              + {t("grading.addMultipleColumns")}
            </Button>
            {!isSelectionMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (checkSubscription()) enterSelectionMode();
                }}
                disabled={!hasSubscription}
              >
                {t("grading.selectColumns")}
              </Button>
            )}
            <div className="text-sm text-gray-600">
              {columns.length} {columns.length === 1 ? t("grading.column") : t("grading.columns")} •{" "}
              {students.length} {students.length === 1 ? t("grading.student") : t("grading.students")}
            </div>
            {selectedColumns.size > 0 && (
              <div className="text-sm text-blue-600 font-medium">
                {selectedColumns.size} {t("grading.selected")}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Student Sort */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm text-gray-600">{t("grading.sort")}:</span>
              <select
                value={studentSortBy || ""}
                onChange={(e) =>
                  setStudentSortBy(
                    (e.target.value as "name" | "id" | null) || null
                  )
                }
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("grading.default")}</option>
                <option value="name">{t("grading.nameAZ")}</option>
                <option value="id">{t("grading.idAZ")}</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {saveStatus === "saving" && (
                <span className="text-blue-600">{t("grading.saving")}</span>
              )}
              {saveStatus === "saved" && (
                <span className="text-green-600">{t("grading.saved")}</span>
              )}
              {saveStatus === "unsaved" && (
                <span className="text-orange-600">{t("grading.unsaved")}</span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleManualSave}>
              {t("common.save")}
            </Button>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  downloadPageAsCSV(file, page, students, columns, grades);
                }}
              >
                {t("common.download")} CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const content = generatePDFContent(
                    file,
                    page,
                    students,
                    columns,
                    grades,
                    "grading"
                  );
                  const printWindow = window.open("", "_blank");
                  if (printWindow) {
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>${file.name}_${page.name}.pdf</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; font-weight: bold; }
                            @media print { body { margin: 0; } @page { margin: 1cm; } }
                          </style>
                        </head>
                        <body>${content}</body>
                      </html>
                    `);
                    printWindow.document.close();
                    setTimeout(() => printWindow.print(), 250);
                  }
                }}
              >
                {t("common.download")} PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Selection Mode Bar with Actions */}
        {isSelectionMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-sm font-medium text-blue-900">
              {selectedColumns.size > 0
                ? `${selectedColumns.size} ${selectedColumns.size === 1 ? t("grading.column") : t("grading.columns")} ${t("grading.selected")}`
                : t("grading.selectColumnsToPerformActions")}
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {selectedColumns.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveSelectedColumns("left")}
                  >
                    ← {t("grading.moveLeft")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveSelectedColumns("right")}
                  >
                    {t("grading.moveRight")} →
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePinColumns}
                  >
                    {sortedColumns
                      .filter((c) => selectedColumns.has(c.id))
                      .every((c) => c.pinned)
                      ? t("grading.unpin")
                      : t("grading.pin")}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDeleteSelectedColumns}
                  >
                    {t("common.delete")}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={exitSelectionMode}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>

              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                {/* Student Info Column */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200 min-w-[120px] rtl:left-auto rtl:right-0">
                  {t("grading.student")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-[120px] bg-gray-50 z-10 border-r border-gray-200 min-w-[100px] rtl:left-auto rtl:right-[120px]">
                  {t("grading.id")}
                </th>

                {/* Grade Columns */}
                {sortedColumns.map((column, index) => (
                  <th
                    key={column.id}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative group ${
                      isSelectionMode && selectedColumns.has(column.id)
                        ? "bg-blue-100 border-2 border-blue-500"
                        : ""
                    } ${column.pinned ? "bg-yellow-50" : ""}`}
                  >
                    <div className="flex items-center space-x-2">
                      {isSelectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedColumns.has(column.id)}
                          onChange={() => toggleColumnSelection(column.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1">
                        <ColumnHeader
                          column={column}
                          onEdit={() => setEditingColumn(column)}
                          onDelete={() => handleDeleteColumn(column.id)}
                          onMoveUp={() => handleMoveColumn(column.id, "up")}
                          onMoveDown={() => handleMoveColumn(column.id, "down")}
                          canMoveUp={index > 0}
                          canMoveDown={index < sortedColumns.length - 1}
                          computedValue={getComputedValue}
                          students={students}
                        />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  {/* Student Name */}
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200 min-w-[120px]">
                    {student.name}
                  </td>
                  {/* Student ID */}
                  <td className="px-4 py-3 text-sm text-gray-500 sticky left-[120px] bg-white z-10 border-r border-gray-200 min-w-[100px]">
                    {student.studentId}
                  </td>

                  {/* Grade Cells */}
                  {sortedColumns.map((column, colIndex) => {
                    const value =
                      column.type === "input"
                        ? grades.find(
                            (g) =>
                              g.columnId === column.id &&
                              g.studentId === student.id
                          )?.value ?? null
                        : getComputedValue(column, student.id);

                    const studentIndex = sortedStudents.findIndex(
                      (s) => s.id === student.id
                    );

                    const handleNavigate = (
                      direction: "up" | "down" | "left" | "right"
                    ) => {
                      let newStudentIndex = studentIndex;
                      let newColIndex = colIndex;

                      if (direction === "up") {
                        newStudentIndex = Math.max(0, studentIndex - 1);
                      } else if (direction === "down") {
                        newStudentIndex = Math.min(
                          sortedStudents.length - 1,
                          studentIndex + 1
                        );
                      } else if (direction === "left") {
                        newColIndex = Math.max(0, colIndex - 1);
                      } else if (direction === "right") {
                        newColIndex = Math.min(
                          sortedColumns.length - 1,
                          colIndex + 1
                        );
                      }

                      // Find the new cell and focus it
                      const newStudent = sortedStudents[newStudentIndex];
                      const newColumn = sortedColumns[newColIndex];

                      if (newStudent && newColumn && newColumn.type === "input") {
                        // Use a small delay to ensure the DOM is updated
                        setTimeout(() => {
                          const cellId = `cell-${newColumn.id}-${newStudent.id}`;
                          const cell = document.getElementById(cellId);
                          if (cell) {
                            const input = cell.querySelector("input");
                            if (input) {
                              input.focus();
                              input.select();
                            }
                          }
                        }, 10);
                      }
                    };

                    return (
                      <td
                        key={`${column.id}-${student.id}`}
                        id={`cell-${column.id}-${student.id}`}
                        className="px-4 py-2 text-sm"
                      >
                        <GradeCell
                          column={column}
                          studentId={student.id}
                          value={value}
                          onChange={(newValue) =>
                            handleGradeChange(column.id, student.id, newValue)
                          }
                          onNavigate={column.type === "input" ? handleNavigate : undefined}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Column Modal */}
      {isAddColumnOpen && (
        <AddColumnModal
          existingColumns={columns}
          onAdd={handleAddColumn}
          onClose={() => setIsAddColumnOpen(false)}
        />
      )}

      {/* Add Multiple Columns Modal */}
      {isAddMultipleColumnsOpen && (
        <AddMultipleColumnsModal
          onAdd={(count) => {
            for (let i = 0; i < count; i++) {
              const maxOrder = Math.max(...columns.map((c) => c.order || 0), -1);
              const newColumn: Column = {
                id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
                title: `Column ${columns.length + i + 1}`,
                type: "input",
                order: maxOrder + 1 + i,
              };
              setColumns((prev) => [...prev, newColumn]);
            }
            setIsAddMultipleColumnsOpen(false);
          }}
          onClose={() => setIsAddMultipleColumnsOpen(false)}
        />
      )}

      {/* Edit Column Modal */}
      {editingColumn && (
        <AddColumnModal
          existingColumns={columns}
          column={editingColumn}
          onAdd={handleUpdateColumn}
          onClose={() => setEditingColumn(null)}
        />
      )}
    </div>
  );
}

