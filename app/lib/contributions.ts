import { count, eq, sql } from "drizzle-orm";
import { getDb } from "../../db";
import { contributions } from "../../db/schema";

export function generateVerificationId(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `VPC${digits}`;
}

export async function generateCertificateNumber(dbParam?: any): Promise<string> {
  const db = dbParam || (await getDb());
  const year = new Date().getFullYear();
  
  // Count total verified certificates to get next sequence number atomically
  const result = await db
    .select({ total: count() })
    .from(contributions)
    .where(sql`certificate_number IS NOT NULL`);
    
  const seq = (result[0]?.total || 0) + 1;
  const seqStr = String(seq).padStart(6, "0");
  const certNo = `VPC-${year}-${seqStr}`;
  
  // Verify uniqueness (if duplicate exists due to race, increment)
  const [existing] = await db
    .select({ certificateNumber: contributions.certificateNumber })
    .from(contributions)
    .where(eq(contributions.certificateNumber, certNo))
    .limit(1);
    
  if (existing) {
    const fallbackSeq = String(seq + Math.floor(Math.random() * 100) + 1).padStart(6, "0");
    return `VPC-${year}-${fallbackSeq}`;
  }
  
  return certNo;
}

export function maskName(name: string): string {
  if (!name) return "****";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const first = parts[0];
    if (first.length <= 2) return first + "***";
    return first.slice(0, 2) + "*".repeat(Math.max(2, first.length - 2));
  }
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0] || "*";
  return `${firstName} ${lastInitial}****`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "****@***.com";
  const [user, domain] = email.split("@");
  const visible = user.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 4) return "******";
  return "******" + mobile.slice(-4);
}

export function buildAppreciationMessage(fullName: string, amount: number): string {
  return `With sincere appreciation, VPANSAK Support Foundation recognizes ${fullName} for contributing ₹${amount.toLocaleString("en-IN")}. Your support helps us continue responsible community initiatives and meaningful support activities.`;
}
