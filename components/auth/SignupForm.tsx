"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Link from "next/link";

interface SignupFormProps {
  onSuccess?: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    workplace: "",
    acceptPrivacy: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.workplace.trim()) {
      newErrors.workplace = "Workplace is required";
    }

    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = "You must accept the privacy policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Store user data in localStorage
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        workplace: formData.workplace,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("currentUser", formData.email);

      // Call onSuccess callback if provided (to close modal)
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First Name and Last Name in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            type="text"
            name="firstName"
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />
        </div>
        <div>
          <Input
            type="text"
            name="lastName"
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
      </div>

      {/* Phone */}
      <div>
        <Input
          type="tel"
          name="phone"
          label="Phone Number"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />
      </div>

      {/* Date of Birth and Gender in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            type="date"
            name="dateOfBirth"
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            error={errors.dateOfBirth}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.gender
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 hover:border-gray-400"
            }`}
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.gender}
            </p>
          )}
        </div>
      </div>

      {/* Workplace */}
      <div>
        <Input
          type="text"
          name="workplace"
          label="Workplace"
          placeholder="Enter your workplace/university"
          value={formData.workplace}
          onChange={handleChange}
          error={errors.workplace}
          required
        />
      </div>

      {/* Privacy Policy Acceptance */}
      <div>
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="acceptPrivacy"
            checked={formData.acceptPrivacy}
            onChange={handleChange}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <span className="text-sm text-gray-700">
            I accept the{" "}
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-700 underline"
              target="_blank"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-700 underline"
              target="_blank"
            >
              Terms of Service
            </Link>
          </span>
        </label>
        {errors.acceptPrivacy && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.acceptPrivacy}
          </p>
        )}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="text-red-600 text-sm text-center">{errors.submit}</div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating Account..." : "Sign Up"}
      </Button>

      {/* Login Link */}
      <div className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Log in
        </Link>
      </div>
    </form>
  );
}

