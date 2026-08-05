import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { contributions } from "../../../../../db/schema";
import { maskEmail, maskMobile, maskName } from "../../../../lib/contributions";

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

    if (!row) {
      return Response.json(
        { error: "No contribution record was found for this Verification ID." },
        { status: 404 }
      );
    }

    return Response.json({
      statusRecord: {
        verificationId: row.verificationId,
        paymentStatus: row.paymentStatus,
        maskedName: maskName(row.fullName),
        maskedEmail: maskEmail(row.email),
        maskedMobile: maskMobile(row.mobile),
        amount: row.amount,
        paymentMethod: row.paymentMethod,
        submittedAt: row.submittedAt,
        verifiedAt: row.paymentStatus === "verified" ? row.verifiedAt : null,
        certificateNumber: row.paymentStatus === "verified" ? row.certificateNumber : null,
        publicRejectionReason: row.paymentStatus === "rejected" ? row.publicRejectionReason : null,
      },
    });
  } catch (err) {
    console.error("Status lookup error:", err);
    return Response.json({ error: "Status lookup service unavailable." }, { status: 500 });
  }
}
