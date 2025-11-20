"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import SideNav from "@/components/layout/SideNav";
import FileCard from "@/components/grading/FileCard";
import Button from "@/components/ui/Button";
import FileFilters from "@/components/files/FileFilters";
import EditFileModal from "@/components/files/EditFileModal";
import FileCardSkeleton from "@/components/files/FileCardSkeleton";
import Skeleton from "@/components/ui/Skeleton";
import { getFilesByOwner, getCurrentUser, saveFile, deleteFile } from "@/lib/storage";
import { GradeFile } from "@/lib/types";

export default function MyFiles() {
  const { t } = useTranslation();
  const router = useRouter();
  const [allFiles, setAllFiles] = useState<GradeFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<GradeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFile, setEditingFile] = useState<GradeFile | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    // Load all files
    function loadFiles() {
      try {
        const user = getCurrentUser();
        if (user) {
          const files = getFilesByOwner(user);
          setAllFiles(files);
          setFilteredFiles(files);
        }
      } catch (error) {
        console.error("Error loading files:", error);
        setAllFiles([]);
        setFilteredFiles([]);
      } finally {
        setLoading(false);
      }
    }
    loadFiles();
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
      const files = getFilesByOwner(user);
      setAllFiles(files);
      setFilteredFiles(files);
    }
    setEditingFile(null);
  };

  const handleDeleteFile = (fileId: string) => {
    deleteFile(fileId);
    // Refresh files list
    const user = getCurrentUser();
    if (user) {
      const files = getFilesByOwner(user);
      setAllFiles(files);
      setFilteredFiles(files);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{t("files.myFiles")}</h1>
              <Button variant="primary" onClick={handleCreateNewFile}>
                {t("files.createNewFile")}
              </Button>
            </div>

            {/* Filters and Sort */}
            {allFiles.length > 0 && (
              <FileFilters
                files={allFiles}
                onFilteredFilesChange={setFilteredFiles}
              />
            )}

            {/* Results Count */}
            {allFiles.length > 0 && (
              <div className="mb-4 text-sm text-gray-600">
                {t("files.showing")} {filteredFiles.length} {t("files.of")} {allFiles.length}{" "}
                {allFiles.length === 1 ? t("files.file") : t("files.files")}
              </div>
            )}

            {allFiles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600 mb-4">
                  {t("files.noFiles")}
                </p>
                <Button variant="primary" onClick={handleCreateNewFile}>
                  {t("dashboard.createFirstFile")}
                </Button>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600 mb-4">
                  {t("files.noMatches")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFiles.map((file) => (
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

