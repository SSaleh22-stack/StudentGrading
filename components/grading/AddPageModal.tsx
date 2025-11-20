"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { PageType } from "@/lib/types";

interface AddPageModalProps {
  onAdd: (name: string, type: PageType) => void;
  onClose: () => void;
}

export default function AddPageModal({ onAdd, onClose }: AddPageModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [type, setType] = useState<PageType>("grading");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(t("errors.required"));
      return;
    }

    onAdd(name.trim(), type);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t("grading.addPage")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            label={t("grading.pageName")}
            placeholder={t("grading.pageNamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("grading.pageType")}
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PageType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
          >
            <option value="grading">{t("grading.grading")}</option>
            <option value="attendance">{t("attendance.title")} ({t("attendance.present")}/{t("attendance.absent")})</option>
          </select>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 rtl:space-x-reverse">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary">
            {t("common.add")} {t("grading.page")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

