// Tap Payments API integration
// Note: Payment requests are made directly from client (static export compatible)

export interface TapPaymentRequest {
  amount: number;
  currency: string;
  customer_initiated: boolean;
  threeDSecure: boolean;
  save_card: boolean;
  statement_descriptor: string;
  receipt: {
    email: boolean;
    sms: boolean;
  };
  metadata: {
    udf1: string;
    udf2: string;
    udf3: string;
  };
  reference: {
    transaction: string;
    order: string;
  };
  customer: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    phone: {
      country_code: string;
      number: string;
    };
  };
  merchant: {
    id: string;
  };
  source: {
    id: string;
  };
  authorize_debit: boolean;
  auto?: {
    type: string;
    time: number;
  };
  post?: {
    url: string;
  };
  redirect: {
    url: string;
  };
}

export interface TapPaymentResponse {
  id: string;
  object: string;
  live_mode: boolean;
  api_version: string;
  status: string;
  amount: number;
  currency: string;
  threeDSecure: boolean;
  save_card: boolean;
  statement_descriptor: string;
  description: string;
  transaction: {
    url: string;
  };
  reference: {
    transaction: string;
    order: string;
  };
  response: {
    code: string;
    message: string;
  };
  receipt: {
    email: boolean;
    sms: boolean;
  };
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: {
      country_code: string;
      number: string;
    };
  };
  merchant: {
    id: string;
  };
  source: {
    id: string;
    object: string;
    type: string;
    payment_method: string;
  };
  redirect: {
    url: string;
  };
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function getUserData(): UserData | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem("userData");
  if (!stored) return null;

  try {
    const data = JSON.parse(stored);
    return {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phone: data.phone || "",
    };
  } catch (e) {
    console.error("Error parsing user data:", e);
    return null;
  }
}

export function parsePhoneNumber(phone: string): { country_code: string; number: string } {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  // Default to Saudi Arabia (+966) if no country code
  if (digits.startsWith("966")) {
    return {
      country_code: "966",
      number: digits.substring(3),
    };
  } else if (digits.startsWith("0")) {
    // Remove leading 0 and assume Saudi Arabia
    return {
      country_code: "966",
      number: digits.substring(1),
    };
  } else {
    // Assume it's a Saudi number without country code
    return {
      country_code: "966",
      number: digits,
    };
  }
}

export async function createTapPayment(
  amount: number,
  planId: string,
  redirectUrl: string
): Promise<TapPaymentResponse> {
  const userData = getUserData();
  
  if (!userData) {
    throw new Error("User data not found. Please complete your profile first.");
  }

  const phone = parsePhoneNumber(userData.phone);

  // Call Tap API directly from client
  // Note: This requires CORS to be enabled on Tap's API or use a CORS proxy
  const TAP_API_URL = "https://api.tap.company/v2/authorize/";
  const TAP_SECRET_KEY = process.env.NEXT_PUBLIC_TAP_SECRET_KEY || "sk_test_XKokBfNWv6FIYuTMg5sLPjhJ";
  const TAP_MERCHANT_ID = process.env.NEXT_PUBLIC_TAP_MERCHANT_ID || "1234";

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const orderId = `ord_${planId}_${Date.now()}`;

  const paymentRequest = {
    amount: amount,
    currency: "SAR",
    customer_initiated: true,
    threeDSecure: true,
    save_card: true,
    statement_descriptor: "Student Grading Subscription",
    receipt: {
      email: true,
      sms: true,
    },
    metadata: {
      udf1: planId,
      udf2: userData.email,
      udf3: transactionId,
    },
    reference: {
      transaction: transactionId,
      order: orderId,
    },
    customer: {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone: {
        country_code: phone.country_code,
        number: phone.number,
      },
    },
    merchant: {
      id: TAP_MERCHANT_ID,
    },
    source: {
      id: "src_card",
    },
    authorize_debit: false,
    redirect: {
      url: redirectUrl,
    },
  };

  // Try direct call first, fallback to CORS proxy if needed
  try {
    const response = await fetch(TAP_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TAP_SECRET_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Payment request failed");
    }

    return await response.json();
  } catch (error: any) {
    // If CORS error, show message to user
    if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
      throw new Error("Payment service is not accessible. Please contact support or use a different payment method.");
    }
    throw error;
  }
}

