"use client";

import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial direction
    const updateDirection = (lng: string) => {
      if (typeof document !== "undefined") {
        document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = lng;
      }
    };

    updateDirection(i18n.language);

    // Listen for language changes
    i18n.on("languageChanged", updateDirection);

    return () => {
      i18n.off("languageChanged", updateDirection);
    };
  }, [i18n]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (typeof document !== "undefined") {
      document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lng;
    }
  };

  const currentLang = i18n.language || "en";

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1 text-sm font-medium rounded transition-all ${
          currentLang === "en"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("ar")}
        className={`px-3 py-1 text-sm font-medium rounded transition-all ${
          currentLang === "ar"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        عربي
      </button>
    </div>
  );
}

