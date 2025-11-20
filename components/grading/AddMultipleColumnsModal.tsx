"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface AddMultipleColumnsModalProps {
  onAdd: (count: number) => void;
  onClose: () => void;
}

export default function AddMultipleColumnsModal({
  onAdd,
  onClose,
}: AddMultipleColumnsModalProps) {
  const { t } = useTranslation();
  const [count, setCount] = useState<string>("1");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numCount = parseInt(count);
    if (isNaN(numCount) || numCount < 1) {
      setError(t("grading.enterValidNumber"));
      return;
    }

    if (numCount > 100) {
      setError(t("grading.max100Columns"));
      return;
    }

    onAdd(numCount);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t("grading.addMultipleColumns")}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Input
              type="number"
              label={t("grading.numberOfColumns")}
              placeholder="e.g., 5"
              value={count}
              onChange={(e) => {
                setCount(e.target.value);
                setError("");
              }}
              min="1"
              max="100"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {t("grading.enterNumberOfColumns")}
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 rtl:space-x-reverse">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary">
              {t("common.add")} {count || "0"} {parseInt(count) === 1 ? t("grading.column") : t("grading.columns")}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

