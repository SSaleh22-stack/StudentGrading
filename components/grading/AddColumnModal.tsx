"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Column, ColumnType } from "@/lib/types";

interface AddColumnModalProps {
  existingColumns: Column[];
  column?: Column; // If provided, we're editing
  onAdd: (column: Column) => void;
  onClose: () => void;
}

export default function AddColumnModal({
  existingColumns,
  column,
  onAdd,
  onClose,
}: AddColumnModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(column?.title || "");
  const [type, setType] = useState<ColumnType>(column?.type || "input");
  const [sourceColumnIds, setSourceColumnIds] = useState<string[]>(
    column?.sourceColumnIds || []
  );
  const [roundTo, setRoundTo] = useState<0.25 | 0.5 | 0.75 | 1.0>(
    column?.roundTo ?? 1.0
  );
  const [sourceColumnId, setSourceColumnId] = useState<string>(
    column?.sourceColumnIds?.[0] || ""
  );
  const [error, setError] = useState("");

  const isEditing = !!column;
  const availableSourceColumns = existingColumns.filter(
    (col) => col.type === "input" && col.id !== column?.id
  );

  useEffect(() => {
    // If type changes to input, clear source columns
    if (type === "input") {
      setSourceColumnIds([]);
      setSourceColumnId("");
    }
    // For round, use single source column
    if (type === "round") {
      setSourceColumnIds([]);
      if (!sourceColumnId && availableSourceColumns.length > 0) {
        setSourceColumnId(availableSourceColumns[0].id);
      }
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError(t("errors.required"));
      return;
    }

    if (
      (type === "sum" || type === "max" || type === "average") &&
      sourceColumnIds.length === 0
    ) {
      setError(t("grading.selectAtLeastOneSource"));
      return;
    }

    if (type === "round" && !sourceColumnId) {
      setError(t("grading.selectSourceToRound"));
      return;
    }

    const newColumn: Column = {
      id:
        column?.id ||
        `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      type,
      sourceColumnIds:
        type === "round"
          ? [sourceColumnId]
          : type !== "input"
          ? sourceColumnIds
          : undefined,
      roundTo: type === "round" ? roundTo : undefined,
    };

    onAdd(newColumn);
  };

  const toggleSourceColumn = (columnId: string) => {
    setSourceColumnIds((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? t("grading.editColumn") : t("grading.addColumn")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            label={t("grading.columnTitle")}
            placeholder="e.g., Assignment 1, Midterm, Final Grade"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("grading.columnType")}
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ColumnType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            disabled={isEditing && column.type !== "input"}
          >
            <option value="input">{t("grading.input")} ({t("grading.manualEntry")})</option>
            <option value="sum">{t("grading.sum")} ({t("grading.sumOfSelected")})</option>
            <option value="max">{t("grading.max")} ({t("grading.maxOfSelected")})</option>
            <option value="average">{t("grading.average")} ({t("grading.averageOfSelected")})</option>
            <option value="round">{t("grading.round")} ({t("grading.roundToDecimal")})</option>
          </select>
          {isEditing && column.type !== "input" && (
            <p className="mt-1 text-xs text-gray-500">
              {t("grading.typeCannotChange")}
            </p>
          )}
        </div>

        {(type === "sum" || type === "max" || type === "average") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("grading.selectSourceColumns")} (
              {type === "sum"
                ? t("grading.toSum")
                : type === "max"
                ? t("grading.toFindMax")
                : t("grading.toCalculateAverage")}
              )
            </label>
            {availableSourceColumns.length === 0 ? (
              <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                {t("grading.noInputColumns")}
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {availableSourceColumns.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded rtl:space-x-reverse"
                  >
                    <input
                      type="checkbox"
                      checked={sourceColumnIds.includes(col.id)}
                      onChange={() => toggleSourceColumn(col.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{col.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {type === "round" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("grading.selectSourceColumnToRound")}
              </label>
              {availableSourceColumns.length === 0 ? (
                <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                  {t("grading.noInputColumns")}
                </p>
              ) : (
                <select
                  value={sourceColumnId}
                  onChange={(e) => setSourceColumnId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  <option value="">{t("grading.selectColumn")}...</option>
                  {availableSourceColumns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("grading.roundToNearest")}
              </label>
              <select
                value={roundTo}
                onChange={(e) =>
                  setRoundTo(parseFloat(e.target.value) as 0.25 | 0.5 | 0.75 | 1.0)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                required
              >
                <option value="1.0">{t("grading.fullNumber")} (1.0)</option>
                <option value="0.75">0.75</option>
                <option value="0.5">0.5</option>
                <option value="0.25">0.25</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {t("grading.roundToNearestValue")}
              </p>
            </div>
          </>
        )}

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 rtl:space-x-reverse">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? t("grading.updateColumn") : t("grading.addColumn")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

