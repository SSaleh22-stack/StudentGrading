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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Simple fake auth - just check that fields are filled
    if (!email || !password) {
      setError(t("errors.required"));
      return;
    }

    // Store fake login state in localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);

    // Call onSuccess callback if provided (to close modal)
    if (onSuccess) {
      onSuccess();
    }

    // Redirect to dashboard
    router.push("/dashboard");
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
      <Button type="submit" variant="primary" className="w-full">
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

