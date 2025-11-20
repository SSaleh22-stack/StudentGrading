"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ManualEntryTab from "./ManualEntryTab";
import CSVUploadTab from "./CSVUploadTab";
import { Student } from "@/lib/types";

interface AddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (students: Student[]) => void;
  existingStudents: Student[];
}

export default function AddStudentsModal({
  isOpen,
  onClose,
  onAdd,
  existingStudents,
}: AddStudentsModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStudents([
        {
          id: `student_${Date.now()}_0`,
          name: "",
          studentId: "",
        },
      ]);
      setActiveTab("manual");
    }
  }, [isOpen]);

  const handleStudentsUpdate = (newStudents: Student[]) => {
    setStudents(newStudents);
  };

  const handleAdd = () => {
    // Validate students
    const validStudents = students.filter(
      (s) => s.name.trim() !== "" && s.studentId.trim() !== ""
    );

    if (validStudents.length === 0) {
      alert(t("fileCreation.addAtLeastOneStudent"));
      return;
    }

    // Check for duplicate student IDs
    const studentIds = validStudents.map((s) => s.studentId.trim().toLowerCase());
    const duplicateIds = studentIds.filter(
      (id, index) => studentIds.indexOf(id) !== index
    );

    if (duplicateIds.length > 0) {
      alert(t("fileCreation.duplicateStudentIds"));
      return;
    }

    // Check for duplicates with existing students
    const existingIds = existingStudents.map((s) =>
      s.studentId.trim().toLowerCase()
    );
    const conflicts = validStudents.filter((s) =>
      existingIds.includes(s.studentId.trim().toLowerCase())
    );

    if (conflicts.length > 0) {
      alert(t("fileCreation.duplicateStudentIdsExisting"));
      return;
    }

    onAdd(validStudents);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("files.addStudents")}
    >
      <div className="space-y-6">
        {/* Tab Selector */}
        <div className="flex space-x-4 border-b border-gray-200 rtl:space-x-reverse">
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "manual"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("fileCreation.manualEntry")}
          </button>
          <button
            onClick={() => setActiveTab("csv")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "csv"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("fileCreation.csvUpload")}
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-h-[60vh] overflow-y-auto">
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

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 rtl:space-x-reverse">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="primary" onClick={handleAdd}>
            {t("files.addStudents")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

