import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { contributions } from "../../../../../db/schema";
import { buildAppreciationMessage } from "../../../../lib/contributions";

export async function GET(
  request: Request,
  props: { params: Promise<{ verificationId: string }> }
) {
  const { verificationId } = await props.params;
  const cleanId = String(verificationId || "").trim().toUpperCase();

  if (!cleanId || !/^VPC\d{6}$/.test(cleanId)) {
    return Response.json({ error: "Invalid Verification ID format." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const [row] = await db
      .select()
      .from(contributions)
      .where(eq(contributions.verificationId, cleanId))
      .limit(1);

    // Rule 1: 404 if record does not exist
    if (!row) {
      return Response.json(
        { error: "No contribution record was found for this Verification ID." },
        { status: 404 }
      );
    }

    // Rule 2: 403 if paymentStatus is not exactly "verified"
    if (row.paymentStatus !== "verified") {
      return Response.json(
        {
          error: "Certificate access denied. Contribution payment is not verified.",
          paymentStatus: row.paymentStatus,
        },
        { status: 403 }
      );
    }

    // Rule 3: Return verified certificate payload only
    return Response.json({
      certificate: {
        verificationId: row.verificationId,
        certificateNumber: row.certificateNumber,
        fullName: row.fullName,
        amount: row.amount,
        paymentMethod: row.paymentMethod,
        appreciationMessage: buildAppreciationMessage(row.fullName, row.amount),
        submittedAt: row.submittedAt,
        verifiedAt: row.verifiedAt || row.createdAt,
        certificateGeneratedAt: row.certificateGeneratedAt || row.verifiedAt || row.createdAt,
        paymentStatus: row.paymentStatus,
        verificationMethod: row.verificationMethod,
        founderName: "Alok Singh",
        founderDesignation: "Founder & Authorized Signatory",
        signatureUrl: "/assets/certificate/alok-singh-signature.png",
      },
    });
  } catch (err) {
    console.error("Certificate API error:", err);
    return Response.json({ error: "Certificate server error." }, { status: 500 });
  }
}
