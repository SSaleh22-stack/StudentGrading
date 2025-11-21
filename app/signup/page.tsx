"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import SignupForm from "@/components/auth/SignupForm";

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    try {
      const isLoggedIn = typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null;
      if (isLoggedIn === "true") {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  }, [router]);

  const email = searchParams.get("email");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600">
              {email 
                ? "Account not found. Please sign up to create your account."
                : "Join Student Grading and start managing your grades efficiently"}
            </p>
          </div>

          <Card>
            <SignupForm initialEmail={email || undefined} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}

