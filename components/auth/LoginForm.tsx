"use client";

import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Link from "next/link";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setShowSignupPrompt(false);

    // Simple fake auth - just check that fields are filled
    if (!email || !password) {
      setError(t("errors.required"));
      return;
    }

    // Check if it's an admin account first
    const { isAdmin, verifyAdminPassword } = await import("@/lib/admin");
    if (isAdmin(email)) {
      // Verify admin password
      if (!verifyAdminPassword(email, password)) {
        setError("Invalid email or password");
        return;
      }
      
      // Admin login successful
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("currentUser", email);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Admin can access dashboard now
      router.push("/dashboard");
      return;
    }

    // Check if user exists in localStorage
    const { getUserByEmail } = await import("@/lib/storage");
    const { isUserLocked } = await import("@/lib/user-lock");
    const user = getUserByEmail(email);

    if (!user) {
      // User not found - ask user if they want to create an account
      setShowSignupPrompt(true);
      return;
    }

    // Check if account is locked
    if (isUserLocked(email)) {
      setError("This account has been locked. Please contact support.");
      return;
    }

    // Validate password
    if (!user.password || user.password !== password) {
      setError("Invalid email or password");
      return;
    }

    // User exists and password matches - log them in
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("currentUser", email);
    localStorage.setItem("userData", JSON.stringify(user));

    // Call onSuccess callback if provided (to close modal)
    if (onSuccess) {
      onSuccess();
    }

    // Regular user - redirect to dashboard
    router.push("/dashboard");
  };

  const handleCreateAccount = () => {
    router.push(`/signup?email=${encodeURIComponent(email)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          label={t("landing.email")}
          placeholder={t("landing.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          label={t("landing.password")}
          placeholder={t("landing.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}
      
      {showSignupPrompt && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <p className="text-sm text-blue-900">
            {t("login.accountNotFound") || "Account not found. Would you like to create a new account?"}
          </p>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateAccount}
              className="flex-1"
            >
              {t("common.yes") || "Yes, Create Account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSignupPrompt(false)}
              className="flex-1"
            >
              {t("common.cancel") || "Cancel"}
            </Button>
          </div>
        </div>
      )}
      
      <Button type="submit" variant="primary" className="w-full" disabled={showSignupPrompt}>
        {t("common.login")}
      </Button>
      <div className="text-center text-sm text-gray-600">
        {t("landing.noAccount")}{" "}
        <Link
          href="/signup"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {t("landing.signupLink")}
        </Link>
      </div>
    </form>
  );
}

