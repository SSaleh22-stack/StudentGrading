"use client";

"use client";

import { useState, useRef } from "react";
import Button from "../ui/Button";
import { Student } from "@/lib/types";
import Papa from "papaparse";

interface CSVUploadTabProps {
  initialStudents: Student[];
  onStudentsChange: (students: Student[]) => void;
}

export default function CSVUploadTab({
  initialStudents,
  onStudentsChange,
}: CSVUploadTabProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }

    setError("");
    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedStudents: Student[] = [];

          results.data.forEach((row: any, index: number) => {
            // Try to find name and id columns (case-insensitive)
            const nameKey =
              Object.keys(row).find(
                (key) =>
                  key.toLowerCase().includes("name") ||
                  key.toLowerCase().includes("student name")
              ) || "name";
            const idKey =
              Object.keys(row).find(
                (key) =>
                  key.toLowerCase().includes("id") ||
                  key.toLowerCase().includes("student id") ||
                  key.toLowerCase().includes("studentid")
              ) || "id";

            const name = row[nameKey]?.toString().trim() || "";
            const studentId = row[idKey]?.toString().trim() || "";

            if (name && studentId) {
              const student: Student = {
                id: `student_${Date.now()}_${index}`,
                name,
                studentId,
              };

              // Add any additional columns from CSV
              Object.keys(row).forEach((key) => {
                if (
                  key.toLowerCase() !== nameKey.toLowerCase() &&
                  key.toLowerCase() !== idKey.toLowerCase()
                ) {
                  student[key] = row[key];
                }
              });

              parsedStudents.push(student);
            }
          });

          if (parsedStudents.length === 0) {
            setError(
              "No valid students found in CSV. Please ensure your CSV has 'name' and 'id' columns."
            );
            setIsProcessing(false);
            return;
          }

          setStudents(parsedStudents);
          onStudentsChange(parsedStudents);
          setError("");
        } catch (err) {
          setError("Error parsing CSV file. Please check the format.");
          console.error("CSV parsing error:", err);
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        setError(`Error reading CSV file: ${error.message}`);
        setIsProcessing(false);
      },
    });
  };

  const handleClear = () => {
    setStudents([]);
    onStudentsChange([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV File
        </label>
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isProcessing}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          CSV should contain columns: <strong>name</strong> and <strong>id</strong> (or similar).
          Additional columns will be preserved.
        </p>
      </div>

      {isProcessing && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
          Processing CSV file...
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {students.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              {students.length} student{students.length !== 1 ? "s" : ""} loaded
            </p>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </div>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.slice(0, 10).map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {student.studentId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length > 10 && (
              <div className="px-4 py-2 text-sm text-gray-500 text-center bg-gray-50">
                ... and {students.length - 10} more
              </div>
            )}
          </div>
        </div>
      )}

      {students.length === 0 && !isProcessing && (
        <div className="text-center py-8 text-gray-500">
          <p>No students loaded yet.</p>
          <p className="text-sm mt-2">Upload a CSV file to get started.</p>
        </div>
      )}
    </div>
  );
}

