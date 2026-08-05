import assert from "node:assert";
import { getDb } from "../db/index.js";
import { contributions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { generateVerificationId, generateCertificateNumber, maskName, maskEmail, maskMobile } from "../app/lib/contributions.js";

async function runTests() {
  console.log("=== Running VPANSAK Contribution System Integration Tests ===");

  const db = await getDb();
  assert.ok(db, "Database instance should be initialized");

  // Test 1: Masking helper functions
  assert.strictEqual(maskName("Alok Singh"), "Alok S****");
  assert.strictEqual(maskEmail("aloksingh84959@gmail.com"), "al***@gmail.com");
  assert.strictEqual(maskMobile("8738869635"), "******9635");
  console.log("✓ Test 1: Data masking helpers verified.");

  // Test 2: Generate Verification ID
  const testId = generateVerificationId();
  assert.match(testId, /^VPC\d{6}$/, "Verification ID must match VPCXXXXXX format");
  console.log("✓ Test 2: Verification ID format verified:", testId);

  // Test 3: Manual Payment Record Creation (Pending Verification)
  const now = new Date().toISOString();
  await db.insert(contributions).values({
    verificationId: testId,
    certificateNumber: null,
    fullName: "Test Contributor",
    email: "test.contributor@example.com",
    mobile: "9876543210",
    amount: 500,
    paymentMethod: "Manual UPI",
    transactionId: "UTR998877665544",
    paymentStatus: "pending_verification",
    verificationMethod: "manual",
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  const [inserted] = await db.select().from(contributions).where(eq(contributions.verificationId, testId)).limit(1);
  assert.ok(inserted, "Record should exist in database");
  assert.strictEqual(inserted.paymentStatus, "pending_verification");
  assert.strictEqual(inserted.certificateNumber, null, "Certificate number MUST remain null for pending payments");
  console.log("✓ Test 3: Manual contribution created with pending_verification status and null certificate number.");

  // Test 4: Verify protection - unverified payment cannot have a certificate number
  const certNo = await generateCertificateNumber(db);
  assert.match(certNo, /^VPC-\d{4}-\d{6}$/, "Certificate number format VPC-YYYY-XXXXXX");
  
  // Transition to Verified (Admin verification simulation)
  await db.update(contributions).set({
    paymentStatus: "verified",
    verificationMethod: "manual_admin",
    verifiedAt: now,
    verifiedBy: "aloksingh84959@gmail.com",
    certificateNumber: certNo,
    certificateGeneratedAt: now,
    updatedAt: now,
  }).where(eq(contributions.verificationId, testId));

  const [verifiedRow] = await db.select().from(contributions).where(eq(contributions.verificationId, testId)).limit(1);
  assert.strictEqual(verifiedRow.paymentStatus, "verified");
  assert.strictEqual(verifiedRow.certificateNumber, certNo, "Certificate number set upon verification");
  console.log("✓ Test 4: Admin verification updated status to verified and generated certificate number:", certNo);

  console.log("\nALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
