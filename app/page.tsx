"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  const { t } = useTranslation();
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsAnimated(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 via-white to-gray-50"
      >
        {/* Background image - will be used when user adds hero-bg.jpg to public folder */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/60"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className={`transition-all duration-1000 ease-out ${
                isAnimated
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="mb-8">
                {/* Placeholder Logo */}
                <div className="inline-block bg-gradient-to-br from-blue-600 to-blue-800 text-white px-8 py-4 rounded-2xl shadow-xl mb-6 transform hover:scale-105 transition-transform duration-300">
                  <span className="text-2xl font-bold">SG</span>
                </div>
              </div>
              <h1
                className={`text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 transition-all duration-1000 ease-out ${
                  isAnimated
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                {t("landing.title")}
              </h1>
              <p
                className={`text-xl md:text-2xl text-gray-700 mb-8 transition-all duration-1000 ease-out ${
                  isAnimated
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                {t("landing.description")}
              </p>
              <div
                className={`transition-all duration-1000 ease-out ${
                  isAnimated
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "600ms" }}
              >
                <p className="text-gray-600 mb-4">
                  {t("landing.noAccount")}{" "}
                  <Link
                    href="/signup"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t("landing.signupLink")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
