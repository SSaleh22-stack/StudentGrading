import { NextRequest, NextResponse } from "next/server";

const TAP_API_URL = "https://api.tap.company/v2/authorize/";
const TAP_SECRET_KEY = process.env.NEXT_PUBLIC_TAP_SECRET_KEY || "sk_test_XKokBfNWv6FIYuTMg5sLPjhJ";
const TAP_MERCHANT_ID = process.env.NEXT_PUBLIC_TAP_MERCHANT_ID || "1234";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, planId, redirectUrl, customer } = body;

    if (!amount || !planId || !redirectUrl || !customer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
        udf2: customer.email,
        udf3: transactionId,
      },
      reference: {
        transaction: transactionId,
        order: orderId,
      },
      customer: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: {
          country_code: customer.phone.country_code,
          number: customer.phone.number,
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
      return NextResponse.json(
        { error: error.message || "Payment request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

