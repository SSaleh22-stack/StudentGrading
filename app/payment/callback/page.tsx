"use client";

import { useEffect, useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { setSubscription } from "@/lib/subscription";

function PaymentCallbackContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Get payment status from URL parameters
    const tap_id = searchParams.get("tap_id");
    const status = searchParams.get("status");
    
    let planId: string | null = null;
    try {
      planId = searchParams.get("plan") || (typeof window !== "undefined" ? localStorage.getItem("pendingPlanId") : null);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }

    if (status === "CAPTURED" || status === "AUTHORIZED") {
      // Payment successful
      if (planId) {
        try {
          const userEmail = typeof window !== "undefined" 
            ? (localStorage.getItem("userEmail") || localStorage.getItem("currentUser"))
            : null;
          setSubscription(planId, userEmail || undefined);
          if (typeof window !== "undefined") {
            localStorage.removeItem("pendingPlanId");
          }
          setStatus("success");
          setMessage(t("payment.successMessage"));
        } catch (error) {
          console.error("Error processing payment success:", error);
          setStatus("failed");
          setMessage(t("payment.planNotFound"));
        }
      } else {
        setStatus("failed");
        setMessage(t("payment.planNotFound"));
      }
    } else if (status === "FAILED" || status === "DECLINED") {
      // Payment failed
      setStatus("failed");
      setMessage(t("payment.failedMessage"));
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingPlanId");
        }
      } catch (error) {
        console.error("Error removing pending plan:", error);
      }
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

export default function PaymentCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Processing...
                </h2>
              </div>
            </Card>
          </div>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

