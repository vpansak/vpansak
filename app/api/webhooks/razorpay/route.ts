import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { contributions } from "../../../../db/schema";
import { generateCertificateNumber } from "../../../lib/contributions";
import { razorpayConfig } from "../../../lib/payment";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return Response.json({ error: "Missing webhook signature." }, { status: 400 });
    }

    const { keySecret } = await razorpayConfig();

    // Verify webhook HMAC signature
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(keySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(bodyText));
    const expectedSig = [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSig !== signature) {
      console.error("Invalid Razorpay webhook signature");
      return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    if (event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (paymentId && orderId) {
        const db = await getDb();
        const [row] = await db
          .select()
          .from(contributions)
          .where(eq(contributions.razorpayOrderId, orderId))
          .limit(1);

        if (row && row.paymentStatus !== "verified") {
          const now = new Date().toISOString();
          const certNo = await generateCertificateNumber(db);

          await db
            .update(contributions)
            .set({
              paymentStatus: "verified",
              verificationMethod: "razorpay_auto",
              razorpayPaymentId: paymentId,
              verifiedAt: now,
              verifiedBy: "system_webhook",
              certificateNumber: certNo,
              certificateGeneratedAt: now,
              updatedAt: now,
            })
            .where(eq(contributions.id, row.id));
        }
      }
    }

    return Response.json({ status: "ok" });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return Response.json({ error: "Webhook processing error." }, { status: 500 });
  }
}
