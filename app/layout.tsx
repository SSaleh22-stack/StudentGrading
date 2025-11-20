import type { Metadata } from "next";
import "./globals.css";
import I18nProvider from "@/components/i18n/I18nProvider";

export const metadata: Metadata = {
  title: "Student Grading",
  description: "A bilingual web application for university teachers to manage student grades",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

