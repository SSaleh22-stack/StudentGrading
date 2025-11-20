"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/config";

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Set initial language and direction
    const savedLang = localStorage.getItem("language") || "en";
    
    // Update HTML attributes immediately
    if (typeof document !== "undefined") {
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    }

    // Initialize i18n if not already initialized
    if (!i18n.isInitialized) {
      i18n.init({
        lng: savedLang,
        fallbackLng: "en",
      });
    } else {
      i18n.changeLanguage(savedLang);
    }

    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = lng;
        document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
      }
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

