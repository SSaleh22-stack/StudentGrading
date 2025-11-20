"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { GradeFile } from "@/lib/types";

interface EditFileModalProps {
  file: GradeFile;
  isOpen: boolean;
  onSave: (updatedFile: GradeFile) => void;
  onClose: () => void;
}

export default function EditFileModal({
  file,
  isOpen,
  onSave,
  onClose,
}: EditFileModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(file.name);
  const [description, setDescription] = useState(file.description || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(file.name);
      setDescription(file.description || "");
      setError("");
    }
  }, [isOpen, file]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(t("errors.required"));
      return;
    }

    const updatedFile: GradeFile = {
      ...file,
      name: name.trim(),
      description: description.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedFile);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("files.editFile")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            label={t("files.fileName")}
            placeholder={t("files.fileNamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("files.description")} ({t("files.optional")})
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("files.descriptionPlaceholder")}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary">
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

