"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { setSubscription } from "@/lib/subscription";

export default function PaymentCallback() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Get payment status from URL parameters
    const tap_id = searchParams.get("tap_id");
    const status = searchParams.get("status");
    const planId = searchParams.get("plan") || localStorage.getItem("pendingPlanId");

    if (status === "CAPTURED" || status === "AUTHORIZED") {
      // Payment successful
      if (planId) {
        const userEmail = localStorage.getItem("userEmail") || localStorage.getItem("currentUser");
        setSubscription(planId, userEmail || undefined);
        localStorage.removeItem("pendingPlanId");
        setStatus("success");
        setMessage(t("payment.successMessage"));
        
        // Redirect to subscription page after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/subscription?success=true");
        }, 2000);
      } else {
        setStatus("failed");
        setMessage(t("payment.planNotFound"));
      }
    } else if (status === "FAILED" || status === "DECLINED") {
      // Payment failed
      setStatus("failed");
      setMessage(t("payment.failedMessage"));
      localStorage.removeItem("pendingPlanId");
    } else if (tap_id) {
      // Still processing
      setStatus("processing");
      setMessage(t("payment.processing"));
    } else {
      // No payment data
      setStatus("failed");
      setMessage(t("payment.invalidCallback"));
    }
  }, [searchParams, router, t]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center py-12">
              {status === "processing" && (
                <>
                  <LoadingSpinner size="lg" className="mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t("payment.processing")}
                  </h2>
                  <p className="text-gray-600">{message}</p>
                </>
              )}

              {status === "success" && (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
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
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">
                    {t("payment.paymentSuccessful")}
                  </h2>
                  <p className="text-gray-600 mb-6">{message}</p>
                  <Button
                    variant="primary"
                    onClick={() => router.push("/dashboard/subscription")}
                  >
                    {t("payment.goToSubscription")}
                  </Button>
                </>
              )}

              {status === "failed" && (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-red-600 mb-2">
                    {t("payment.paymentFailed")}
                  </h2>
                  <p className="text-gray-600 mb-6">{message}</p>
                  <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/pricing")}
                    >
                      {t("payment.tryAgain")}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => router.push("/dashboard")}
                    >
                      {t("common.dashboard")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

