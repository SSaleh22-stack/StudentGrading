"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LoginForm from "@/components/auth/LoginForm";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

export default function Navbar() {
  const { t } = useTranslation();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check login status
    const checkLogin = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };
    checkLogin();
    // Listen for storage changes (in case of logout)
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-900 transition-all duration-200"
            >
              {t("landing.title")}
            </Link>

            {/* Navigation Links + Login/Logout Button */}
            <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
              <Link
                href="/"
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                  pathname === "/"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {t("common.home")}
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                  pathname === "/about"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {t("common.aboutUs")}
              </Link>
              <Link
                href="/pricing"
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                  pathname === "/pricing"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {t("common.pricing")}
              </Link>
              <Link
                href="/contact"
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                  pathname === "/contact"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {t("common.contactUs")}
              </Link>
              <LanguageSwitcher />
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" size="md">
                      {t("common.dashboard")}
                    </Button>
                  </Link>
                  <Button variant="secondary" size="md" onClick={handleLogout}>
                    {t("common.logout")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  {t("common.login")}
                </Button>
              )}
            </div>

            {/* Mobile menu button (placeholder for now) */}
            <button className="md:hidden text-gray-700">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title={t("landing.loginTitle")}
      >
        <LoginForm onSuccess={() => setIsLoginModalOpen(false)} />
      </Modal>
    </>
  );
}

