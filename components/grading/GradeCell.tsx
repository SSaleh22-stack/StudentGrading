"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Column } from "@/lib/types";
import { hasActiveSubscription } from "@/lib/subscription";

interface GradeCellProps {
  column: Column;
  studentId: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onNavigate?: (direction: "up" | "down" | "left" | "right") => void;
}

export default function GradeCell({
  column,
  value,
  onChange,
  onNavigate,
}: GradeCellProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [editingValue, setEditingValue] = useState(
    value !== null ? value.toString() : ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const hasSubscription = hasActiveSubscription();
  
  const checkSubscription = () => {
    if (!hasActiveSubscription()) {
      alert(t("subscription.needSubscription"));
      router.push("/pricing");
      return false;
    }
    return true;
  };

  useEffect(() => {
    setEditingValue(value !== null ? value.toString() : "");
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (!checkSubscription()) {
      setEditingValue(value !== null ? value.toString() : "");
      return;
    }
    const numValue = parseFloat(editingValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    } else if (editingValue.trim() === "") {
      onChange(null);
    } else {
      // Invalid input, revert to previous value
      setEditingValue(value !== null ? value.toString() : "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
      // Move to next cell below
      if (onNavigate) {
        e.preventDefault();
        onNavigate("down");
      }
    } else if (e.key === "Escape") {
      setEditingValue(value !== null ? value.toString() : "");
      setIsEditing(false);
    } else if (e.key === "ArrowUp" && onNavigate) {
      e.preventDefault();
      handleBlur();
      onNavigate("up");
    } else if (e.key === "ArrowDown" && onNavigate) {
      e.preventDefault();
      handleBlur();
      onNavigate("down");
    } else if (e.key === "ArrowLeft" && onNavigate) {
      // Only navigate if cursor is at the start of input
      if (inputRef.current && inputRef.current.selectionStart === 0) {
        e.preventDefault();
        handleBlur();
        onNavigate("left");
      }
    } else if (e.key === "ArrowRight" && onNavigate) {
      // Only navigate if cursor is at the end of input
      if (
        inputRef.current &&
        inputRef.current.selectionStart === inputRef.current.value.length
      ) {
        e.preventDefault();
        handleBlur();
        onNavigate("right");
      }
    }
  };

  if (column.type === "input") {
    return (
      <input
        ref={inputRef}
        type="number"
        step="0.01"
        value={editingValue}
        onChange={(e) => setEditingValue(e.target.value)}
        onFocus={() => {
          if (!checkSubscription()) {
            inputRef.current?.blur();
            return;
          }
          setIsEditing(true);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-gray-400 transition-all duration-200"
        placeholder="—"
        disabled={!hasSubscription}
        title={!hasSubscription ? t("subscription.needSubscription") : ""}
      />
    );
  }

  // Computed column (sum/max/average/round) - read-only
  const formatValue = () => {
    if (value === null) return "—";
    if (column.type === "round") {
      // For round, show appropriate decimal places based on roundTo
      const roundTo = column.roundTo ?? 1.0;
      if (roundTo === 1.0) return value.toFixed(0);
      if (roundTo === 0.75 || roundTo === 0.5 || roundTo === 0.25) {
        return value.toFixed(2);
      }
    }
    return value.toFixed(2);
  };

  return (
    <div className="px-4 py-2 text-sm text-center bg-gray-50 text-gray-700 font-medium">
      {formatValue()}
    </div>
  );
}

