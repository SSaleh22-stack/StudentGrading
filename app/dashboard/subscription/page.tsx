"use client";

import { useEffect, useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import SideNav from "@/components/layout/SideNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getSubscription } from "@/lib/subscription";
import { getCurrentUser } from "@/lib/storage";
import { isAdmin } from "@/lib/admin";

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

function SubscriptionContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    // Redirect admin users to admin dashboard
    const user = getCurrentUser();
    if (user && isAdmin(user)) {
      router.push("/admin");
      return;
    }

    // Load current subscription
    try {
      const subscription = getSubscription();
      if (subscription) {
        setCurrentPlan(subscription.plan);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    }
    
    // Show success message if redirected from payment
    if (searchParams.get("success") === "true") {
      alert(t("subscription.subscribedSuccess"));
      // Remove success param from URL
      router.replace("/dashboard/subscription");
    }
  }, [router, searchParams, t]);

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
    // Redirect to payment page
    router.push(`/payment?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("subscription.title")}
            </h1>
            <p className="text-gray-600 mb-8">
              {t("subscription.subtitle")}
            </p>

            {/* Current Subscription Status */}
            {currentPlan && (
              <Card className="mb-8 bg-blue-50 border-blue-200">
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
                  className={`relative overflow-hidden ${
                    plan.popular
                      ? "border-2 border-blue-500 shadow-xl scale-105 ring-4 ring-blue-100"
                      : "border border-gray-200"
                  } ${currentPlan === plan.id ? "bg-gradient-to-br from-blue-50 to-white" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        {t("subscription.popular")}
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {plan.name}
                    </h3>
                    <div className="mb-3">
                      <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      {plan.price !== t("subscription.free") && (
                        <span className="text-gray-600 text-base font-medium">
                          {" "}
                          / {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start group/item">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 group-hover/item:bg-green-200 transition-colors">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700 mr-2 rtl:mr-0 rtl:ml-2 leading-relaxed">
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
          <div className="lg:col-span-1">
            <SideNav />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Subscription() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}

