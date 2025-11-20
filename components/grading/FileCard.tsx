"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { GradeFile } from "@/lib/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface FileCardProps {
  file: GradeFile;
  onEdit?: (file: GradeFile) => void;
  onDelete?: (fileId: string) => void;
}

export default function FileCard({ file, onEdit, onDelete }: FileCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/files/${file.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) {
      onEdit(file);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      if (confirm(t("files.confirmDelete"))) {
        onDelete(file.id);
      }
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 relative group border-l-4 border-l-transparent hover:border-l-blue-500">
      <div className="flex flex-col h-full">
        {/* Menu Button */}
        <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t("common.menu")}
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 rtl:right-auto rtl:left-0">
                <button
                  onClick={handleEdit}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                >
                  {t("common.edit")}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                >
                  {t("common.delete")}
                </button>
              </div>
            </>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 pr-8 rtl:pr-0 rtl:pl-8 group-hover:text-blue-600 transition-colors">
          {file.name}
        </h3>
        {file.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {file.description}
          </p>
        )}
        <div className="mt-auto space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span>{t("files.created")}:</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("files.modified")}:</span>
            <span>{formatDateTime(file.updatedAt)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span>{t("files.students")}:</span>
            <span className="font-medium">{file.students.length}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleOpen}
          >
            {t("files.openFile")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

