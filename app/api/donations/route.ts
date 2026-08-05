import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { contributions } from "../../../db/schema";
import {
  buildAppreciationMessage,
  generateVerificationId,
  maskEmail,
  maskMobile,
  maskName,
} from "../../lib/contributions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchId = (url.searchParams.get("certificate") || url.searchParams.get("verificationId") || url.searchParams.get("id"))?.trim().toUpperCase();

  if (!searchId) {
    return Response.json({ error: "Verification ID is required." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const [row] = await db
      .select()
      .from(contributions)
      .where(eq(contributions.verificationId, searchId))
      .limit(1);

    if (!row) {
      return Response.json({ error: "No contribution record was found for this Verification ID." }, { status: 404 });
    }

    if (row.paymentStatus === "verified") {
      return Response.json({
        status: "verified",
        statusRecord: {
          verificationId: row.verificationId,
          paymentStatus: row.paymentStatus,
          maskedName: maskName(row.fullName),
          maskedEmail: maskEmail(row.email),
          maskedMobile: maskMobile(row.mobile),
          amount: row.amount,
          paymentMethod: row.paymentMethod,
          submittedAt: row.submittedAt,
          verifiedAt: row.verifiedAt,
          certificateNumber: row.certificateNumber,
        },
        certificate: {
          verificationId: row.verificationId,
          certificateNumber: row.certificateNumber,
          fullName: row.fullName,
          amount: row.amount,
          paymentMethod: row.paymentMethod,
          appreciationMessage: buildAppreciationMessage(row.fullName, row.amount),
          submittedAt: row.submittedAt,
          verifiedAt: row.verifiedAt || row.createdAt,
          paymentStatus: row.paymentStatus,
          founderName: "Alok Singh",
          founderDesignation: "Founder & Authorized Signatory",
          signatureUrl: "/assets/certificate/alok-singh-signature.png?v=2",
        },
      });
    }

    return Response.json({
      status: row.paymentStatus,
      statusRecord: {
        verificationId: row.verificationId,
        paymentStatus: row.paymentStatus,
        maskedName: maskName(row.fullName),
        maskedEmail: maskEmail(row.email),
        maskedMobile: maskMobile(row.mobile),
        amount: row.amount,
        paymentMethod: row.paymentMethod,
        submittedAt: row.submittedAt,
        verifiedAt: null,
        certificateNumber: null,
        publicRejectionReason: row.paymentStatus === "rejected" ? row.publicRejectionReason : null,
      },
      certificate: null,
    });
  } catch (err) {
    console.error("Donation GET error:", err);
    return Response.json({ error: "Contribution lookup service unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fullName = String(body.name || body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const mobile = String(body.mobile || "").trim();
    const amount = Math.round(Number(body.amount));
    const rawMethod = String(body.paymentMethod || "manual").trim();
    const transactionId = String(body.transactionId || body.utr || "").trim();
    const screenshotUrl = String(body.paymentScreenshotUrl || "").trim();

    if (!fullName || fullName.length < 2) {
      return Response.json({ error: "Please enter a valid full name." }, { status: 400 });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return Response.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }
    if (!amount || amount < 1 || amount > 1000000) {
      return Response.json({ error: "Please enter a valid contribution amount (₹1 - ₹10,00,000)." }, { status: 400 });
    }
    if (rawMethod !== "razorpay" && !transactionId) {
      return Response.json({ error: "Transaction / UTR ID is required for manual payments." }, { status: 400 });
    }

    const db = await getDb();

    // Check UTR uniqueness for manual payments
    if (transactionId) {
      const [existingTx] = await db
        .select({ id: contributions.id })
        .from(contributions)
        .where(eq(contributions.transactionId, transactionId))
        .limit(1);

      if (existingTx) {
        return Response.json(
          { error: "This Transaction / UTR ID has already been submitted for verification." },
          { status: 409 }
        );
      }
    }

    let verificationId = generateVerificationId();
    // Ensure verificationId is unique
    let attempts = 0;
    while (attempts < 5) {
      const [exists] = await db
        .select({ id: contributions.id })
        .from(contributions)
        .where(eq(contributions.verificationId, verificationId))
        .limit(1);
      if (!exists) break;
      verificationId = generateVerificationId();
      attempts++;
    }

    const now = new Date().toISOString();

    await db.insert(contributions).values({
      verificationId,
      certificateNumber: null,
      fullName: fullName.slice(0, 100),
      email: email.slice(0, 150),
      mobile: mobile.slice(0, 20),
      amount,
      paymentMethod: rawMethod.slice(0, 80),
      transactionId: transactionId ? transactionId.slice(0, 80) : null,
      paymentScreenshotUrl: screenshotUrl ? screenshotUrl.slice(0, 500) : null,
      paymentStatus: "pending_verification",
      verificationMethod: "manual",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return Response.json(
      {
        verificationId,
        paymentStatus: "pending_verification",
        message: "Your payment reference has been submitted for verification.",
        maskedName: maskName(fullName),
        amount,
        submittedAt: now,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Donation creation error:", err);
    return Response.json({ error: "Contribution reference could not be submitted." }, { status: 500 });
  }
}
