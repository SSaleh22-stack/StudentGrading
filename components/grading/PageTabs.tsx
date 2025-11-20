"use client";

import { useTranslation } from "react-i18next";
import { Page } from "@/lib/types";
import Button from "../ui/Button";

interface PageTabsProps {
  pages: Page[];
  activePageId: string;
  onPageChange: (pageId: string) => void;
  onAddPage: () => void;
}

export default function PageTabs({
  pages,
  activePageId,
  onPageChange,
  onAddPage,
}: PageTabsProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 border-b border-gray-200">
      <div className="flex items-center space-x-1 overflow-x-auto">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onPageChange(page.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activePageId === page.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {page.name}
          </button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddPage}
          className="ml-2"
        >
          + {t("common.add")} {t("grading.page")}
        </Button>
      </div>
    </div>
  );
}

