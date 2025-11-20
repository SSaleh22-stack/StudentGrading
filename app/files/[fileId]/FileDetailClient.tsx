"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import GradeTable from "@/components/grading/GradeTable";
import AttendancePage from "@/components/grading/AttendancePage";
import PageTabs from "@/components/grading/PageTabs";
import AddPageModal from "@/components/grading/AddPageModal";
import AddStudentsModal from "@/components/files/AddStudentsModal";
import { getFileById, getCurrentUser, saveFile } from "@/lib/storage";
import { GradeFile, Page, PageType, Student } from "@/lib/types";
import { downloadFileAsCSV, downloadAsPDF, generatePDFContent } from "@/lib/download";
import Button from "@/components/ui/Button";
import { updateUserOnlineStatus } from "@/lib/user-status";

export default function FileDetailClient() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const fileId = params?.fileId as string;
  const [file, setFile] = useState<GradeFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [isAddStudentsOpen, setIsAddStudentsOpen] = useState(false);

  useEffect(() => {
    function loadFile() {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (!isLoggedIn) {
        router.push("/");
        return;
      }

      if (fileId) {
        try {
          const fileData = getFileById(fileId);
          const user = getCurrentUser();
          
          if (!fileData) {
            router.push("/dashboard");
            return;
          }

          // Check if user owns this file
          if (fileData.owner !== user) {
            router.push("/dashboard");
            return;
          }

          // Update online status
          if (user) {
            updateUserOnlineStatus(user);
          }

          setFile(fileData);
          
          // Set active page to first page or create default if none
          if (fileData.pages && fileData.pages.length > 0) {
            setActivePageId(fileData.pages[0].id);
          }
        } catch (error) {
          console.error("Error loading file:", error);
          router.push("/dashboard");
        }
      }
      setLoading(false);
    }

    loadFile();
  }, [fileId, router]);

  const handleFileUpdate = (updatedFile: GradeFile) => {
    setFile(updatedFile);
    saveFile(updatedFile);
  };

  const handleAddPage = (name: string, type: PageType) => {
    if (!file) return;

    const newPage: Page = {
      id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      columns: [],
      grades: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (type === "attendance") {
      (newPage as any).attendanceRecords = [];
    }

    const updatedFile: GradeFile = {
      ...file,
      pages: [...(file.pages || []), newPage],
      updatedAt: new Date().toISOString(),
    };

    handleFileUpdate(updatedFile);
    setActivePageId(newPage.id);
    setIsAddPageOpen(false);
  };

  const handleAddStudents = (newStudents: Student[]) => {
    if (!file) return;

    const updatedFile: GradeFile = {
      ...file,
      students: [...file.students, ...newStudents],
      updatedAt: new Date().toISOString(),
    };

    handleFileUpdate(updatedFile);
    setIsAddStudentsOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  if (!file) {
    return null;
  }

  // Ensure pages array exists
  if (!file.pages || file.pages.length === 0) {
    // Create default page if none exists
    const defaultPage: Page = {
      id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: t("grading.addColumn").replace("Add Column", "Grading"),
      type: "grading",
      columns: file.columns || [],
      grades: file.grades || [],
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
    file.pages = [defaultPage];
    setActivePageId(defaultPage.id);
    handleFileUpdate(file);
  }

  const activePage = file.pages?.find((p) => p.id === activePageId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div id="file-content" className="hidden">
          {file.pages?.map((page) => {
            if (page.type === "grading") {
              return generatePDFContent(
                file,
                page,
                file.students,
                page.columns || [],
                page.grades || [],
                "grading"
              );
            } else {
              return generatePDFContent(
                file,
                page,
                file.students,
                [],
                [],
                "attendance",
                (page as any).attendanceRecords || [],
                new Date().toISOString().split("T")[0]
              );
            }
          })}
        </div>
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← {t("common.back")} {t("common.to")} {t("common.dashboard")}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{file.name}</h1>
              {file.description && (
                <p className="text-gray-600 mt-2">{file.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddStudentsOpen(true)}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t("files.addStudents")}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (file.pages && file.students) {
                    downloadFileAsCSV(file, file.students, file.pages);
                  }
                }}
              >
                {t("common.download")} {t("common.all")} (CSV)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const content = document.getElementById("file-content");
                  if (content) {
                    downloadAsPDF("file-content", `${file.name}.pdf`);
                  }
                }}
              >
                {t("common.download")} {t("common.all")} (PDF)
              </Button>
            </div>
          </div>
        </div>

        {file.students.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">
              {t("files.noStudents")}
            </p>
            <Button variant="primary" onClick={() => setIsAddStudentsOpen(true)}>
              {t("files.addStudents")}
            </Button>
          </div>
        ) : (
          <>
            {file.pages && file.pages.length > 0 && (
              <PageTabs
                pages={file.pages}
                activePageId={activePageId || file.pages[0].id}
                onPageChange={setActivePageId}
                onAddPage={() => setIsAddPageOpen(true)}
              />
            )}

            {activePage && (
              <>
                {activePage.type === "grading" ? (
                  <GradeTable
                    file={file}
                    page={activePage}
                    onFileUpdate={handleFileUpdate}
                  />
                ) : (
                  <AttendancePage
                    file={file}
                    page={activePage}
                    onFileUpdate={handleFileUpdate}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {isAddPageOpen && (
        <AddPageModal
          onAdd={handleAddPage}
          onClose={() => setIsAddPageOpen(false)}
        />
      )}

      {isAddStudentsOpen && (
        <AddStudentsModal
          isOpen={isAddStudentsOpen}
          onClose={() => setIsAddStudentsOpen(false)}
          onAdd={handleAddStudents}
          existingStudents={file.students}
        />
      )}
    </div>
  );
}

