"use client";

import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { Student } from "@/lib/types";

interface ManualEntryTabProps {
  initialStudents: Student[];
  onStudentsChange: (students: Student[]) => void;
}

export default function ManualEntryTab({
  initialStudents,
  onStudentsChange,
}: ManualEntryTabProps) {
  const [students, setStudents] = useState<Student[]>(
    initialStudents.length > 0
      ? initialStudents
      : [
          {
            id: `student_${Date.now()}_0`,
            name: "",
            studentId: "",
          },
        ]
  );

  useEffect(() => {
    onStudentsChange(students);
  }, [students, onStudentsChange]);

  const addStudent = () => {
    setStudents([
      ...students,
      {
        id: `student_${Date.now()}_${students.length}`,
        name: "",
        studentId: "",
      },
    ]);
  };

  const removeStudent = (id: string) => {
    if (students.length === 1) {
      alert("You must have at least one student row.");
      return;
    }
    setStudents(students.filter((s) => s.id !== id));
  };

  const updateStudent = (id: string, field: keyof Student, value: string) => {
    setStudents(
      students.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  return (
    <div>
      <div className="space-y-4">
        {students.map((student, index) => (
          <div
            key={student.id}
            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900">
                Student {index + 1}
              </h3>
              {students.length > 1 && (
                <button
                  onClick={() => removeStudent(student.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Student Name"
                placeholder="Enter student name"
                value={student.name || ""}
                onChange={(e) =>
                  updateStudent(student.id, "name", e.target.value)
                }
                required
              />
              <Input
                type="text"
                label="Student ID"
                placeholder="Enter student ID"
                value={student.studentId || ""}
                onChange={(e) =>
                  updateStudent(student.id, "studentId", e.target.value)
                }
                required
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={addStudent}>
          + Add Student
        </Button>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        {students.length} student{students.length !== 1 ? "s" : ""} added
      </p>
    </div>
  );
}

