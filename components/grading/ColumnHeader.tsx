"use client";

import { useState } from "react";
import { Column, Student } from "@/lib/types";

interface ColumnHeaderProps {
  column: Column;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  computedValue: (column: Column, studentId: string) => number | null;
  students: Student[];
}

export default function ColumnHeader({
  column,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  computedValue,
  students,
}: ColumnHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getTypeLabel = () => {
    switch (column.type) {
      case "input":
        return "Input";
      case "sum":
        return "Sum";
      case "max":
        return "Max";
      case "average":
        return "Average";
      case "round":
        return `Round (${column.roundTo ?? 1.0})`;
      default:
        return "";
    }
  };

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <div className="font-semibold text-gray-900 truncate">
              {column.title}
            </div>
            {column.pinned && (
              <span className="text-xs text-yellow-600" title="Pinned">
                📌
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{getTypeLabel()}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg
            className="w-4 h-4"
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
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <button
              onClick={() => {
                onEdit();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
            >
              Edit Column
            </button>
            {onMoveUp && (
              <button
                onClick={() => {
                  onMoveUp();
                  setShowMenu(false);
                }}
                disabled={!canMoveUp}
                className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${
                  !canMoveUp ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Move Left
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={() => {
                  onMoveDown();
                  setShowMenu(false);
                }}
                disabled={!canMoveDown}
                className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${
                  !canMoveDown ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Move Right
              </button>
            )}
            <button
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
            >
              Delete Column
            </button>
          </div>
        </>
      )}
    </div>
  );
}

