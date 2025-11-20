"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { hasActiveSubscription, getSubscription } from "@/lib/subscription";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  trialDays?: number;
}

export default function PricingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  // Check current subscription
  useEffect(() => {
    if (typeof window !== "undefined") {
      const subscription = getSubscription();
      if (subscription) {
        setCurrentPlan(subscription.plan);
      }
    }
  }, []);

  const plans: PricingPlan[] = [
    {
      id: "trial",
      name: t("subscription.freeTrial"),
      price: t("subscription.free"),
      period: "7 " + t("subscription.days"),
      description: t("subscription.trialDescription"),
      features: [
        t("subscription.feature1"),
        t("subscription.feature2"),
        t("subscription.feature3"),
      ],
      trialDays: 7,
    },
    {
      id: "monthly",
      name: t("subscription.monthly"),
      price: "10 SR",
      period: t("subscription.perMonth"),
      description: t("subscription.monthlyDescription"),
      features: [
        t("subscription.feature1"),
        t("subscription.feature2"),
        t("subscription.feature3"),
        t("subscription.feature4"),
      ],
      popular: true,
    },
    {
      id: "yearly",
      name: t("subscription.yearly"),
      price: "100 SR",
      period: t("subscription.perYear"),
      description: t("subscription.yearlyDescription"),
      features: [
        t("subscription.feature1"),
        t("subscription.feature2"),
        t("subscription.feature3"),
        t("subscription.feature4"),
        t("subscription.feature5"),
      ],
    },
  ];

  const handleSubscribe = (planId: string) => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/?redirect=pricing");
      return;
    }
    
    // Redirect to payment page
    router.push(`/payment?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {t("pricing.title")}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("pricing.subtitle")}
            </p>
          </div>

          {/* Current Subscription Status */}
          {currentPlan && (
            <Card className="mb-8 bg-blue-50 border-blue-200 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">
                    {t("subscription.currentPlan")}
                  </h3>
                  <p className="text-blue-700">
                    {plans.find((p) => p.id === currentPlan)?.name} -{" "}
                    {plans.find((p) => p.id === currentPlan)?.price}{" "}
                    {plans.find((p) => p.id === currentPlan)?.period}
                  </p>
                </div>
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  {t("subscription.active")}
                </span>
              </div>
            </Card>
          )}

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-2 border-blue-500 shadow-lg scale-105"
                    : ""
                } ${currentPlan === plan.id ? "bg-blue-50" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {t("subscription.popular")}
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.price !== t("subscription.free") && (
                      <span className="text-gray-600 text-lg">
                        {" "}
                        / {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 mr-2 rtl:mr-0 rtl:ml-2">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? "primary" : "outline"}
                  className="w-full"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id
                    ? t("subscription.current")
                    : plan.id === "trial"
                    ? t("subscription.startTrial")
                    : t("subscription.subscribe")}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

