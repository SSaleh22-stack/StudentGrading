"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import SideNav from "@/components/layout/SideNav";
import FileCard from "@/components/grading/FileCard";
import Button from "@/components/ui/Button";
import EditFileModal from "@/components/files/EditFileModal";
import FileCardSkeleton from "@/components/files/FileCardSkeleton";
import Skeleton from "@/components/ui/Skeleton";
import { getLatestFiles, getCurrentUser, saveFile, deleteFile } from "@/lib/storage";
import { GradeFile } from "@/lib/types";

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [files, setFiles] = useState<GradeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFile, setEditingFile] = useState<GradeFile | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    // Load latest files
    const user = getCurrentUser();
    if (user) {
      const latestFiles = getLatestFiles(user, 4);
      setFiles(latestFiles);
    }
    setLoading(false);
  }, [router]);

  const handleCreateNewFile = () => {
    router.push("/files/new");
  };

  const handleEditFile = (file: GradeFile) => {
    setEditingFile(file);
  };

  const handleSaveFile = (updatedFile: GradeFile) => {
    saveFile(updatedFile);
    // Refresh files list
    const user = getCurrentUser();
    if (user) {
      const latestFiles = getLatestFiles(user, 4);
      setFiles(latestFiles);
    }
    setEditingFile(null);
  };

  const handleDeleteFile = (fileId: string) => {
    deleteFile(fileId);
    // Refresh files list
    const user = getCurrentUser();
    if (user) {
      const latestFiles = getLatestFiles(user, 4);
      setFiles(latestFiles);
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 page-transition">
      <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <Skeleton variant="text" width="200px" height="36px" />
                <Skeleton variant="rectangular" width="180px" height="40px" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <FileCardSkeleton key={i} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <SideNav />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-transition">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{t("dashboard.title")}</h1>
                <p className="text-gray-600">{t("dashboard.welcomeMessage")}</p>
              </div>
              <Button variant="primary" onClick={handleCreateNewFile}>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t("dashboard.createNewFile")}
                </span>
              </Button>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {t("dashboard.recentFiles")}
              </h2>
              {files.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-600 mb-4">
                    {t("dashboard.noFiles")}
                  </p>
                  <Button variant="primary" onClick={handleCreateNewFile}>
                    {t("dashboard.createFirstFile")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {files.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onEdit={handleEditFile}
                      onDelete={handleDeleteFile}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Navigation */}
          <div className="lg:col-span-1">
            <SideNav />
          </div>
        </div>

        {/* Edit File Modal */}
        {editingFile && (
          <EditFileModal
            file={editingFile}
            isOpen={!!editingFile}
            onSave={handleSaveFile}
            onClose={() => setEditingFile(null)}
          />
        )}
      </div>
    </div>
  );
}
