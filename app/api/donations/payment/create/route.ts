import { getDb } from "../../../../../db";
import { contributions } from "../../../../../db/schema";
import { generateVerificationId } from "../../../../lib/contributions";
import { basicAuth, razorpayConfig } from "../../../../lib/payment";
import { saveContributionToSupabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const amount = Math.round(Number(body.amount));
    const fullName = String(body.name || body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const mobile = String(body.mobile || "").trim();

    if (
      !fullName ||
      fullName.length < 2 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !/^[6-9]\d{9}$/.test(mobile) ||
      !amount ||
      amount < 1 ||
      amount > 1000000
    ) {
      return Response.json(
        { error: "Please enter valid contributor details and contribution amount." },
        { status: 400 }
      );
    }

    const { keyId, keySecret } = await razorpayConfig();
    const verificationId = generateVerificationId();

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        authorization: basicAuth(keyId, keySecret),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: "INR",
        receipt: verificationId,
        notes: {
          purpose: "VPANSAK Support Fund",
          verification_id: verificationId,
        },
      }),
    });

    const order = (await response.json()) as {
      id?: string;
      amount?: number;
      currency?: string;
      error?: { description?: string };
    };

    if (!response.ok || !order.id) {
      return Response.json(
        { error: order.error?.description || "Failed to create Razorpay payment order." },
        { status: 502 }
      );
    }

    const db = await getDb();
    const now = new Date().toISOString();

    const orderPayload = {
      verificationId,
      certificateNumber: null,
      fullName: fullName.slice(0, 100),
      email: email.slice(0, 150),
      mobile: mobile.slice(0, 20),
      amount,
      paymentMethod: "Razorpay",
      razorpayOrderId: order.id,
      paymentStatus: "pending_verification",
      verificationMethod: "razorpay_auto",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(contributions).values(orderPayload);
    void saveContributionToSupabase(orderPayload);

    return Response.json({
      keyId,
      verificationId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message === "PAYMENT_NOT_CONFIGURED") {
      return Response.json(
        { error: "Razorpay environment variables are not configured." },
        { status: 503 }
      );
    }
    return Response.json(
      { error: "Online contribution payment setup failed." },
      { status: 503 }
    );
  }
}
