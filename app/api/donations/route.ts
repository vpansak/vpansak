import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { donations } from "../../../db/schema";

const appreciation = (name: string, amount: number) => `With sincere appreciation, VPANSAK Support Foundation recognizes ${name} for contributing ₹${amount.toLocaleString("en-IN")}. Your support helps us continue responsible community initiatives and create meaningful opportunities.`;

export async function GET(request: Request) {
  const certificateId = new URL(request.url).searchParams.get("certificate")?.trim().toUpperCase();
  if (!certificateId) return Response.json({ error: "Certificate ID is required." }, { status: 400 });
  try { const db = await getDb(); const [row] = await db.select().from(donations).where(eq(donations.certificateId, certificateId)).limit(1); if (!row) return Response.json({ error: "Certificate not found." }, { status: 404 }); return Response.json({ certificate: { certificateId: row.certificateId, donorName: row.donorName, amount: row.amount, appreciationMessage: row.appreciationMessage, createdAt: row.createdAt, paymentStatus: row.paymentStatus } }); }
  catch { return Response.json({ error: "Certificate lookup is unavailable." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, string | number>;
    const name = String(body.name || "").trim(); const email = String(body.email || "").trim(); const mobile = String(body.mobile || "").trim(); const amount = Math.round(Number(body.amount));
    if (!name || !email || !mobile || !amount || amount < 1) return Response.json({ error: "Enter valid donor details and amount." }, { status: 400 });
    const donationId = `VPD${Math.floor(100000 + Math.random() * 900000)}`; const certificateId = `VPC${Math.floor(100000 + Math.random() * 900000)}`; const appreciationMessage = appreciation(name, amount);
    const db = await getDb(); await db.insert(donations).values({ donationId, donorName: name.slice(0,100), email: email.toLowerCase().slice(0,150), mobile: mobile.slice(0,20), amount, paymentMethod: String(body.paymentMethod || "Manual").slice(0,30), certificateId, appreciationMessage });
    return Response.json({ donationId, certificateId, donorName: name, amount, appreciationMessage, paymentStatus: "Pending Verification" }, { status: 201 });
  } catch { return Response.json({ error: "Donation record could not be created." }, { status: 500 }); }
}
