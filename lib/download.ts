import { GradeFile, Page, Student, Column, GradeValue, AttendanceRecord } from "./types";

// Download CSV for a single page (grading)
export function downloadPageAsCSV(
  file: GradeFile,
  page: Page,
  students: Student[],
  columns: Column[],
  grades: GradeValue[]
) {
  const sortedColumns = [...columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  // Header row
  const headers = ["Student Name", "Student ID", ...sortedColumns.map((col) => col.title)];
  const csvRows = [headers.join(",")];

  // Data rows
  students.forEach((student) => {
    const row = [
      `"${student.name}"`,
      `"${student.studentId}"`,
      ...sortedColumns.map((col) => {
        const grade = grades.find(
          (g) => g.columnId === col.id && g.studentId === student.id
        );
        return grade?.value !== null && grade?.value !== undefined
          ? grade.value.toString()
          : "";
      }),
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${file.name}_${page.name}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download CSV for attendance page
export function downloadAttendanceAsCSV(
  file: GradeFile,
  page: Page,
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  date: string
) {
  const headers = ["Student Name", "Student ID", "Status"];
  const csvRows = [headers.join(",")];

  students.forEach((student) => {
    const record = attendanceRecords.find(
      (r) => r.studentId === student.id && r.date === date
    );
    const status = record?.status || "Not Marked";
    const row = [`"${student.name}"`, `"${student.studentId}"`, `"${status}"`];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${file.name}_${page.name}_${date}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download entire file as CSV (all pages)
export function downloadFileAsCSV(
  file: GradeFile,
  students: Student[],
  pages: Page[]
) {
  const csvRows: string[] = [];
  
  pages.forEach((page) => {
    // Page header
    csvRows.push(`"Page: ${page.name}"`);
    
    if (page.type === "grading") {
      const sortedColumns = [...(page.columns || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
      
      // Headers
      const headers = ["Student Name", "Student ID", ...sortedColumns.map((col) => col.title)];
      csvRows.push(headers.join(","));
      
      // Data rows
      students.forEach((student) => {
        const row = [
          `"${student.name}"`,
          `"${student.studentId}"`,
          ...sortedColumns.map((col) => {
            const grade = (page.grades || []).find(
              (g) => g.columnId === col.id && g.studentId === student.id
            );
            return grade?.value !== null && grade?.value !== undefined
              ? grade.value.toString()
              : "";
          }),
        ];
        csvRows.push(row.join(","));
      });
    } else if (page.type === "attendance") {
      const attendanceRecords = (page as any).attendanceRecords || [];
      const allDates = Array.from(
        new Set(attendanceRecords.map((r: AttendanceRecord) => r.date))
      ).sort((a, b) => b.localeCompare(a));
      
      // Headers with dates
      const headers = ["Student Name", "Student ID", ...allDates];
      csvRows.push(headers.join(","));
      
      // Data rows
      students.forEach((student) => {
        const row = [
          `"${student.name}"`,
          `"${student.studentId}"`,
          ...allDates.map((date) => {
            const record = attendanceRecords.find(
              (r: AttendanceRecord) => r.studentId === student.id && r.date === date
            );
            return record?.status || "";
          }),
        ];
        csvRows.push(row.join(","));
      });
    }
    
    csvRows.push(""); // Empty row between pages
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${file.name}_all_pages.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download as PDF (using browser print functionality)
export function downloadAsPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Create a new window with the content
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  // Get the HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          @media print {
            body { margin: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

// Generate PDF content for a page
export function generatePDFContent(
  file: GradeFile,
  page: Page,
  students: Student[],
  columns: Column[],
  grades: GradeValue[],
  type: "grading" | "attendance",
  attendanceRecords?: AttendanceRecord[],
  date?: string
): string {
  let html = `<h1>${file.name}</h1>`;
  if (file.description) {
    html += `<p>${file.description}</p>`;
  }
  html += `<h2>${page.name}</h2>`;

  if (type === "grading") {
    const sortedColumns = [...columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    
    html += `<table><thead><tr><th>Student Name</th><th>Student ID</th>`;
    sortedColumns.forEach((col) => {
      html += `<th>${col.title}</th>`;
    });
    html += `</tr></thead><tbody>`;

    students.forEach((student) => {
      html += `<tr><td>${student.name}</td><td>${student.studentId}</td>`;
      sortedColumns.forEach((col) => {
        const grade = grades.find(
          (g) => g.columnId === col.id && g.studentId === student.id
        );
        const value =
          grade?.value !== null && grade?.value !== undefined
            ? grade.value.toString()
            : "—";
        html += `<td>${value}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table>`;
  } else if (type === "attendance" && attendanceRecords && date) {
    html += `<h3>Attendance for ${new Date(date).toLocaleDateString()}</h3>`;
    html += `<table><thead><tr><th>Student Name</th><th>Student ID</th><th>Status</th></tr></thead><tbody>`;

    students.forEach((student) => {
      const record = attendanceRecords.find(
        (r) => r.studentId === student.id && r.date === date
      );
      const status = record?.status || "Not Marked";
      html += `<tr><td>${student.name}</td><td>${student.studentId}</td><td>${status}</td></tr>`;
    });
    html += `</tbody></table>`;
  }

  return html;
}

