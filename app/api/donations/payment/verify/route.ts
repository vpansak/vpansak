import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { contributions } from "../../../../../db/schema";
import {
  buildAppreciationMessage,
  generateCertificateNumber,
} from "../../../../lib/contributions";
import {
  basicAuth,
  razorpayConfig,
  validRazorpaySignature,
} from "../../../../lib/payment";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const orderId = String(body.razorpay_order_id || "").trim();
    const paymentId = String(body.razorpay_payment_id || "").trim();
    const signature = String(body.razorpay_signature || "").trim();
    const verificationId = String(body.verificationId || body.certificateId || "").trim().toUpperCase();

    if (
      !verificationId ||
      !/^VPC\d{6}$/.test(verificationId) ||
      !/^order_[A-Za-z0-9]+$/.test(orderId) ||
      !/^pay_[A-Za-z0-9]+$/.test(paymentId) ||
      !/^[a-f0-9]{64}$/i.test(signature)
    ) {
      return Response.json(
        { error: "Invalid payment response format." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Find contribution record by verificationId or orderId
    const [row] = await db
      .select()
      .from(contributions)
      .where(eq(contributions.verificationId, verificationId))
      .limit(1);

    if (!row) {
      return Response.json(
        { error: "Contribution record not found for verification." },
        { status: 404 }
      );
    }

    // Idempotency check: check if payment ID was already processed
    const [existingPayment] = await db
      .select()
      .from(contributions)
      .where(eq(contributions.razorpayPaymentId, paymentId))
      .limit(1);

    if (existingPayment && existingPayment.paymentStatus === "verified") {
      return Response.json({
        message: "Payment verified successfully.",
        verificationId: existingPayment.verificationId,
        certificateNumber: existingPayment.certificateNumber,
        paymentStatus: "verified",
        certificate: {
          verificationId: existingPayment.verificationId,
          certificateNumber: existingPayment.certificateNumber,
          fullName: existingPayment.fullName,
          amount: existingPayment.amount,
          paymentMethod: existingPayment.paymentMethod,
          appreciationMessage: buildAppreciationMessage(
            existingPayment.fullName,
            existingPayment.amount
          ),
          submittedAt: existingPayment.submittedAt,
          verifiedAt: existingPayment.verifiedAt,
          paymentStatus: "verified",
          founderName: "Alok Singh",
          founderDesignation: "Founder & Authorized Signatory",
          signatureUrl: "/assets/certificate/alok-singh-signature.png?v=2",
        },
      });
    }

    // 1. Verify HMAC SHA256 Signature
    const { keyId, keySecret } = await razorpayConfig();
    const isValidSig = await validRazorpaySignature(
      orderId,
      paymentId,
      signature,
      keySecret
    );

    if (!isValidSig) {
      console.error(
        `Razorpay signature verification failed for verificationId=${verificationId}, orderId=${orderId}`
      );
      await db
        .update(contributions)
        .set({
          paymentStatus: "verification_failed",
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(contributions.verificationId, verificationId));

      return Response.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    // 2. Fetch Razorpay Order & Payment APIs to verify captured status
    const [orderRes, paymentRes] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
        headers: { authorization: basicAuth(keyId, keySecret) },
      }),
      fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: { authorization: basicAuth(keyId, keySecret) },
      }),
    ]);

    const orderData = (await orderRes.json()) as {
      receipt?: string;
      amount?: number;
    };
    const paymentData = (await paymentRes.json()) as {
      order_id?: string;
      amount?: number;
      status?: string;
      captured?: boolean;
    };

    const isCaptured =
      orderRes.ok &&
      paymentRes.ok &&
      paymentData.order_id === orderId &&
      paymentData.amount === row.amount * 100 &&
      (paymentData.captured || paymentData.status === "captured");

    if (!isCaptured) {
      console.error(
        `Razorpay API capture validation failed for paymentId=${paymentId}`
      );
      await db
        .update(contributions)
        .set({
          paymentStatus: "verification_failed",
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(contributions.verificationId, verificationId));

      return Response.json(
        { error: "Payment capture validation failed." },
        { status: 400 }
      );
    }

    // 3. Mark as verified & generate certificate number
    const now = new Date().toISOString();
    const certificateNumber = await generateCertificateNumber(db);

    await db
      .update(contributions)
      .set({
        paymentStatus: "verified",
        verificationMethod: "razorpay_auto",
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        verifiedAt: now,
        verifiedBy: "system",
        certificateNumber,
        certificateGeneratedAt: now,
        updatedAt: now,
      })
      .where(eq(contributions.verificationId, verificationId));

    const appreciationMessage = buildAppreciationMessage(
      row.fullName,
      row.amount
    );

    return Response.json({
      message: "Payment verified successfully.",
      verificationId: row.verificationId,
      certificateNumber,
      paymentStatus: "verified",
      certificate: {
        verificationId: row.verificationId,
        certificateNumber,
        fullName: row.fullName,
        amount: row.amount,
        paymentMethod: `Online • ${paymentId}`,
        appreciationMessage,
        submittedAt: row.submittedAt,
        verifiedAt: now,
        certificateGeneratedAt: now,
        paymentStatus: "verified",
        verificationMethod: "razorpay_auto",
        founderName: "Alok Singh",
        founderDesignation: "Founder & Authorized Signatory",
        signatureUrl: "/assets/certificate/alok-singh-signature.png",
      },
    });
  } catch (err) {
    console.error("Razorpay verification error:", err);
    return Response.json(
      { error: "Payment verification could not be completed." },
      { status: 500 }
    );
  }
}
