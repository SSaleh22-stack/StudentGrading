"use client";

import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface BasicInfoStepProps {
  initialName: string;
  initialDescription: string;
  onNext: (name: string, description: string) => void;
}

export default function BasicInfoStep({
  initialName,
  initialDescription,
  onNext,
}: BasicInfoStepProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(t("errors.required"));
      return;
    }

    onNext(name.trim(), description.trim());
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("fileCreation.basicInfo")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            label={t("files.fileName")}
            placeholder="e.g., CS101 Fall 2024"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
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
            placeholder={t("files.description")}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary">
            {t("common.next")}: {t("fileCreation.addStudents")}
          </Button>
        </div>
      </form>
    </div>
  );
}

