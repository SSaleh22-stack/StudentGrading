"use client";

import { useState } from "react";
import Button from "../ui/Button";
import ManualEntryTab from "./ManualEntryTab";
import CSVUploadTab from "./CSVUploadTab";
import { Student } from "@/lib/types";

interface AddStudentsStepProps {
  initialStudents: Student[];
  onNext: (students: Student[]) => void;
  onBack: () => void;
}

type Tab = "manual" | "csv";

export default function AddStudentsStep({
  initialStudents,
  onNext,
  onBack,
}: AddStudentsStepProps) {
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const handleStudentsUpdate = (newStudents: Student[]) => {
    setStudents(newStudents);
  };

  const handleNext = () => {
    if (students.length === 0) {
      alert("Please add at least one student before proceeding.");
      return;
    }

    // Validate that all students have name and studentId
    const invalid = students.some(
      (s) => !s.name?.trim() || !s.studentId?.trim()
    );
    if (invalid) {
      alert("Please ensure all students have both name and student ID.");
      return;
    }

    onNext(students);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Students</h2>

      {/* Tab Selector */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "manual"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab("csv")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "csv"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          CSV Upload
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === "manual" ? (
          <ManualEntryTab
            initialStudents={students}
            onStudentsChange={handleStudentsUpdate}
          />
        ) : (
          <CSVUploadTab
            initialStudents={students}
            onStudentsChange={handleStudentsUpdate}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={handleNext}>
          Next: Preview
        </Button>
      </div>
    </div>
  );
}

