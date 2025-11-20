"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Input from "../ui/Input";
import { GradeFile } from "@/lib/types";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "created-asc"
  | "created-desc"
  | "updated-asc"
  | "updated-desc"
  | "students-asc"
  | "students-desc";

interface FileFiltersProps {
  files: GradeFile[];
  onFilteredFilesChange: (filtered: GradeFile[]) => void;
  onClearFilters?: () => void;
}

export default function FileFilters({
  files,
  onFilteredFilesChange,
  onClearFilters,
}: FileFiltersProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated-desc");
  const [minStudents, setMinStudents] = useState("");

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...files];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query)
      );
    }

    // Min students filter
    if (minStudents) {
      const min = parseInt(minStudents);
      if (!isNaN(min)) {
        filtered = filtered.filter((file) => file.students.length >= min);
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "created-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "created-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "updated-asc":
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        case "updated-desc":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "students-asc":
          return a.students.length - b.students.length;
        case "students-desc":
          return b.students.length - a.students.length;
        default:
          return 0;
      }
    });

    onFilteredFilesChange(filtered);
  }, [files, searchQuery, sortBy, minStudents, onFilteredFilesChange]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setMinStudents("");
    setSortBy("updated-desc");
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const hasActiveFilters = searchQuery.trim() !== "" || minStudents !== "";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("common.search")}
          </label>
          <Input
            type="text"
            placeholder={t("common.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("common.filter")}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 cursor-pointer"
          >
            <option value="updated-desc">{t("files.modified")} ({t("common.newest")})</option>
            <option value="updated-asc">{t("files.modified")} ({t("common.oldest")})</option>
            <option value="created-desc">{t("files.created")} ({t("common.newest")})</option>
            <option value="created-asc">{t("files.created")} ({t("common.oldest")})</option>
            <option value="name-asc">{t("files.fileName")} (A-Z)</option>
            <option value="name-desc">{t("files.fileName")} (Z-A)</option>
            <option value="students-desc">{t("files.mostStudents")}</option>
            <option value="students-asc">{t("files.fewestStudents")}</option>
          </select>
        </div>

        {/* Min Students Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("files.minStudents")}
          </label>
          <Input
            type="number"
            placeholder={t("files.filterByMinStudents")}
            value={minStudents}
            onChange={(e) => setMinStudents(e.target.value)}
            min="0"
            className="w-full"
          />
        </div>
      </div>
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t("common.clear")}
          </button>
        </div>
      )}
    </div>
  );
}

