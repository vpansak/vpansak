import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { contributions } from "../../../../db/schema";
import { maskName } from "../../../lib/contributions";

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default async function PublicVerificationPage(props: {
  params: Promise<{ verificationId: string }>;
}) {
  const { verificationId } = await props.params;
  const cleanId = String(verificationId || "").trim().toUpperCase();

  let record: {
    verificationId: string;
    certificateNumber?: string | null;
    maskedName: string;
    amount: number;
    paymentStatus: string;
    verifiedAt?: string | null;
    submittedAt: string;
    publicRejectionReason?: string | null;
  } | null = null;

  try {
    const db = await getDb();
    const [row] = await db
      .select()
      .from(contributions)
      .where(eq(contributions.verificationId, cleanId))
      .limit(1);

    if (row) {
      record = {
        verificationId: row.verificationId,
        certificateNumber: row.certificateNumber,
        maskedName: maskName(row.fullName),
        amount: row.amount,
        paymentStatus: row.paymentStatus,
        verifiedAt: row.verifiedAt,
        submittedAt: row.submittedAt,
        publicRejectionReason: row.publicRejectionReason,
      };
    }
  } catch {
    // Database lookup error
  }

  const isValid = record?.paymentStatus === "verified";

  return (
    <main className="foundation-page" style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <header className="sub-header" style={{ maxWidth: 800, margin: "0 auto 30px" }}>
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>SUPPORT FOUNDATION</small>
          </span>
        </Link>
        <nav>
          <Link href="/foundation">Support Hub</Link>
          <Link href="/">Main store</Link>
        </nav>
      </header>

      <section style={{ maxWidth: 640, margin: "0 auto", background: "white", padding: 32, borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(0,0,0,0.06)", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: "50%", background: isValid ? "#f0fdf4" : "#fef2f2", display: "grid", placeItems: "center", color: isValid ? "#16a34a" : "#dc2626" }}>
          {isValid ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
        </div>

        <small style={{ color: isValid ? "#15803d" : "#b91c1c", fontWeight: 800, letterSpacing: "0.1em", fontSize: 11 }}>
          OFFICIAL VERIFICATION PORTAL
        </small>

        <h1 style={{ fontSize: 24, margin: "8px 0 16px", color: "#0f172a" }}>
          {isValid ? "Certificate Verification Confirmed" : record ? "Contribution Status: " + record.paymentStatus : "Invalid Verification ID"}
        </h1>

        {record ? (
          <div style={{ background: "#f8fafc", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0", textAlign: "left", display: "flex", flexDirection: "column", gap: 10, margin: "20px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Verification ID:</span>
              <strong style={{ color: "#0f172a", fontSize: 13 }}>{record.verificationId}</strong>
            </div>

            {record.certificateNumber && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Certificate Number:</span>
                <strong style={{ color: "#1766ef", fontSize: 13 }}>{record.certificateNumber}</strong>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Contributor Name:</span>
              <strong style={{ color: "#0f172a", fontSize: 13 }}>{record.maskedName}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Contribution Amount:</span>
              <strong style={{ color: "#0f172a", fontSize: 13 }}>{money(record.amount)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Status:</span>
              <strong style={{ color: isValid ? "#16a34a" : "#dc2626", textTransform: "capitalize", fontSize: 13 }}>
                {record.paymentStatus.replace("_", " ")}
              </strong>
            </div>

            {record.verifiedAt && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Verified On:</span>
                <strong style={{ color: "#0f172a", fontSize: 13 }}>
                  {new Date(record.verifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                </strong>
              </div>
            )}

            {record.publicRejectionReason && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: 10, borderRadius: 6, color: "#991b1b", fontSize: 12, marginTop: 4 }}>
                <strong>Rejection Reason:</strong> {record.publicRejectionReason}
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: "#64748b", fontSize: 14 }}>
            No contribution record was found matching ID: <strong>{cleanId}</strong>.
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
          <Link href={`/foundation?certificate=${cleanId}`} style={{ background: "#1766ef", color: "white", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
            View Support Portal
          </Link>
          <Link href="/" style={{ background: "#f1f5f9", color: "#334155", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
            Back to Store
          </Link>
        </div>

        <div style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid #e2e8f0", color: "#94a3b8", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <ShieldCheck size={14} /> Official VPANSAK Support Verification Ledger
        </div>
      </section>
    </main>
  );
}
