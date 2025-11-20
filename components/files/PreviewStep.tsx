"use client";

import Button from "../ui/Button";
import { Student } from "@/lib/types";

interface PreviewStepProps {
  fileName: string;
  fileDescription?: string;
  students: Student[];
  onConfirm: (fileId?: string) => void;
  onBack: () => void;
  createdFileId?: string | null;
  onOpenFile?: () => void;
}

export default function PreviewStep({
  fileName,
  fileDescription,
  students,
  onConfirm,
  onBack,
  createdFileId,
  onOpenFile,
}: PreviewStepProps) {
  // Get all unique keys from students (for additional columns)
  const allKeys = new Set<string>();
  students.forEach((student) => {
    Object.keys(student).forEach((key) => {
      if (key !== "id") {
        allKeys.add(key);
      }
    });
  });

  const columns = Array.from(allKeys);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview</h2>

      {/* File Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">{fileName}</h3>
        {fileDescription && (
          <p className="text-sm text-gray-700 mb-2">{fileDescription}</p>
        )}
        <p className="text-sm text-gray-600">
          {students.length} student{students.length !== 1 ? "s" : ""} will be
          added
        </p>
      </div>

      {/* Students Table */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Students Preview</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-3 text-sm text-gray-900"
                      >
                        {student[col]?.toString() || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {createdFileId && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium mb-2">
            ✓ File created successfully!
          </p>
          <Button variant="primary" onClick={onOpenFile}>
            Open File
          </Button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onBack} disabled={!!createdFileId}>
          Back
        </Button>
        {!createdFileId ? (
          <Button variant="primary" onClick={() => onConfirm()}>
            Confirm & Create File
          </Button>
        ) : (
          <Button variant="primary" onClick={onOpenFile}>
            Open File
          </Button>
        )}
      </div>
    </div>
  );
}

