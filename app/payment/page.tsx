"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { setSubscription } from "@/lib/subscription";
import { createTapPayment, getUserData } from "@/lib/tap-payments";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
}

export default function PaymentPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "monthly";
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plans: Record<string, PricingPlan> = {
    trial: {
      id: "trial",
      name: t("subscription.freeTrial"),
      price: t("subscription.free"),
      period: "7 " + t("subscription.days"),
    },
    monthly: {
      id: "monthly",
      name: t("subscription.monthly"),
      price: "10 SR",
      period: t("subscription.perMonth"),
    },
    yearly: {
      id: "yearly",
      name: t("subscription.yearly"),
      price: "100 SR",
      period: t("subscription.perYear"),
    },
  };

  const selectedPlan = plans[planId] || plans.monthly;

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // For free trial, no payment needed
      if (selectedPlan.id === "trial") {
        const userEmail = localStorage.getItem("userEmail") || localStorage.getItem("currentUser");
        setSubscription(selectedPlan.id, userEmail || undefined);
        router.push("/dashboard/subscription?success=true");
        return;
      }

      // Check if user data exists
      const userData = getUserData();
      if (!userData) {
        setError(t("payment.userDataRequired"));
        setLoading(false);
        return;
      }

      // Calculate amount based on plan
      const amount = selectedPlan.id === "monthly" ? 10 : 100;

      // Get redirect URL
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const redirectUrl = `${baseUrl}/payment/callback?plan=${selectedPlan.id}`;

      // Store pending plan ID
      localStorage.setItem("pendingPlanId", selectedPlan.id);

      // Create Tap Payment
      const paymentResponse = await createTapPayment(amount, selectedPlan.id, redirectUrl);

      // Redirect to Tap Payments checkout page
      if (paymentResponse.redirect?.url) {
        window.location.href = paymentResponse.redirect.url;
      } else if (paymentResponse.transaction?.url) {
        window.location.href = paymentResponse.transaction.url;
      } else {
        throw new Error("No redirect URL received from payment provider");
      }
    } catch (err: any) {
      setError(err.message || t("payment.paymentError"));
      setLoading(false);
      localStorage.removeItem("pendingPlanId");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("payment.title")}
          </h1>
          <p className="text-gray-600 mb-8">{t("payment.subtitle")}</p>

          {/* Selected Plan Summary */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  {selectedPlan.name}
                </h3>
                <p className="text-blue-700">
                  {selectedPlan.price} {selectedPlan.period}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/pricing")}
              >
                {t("payment.changePlan")}
              </Button>
            </div>
          </Card>

          {/* Payment Form */}
          {selectedPlan.id === "trial" ? (
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center py-8">
                  <p className="text-gray-700 mb-6">
                    {t("payment.trialNoPayment")}
                  </p>
                  <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        {t("payment.processing")}
                      </span>
                    ) : (
                      t("payment.startTrial")
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    {t("payment.tapPaymentInfo")}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        {t("payment.processing")}
                      </span>
                    ) : (
                      t("payment.proceedToPayment")
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    {t("payment.securePayment")}
                  </p>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

