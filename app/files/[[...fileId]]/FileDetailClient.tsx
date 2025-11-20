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
import { downloadFileAsCSV, generatePDFContent } from "@/lib/download";
import Button from "@/components/ui/Button";
import { updateUserOnlineStatus } from "@/lib/user-status";

export default function FileDetailClient() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  // Handle catch-all route - get first segment as fileId
  const fileId = Array.isArray(params?.fileId) ? params.fileId[0] : (params?.fileId as string);
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
          
          // Set active page to first page if available
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

  const handleAddStudents = (students: Student[]) => {
    if (!file) return;
    
    const updatedFile: GradeFile = {
      ...file,
      students: [...(file.students || []), ...students],
      updatedAt: new Date().toISOString(),
    };
    
    handleFileUpdate(updatedFile);
    setIsAddStudentsOpen(false);
  };

  const activePage = file?.pages?.find((p) => p.id === activePageId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">File not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* File Header */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{file.name}</h1>
              {file.description && (
                <p className="text-gray-600 mt-1">{file.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddStudentsOpen(true)}
              >
                {t("files.addStudents")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  downloadFileAsCSV(file, file.students, file.pages || []);
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
                    activePage || file.pages?.[0] || {} as Page,
                    file.students,
                    activePage?.columns || [],
                    activePage?.grades || [],
                    activePage?.type || "grading",
                    (activePage as any)?.attendanceRecords,
                    undefined
                  );
                  const printWindow = window.open("", "_blank");
                  if (printWindow) {
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>${file.name}.pdf</title>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                {t("common.back")}
              </Button>
            </div>
          </div>
          
          {/* Page Tabs */}
          {file.pages && file.pages.length > 0 && (
            <PageTabs
              pages={file.pages}
              activePageId={activePageId || file.pages[0]?.id || ""}
              onPageChange={setActivePageId}
              onAddPage={() => setIsAddPageOpen(true)}
            />
          )}
        </div>

        {/* Empty State */}
        {(!file.pages || file.pages.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">{t("files.noPages")}</p>
            <Button variant="primary" onClick={() => setIsAddPageOpen(true)}>
              {t("files.addFirstPage")}
            </Button>
          </div>
        )}

        {/* Page Content */}
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

        {/* Add Page Modal */}
        {isAddPageOpen && (
          <AddPageModal
            onAdd={handleAddPage}
            onClose={() => setIsAddPageOpen(false)}
          />
        )}

        {/* Add Students Modal */}
        {isAddStudentsOpen && (
          <AddStudentsModal
            isOpen={isAddStudentsOpen}
            onClose={() => setIsAddStudentsOpen(false)}
            onAdd={handleAddStudents}
            existingStudents={file.students}
          />
        )}
      </div>
    </div>
  );
}

