"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  GradeFile,
  Page,
  AttendanceRecord,
  Student,
  AttendanceStatus,
} from "@/lib/types";
import Button from "../ui/Button";
import { saveFile } from "@/lib/storage";
import Modal from "../ui/Modal";
import { downloadAttendanceAsCSV, generatePDFContent } from "@/lib/download";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useRouter } from "next/navigation";

interface AttendancePageProps {
  file: GradeFile;
  page: Page;
  onFileUpdate: (updatedFile: GradeFile) => void;
}

export default function AttendancePage({
  file,
  page,
  onFileUpdate,
}: AttendancePageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >((page as any).attendanceRecords || []);
  const [showHistory, setShowHistory] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [historySelectedDate, setHistorySelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  
  const hasSubscription = hasActiveSubscription();
  
  const checkSubscription = () => {
    if (!hasActiveSubscription()) {
      alert(t("subscription.needSubscription"));
      router.push("/pricing");
      return false;
    }
    return true;
  };

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Get yesterday's date
  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };

  // Get tomorrow's date
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Navigate to date
  const navigateToDate = (date: string) => {
    setSelectedDate(date);
  };

  // Get attendance for selected date
  const getAttendanceForDate = (
    studentId: string,
    date: string
  ): AttendanceStatus | null => {
    const record = attendanceRecords.find(
      (r) => r.studentId === studentId && r.date === date
    );
    return record?.status || null;
  };

  // Set attendance for selected date
  const setAttendance = (
    studentId: string,
    status: AttendanceStatus,
    date?: string
  ) => {
    if (!checkSubscription()) return;
    
    const targetDate = date || selectedDate;
    setAttendanceRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.studentId === studentId && r.date === targetDate)
      );
      return [
        ...filtered,
        {
          date: targetDate,
          studentId,
          status,
        },
      ];
    });

    setSaveStatus("unsaved");
    handleAutoSave();
  };

  // Mark all students for selected date
  const markAll = (status: AttendanceStatus) => {
    if (!checkSubscription()) return;
    
    file.students.forEach((student) => {
      setAttendance(student.id, status, selectedDate);
    });
  };

  // Auto-save
  const handleAutoSave = () => {
    setSaveStatus("saving");

    const updatedPages = file.pages?.map((p) =>
      p.id === page.id
        ? {
            ...p,
            attendanceRecords,
            updatedAt: new Date().toISOString(),
          }
        : p
    ) || [];

    const updatedFile: GradeFile = {
      ...file,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    saveFile(updatedFile);
    onFileUpdate(updatedFile);

    setTimeout(() => {
      setSaveStatus("saved");
    }, 500);
  };

  // Get all unique dates from records
  const allDates = Array.from(
    new Set(attendanceRecords.map((r) => r.date))
  ).sort((a, b) => b.localeCompare(a)); // Most recent first

  // Update attendance in history
  const updateAttendanceInHistory = (
    date: string,
    studentId: string,
    status: AttendanceStatus
  ) => {
    if (!checkSubscription()) return;
    
    setAttendanceRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.studentId === studentId && r.date === date)
      );
      return [
        ...filtered,
        {
          date,
          studentId,
          status,
        },
      ];
    });
    setSaveStatus("unsaved");
    handleAutoSave();
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {file.students.length} student{file.students.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll("present")}
            >
              {t("attendance.markAllPresent")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll("absent")}
            >
              {t("attendance.markAllAbsent")}
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {saveStatus === "saving" && (
              <span className="text-blue-600">{t("grading.saving")}</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-green-600">{t("grading.saved")}</span>
            )}
            {saveStatus === "unsaved" && (
              <span className="text-orange-600">{t("grading.unsaved")}</span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
            {t("attendance.showHistory")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleAutoSave}>
            {t("common.save")}
          </Button>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                downloadAttendanceAsCSV(file, page, file.students, attendanceRecords, selectedDate);
              }}
            >
              {t("common.download")} CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const content = generatePDFContent(
                  file,
                  page,
                  file.students,
                  [],
                  [],
                  "attendance",
                  attendanceRecords,
                  selectedDate
                );
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>${file.name}_${page.name}_${selectedDate}.pdf</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; }
                          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                          th { background-color: #f2f2f2; font-weight: bold; }
                          @media print { body { margin: 0; } @page { margin: 1cm; } }
                        </style>
                      </head>
                      <body>${content}</body>
                    </html>
                  `);
                  printWindow.document.close();
                  setTimeout(() => printWindow.print(), 250);
                }
              }}
            >
              {t("common.download")} PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToDate(getYesterday())}
            >
              ← {t("attendance.yesterday")}
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => navigateToDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToDate(today)}
            >
              {t("attendance.today")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToDate(getTomorrow())}
            >
              {t("attendance.tomorrow")} →
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {t("attendance.title")} ({new Date(selectedDate).toLocaleDateString()})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200 min-w-[120px] rtl:left-auto rtl:right-0">
                  {t("grading.student")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-[120px] bg-gray-50 z-10 border-r border-gray-200 min-w-[100px] rtl:left-auto rtl:right-[120px]">
                  {t("grading.id")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("attendance.status")}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("attendance.action")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {file.students.map((student) => {
                const status = getAttendanceForDate(student.id, selectedDate);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200 min-w-[120px] rtl:left-auto rtl:right-0">
                      {student.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 sticky left-[120px] bg-white z-10 border-r border-gray-200 min-w-[100px] rtl:left-auto rtl:right-[120px]">
                      {student.studentId}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {status === "present" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t("attendance.present")}
                        </span>
                      )}
                      {status === "absent" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {t("attendance.absent")}
                        </span>
                      )}
                      {status === "excused" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {t("attendance.excused")}
                        </span>
                      )}
                      {!status && <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                                <Button
                                  variant={status === "present" ? "primary" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    setAttendance(student.id, "present", selectedDate)
                                  }
                                  disabled={!hasSubscription}
                                >
                                  {t("attendance.present")}
                                </Button>
                                <Button
                                  variant={status === "absent" ? "primary" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    setAttendance(student.id, "absent", selectedDate)
                                  }
                                  disabled={!hasSubscription}
                                >
                                  {t("attendance.absent")}
                                </Button>
                                <Button
                                  variant={status === "excused" ? "primary" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    setAttendance(student.id, "excused", selectedDate)
                                  }
                                  disabled={!hasSubscription}
                                >
                                  {t("attendance.excused")}
                                </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <Modal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          title={t("attendance.attendanceHistory")}
        >
          <div className="space-y-4">
            {/* Date Selector */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <label className="text-sm font-medium text-gray-700">
                {t("attendance.selectDate")}:
              </label>
              <input
                type="date"
                value={historySelectedDate}
                onChange={(e) => setHistorySelectedDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Attendance Table for Selected Date */}
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("grading.student")}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("grading.id")}
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      {t("attendance.status")}
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      {t("attendance.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {file.students.map((student) => {
                    const status = getAttendanceForDate(
                      student.id,
                      historySelectedDate
                    );
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {student.studentId}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">
                          {status === "present" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {t("attendance.present")}
                            </span>
                          )}
                          {status === "absent" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {t("attendance.absent")}
                            </span>
                          )}
                          {status === "excused" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {t("attendance.excused")}
                            </span>
                          )}
                          {!status && (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              variant={status === "present" ? "primary" : "outline"}
                              size="sm"
                              onClick={() =>
                                updateAttendanceInHistory(
                                  historySelectedDate,
                                  student.id,
                                  "present"
                                )
                              }
                            >
                              P
                            </Button>
                            <Button
                              variant={status === "absent" ? "primary" : "outline"}
                              size="sm"
                              onClick={() =>
                                updateAttendanceInHistory(
                                  historySelectedDate,
                                  student.id,
                                  "absent"
                                )
                              }
                            >
                              A
                            </Button>
                            <Button
                              variant={status === "excused" ? "primary" : "outline"}
                              size="sm"
                              onClick={() =>
                                updateAttendanceInHistory(
                                  historySelectedDate,
                                  student.id,
                                  "excused"
                                )
                              }
                            >
                              E
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

