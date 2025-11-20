"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../ui/Card";
import Button from "../ui/Button";
import BasicInfoStep from "./BasicInfoStep";
import AddStudentsStep from "./AddStudentsStep";
import PreviewStep from "./PreviewStep";
import { Student, Page } from "@/lib/types";
import { createNewFile, getCurrentUser, saveFile } from "@/lib/storage";

type Step = "basic" | "students" | "preview";

export default function CreateFileWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [fileData, setFileData] = useState({
    name: "",
    description: "",
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [createdFileId, setCreatedFileId] = useState<string | null>(null);

  const handleBasicInfoNext = (name: string, description: string) => {
    setFileData({ name, description });
    setCurrentStep("students");
  };

  const handleStudentsNext = (newStudents: Student[]) => {
    setStudents(newStudents);
    setCurrentStep("preview");
  };

  const handlePreviewBack = () => {
    setCurrentStep("students");
    setCreatedFileId(null);
  };

  const handleConfirm = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/");
      return;
    }

    // Create the new file
    const newFile = createNewFile(
      fileData.name,
      user,
      fileData.description
    );

    // Add students to the file
    newFile.students = students;

    // Create default grading page
    const defaultPage: Page = {
      id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: "Grading",
      type: "grading",
      columns: [],
      grades: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newFile.pages = [defaultPage];

    // Save the file
    saveFile(newFile);
    setCreatedFileId(newFile.id);
  };

  const handleOpenFile = () => {
    if (createdFileId) {
      router.push(`/files/${createdFileId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === "basic"
                  ? "bg-blue-600 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {currentStep === "basic" ? "1" : "✓"}
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-gray-900">
                Basic Info
              </div>
            </div>
          </div>

          <div
            className={`flex-1 h-1 mx-4 ${
              currentStep !== "basic" ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>

          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === "students"
                  ? "bg-blue-600 text-white"
                  : currentStep === "preview"
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {currentStep === "preview" ? "✓" : "2"}
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-gray-900">
                Add Students
              </div>
            </div>
          </div>

          <div
            className={`flex-1 h-1 mx-4 ${
              currentStep === "preview" ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>

          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === "preview"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              3
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-gray-900">Preview</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <Card>
        {currentStep === "basic" && (
          <BasicInfoStep
            initialName={fileData.name}
            initialDescription={fileData.description}
            onNext={handleBasicInfoNext}
          />
        )}

        {currentStep === "students" && (
          <AddStudentsStep
            initialStudents={students}
            onNext={handleStudentsNext}
            onBack={() => setCurrentStep("basic")}
          />
        )}

        {currentStep === "preview" && (
          <PreviewStep
            fileName={fileData.name}
            fileDescription={fileData.description}
            students={students}
            onConfirm={handleConfirm}
            onBack={handlePreviewBack}
            createdFileId={createdFileId}
            onOpenFile={handleOpenFile}
          />
        )}
      </Card>
    </div>
  );
}

