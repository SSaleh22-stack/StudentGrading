import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en.json";
import arTranslations from "./locales/ar.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: typeof window !== "undefined" ? localStorage.getItem("language") || "en" : "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  // Save language preference
  i18n.on("languageChanged", (lng) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lng);
      document.documentElement.lang = lng;
      document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    }
  });

  // Set initial dir
  if (typeof window !== "undefined") {
    const savedLang = localStorage.getItem("language") || "en";
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
  }
}

export default i18n;

