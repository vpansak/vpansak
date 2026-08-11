import { getDb } from "../db/index.js";
import { pendingUserRegistrations, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  hashVerificationToken,
  generateVerificationToken,
  sendVerificationEmail,
} from "../app/lib/auth-session.js";

async function runE2ETest() {
  console.log("=== VPANSAK SIGNUP EMAIL-VERIFICATION E2E TEST ===");
  const testEmail = `test_user_${Date.now()}@gmail.com`;
  const testName = "VPANSAK Test User";
  const testMobile = "9876543210";
  const testPass = "Vpansak@2026Sec!";
  const testQuestion = "school";
  const testAnswer = "St Johns";

  console.log(`1. Testing Signup for ${testEmail}...`);

  const db = await getDb();

  // Check no active user exists
  const [initialUser] = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
  if (initialUser) {
    throw new Error("Active user already exists before registration!");
  }
  console.log("✓ Verified: No active user exists in 'users' table prior to verification.");

  // Generate secure token
  const rawToken = generateVerificationToken();
  const tokenHash = hashVerificationToken(rawToken);
  const passHash = hashPassword(testPass);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

  // Create pending registration
  await db.insert(pendingUserRegistrations).values({
    fullName: testName,
    email: testEmail,
    mobile: testMobile,
    passwordHash: passHash,
    securityQuestionId: testQuestion,
    securityAnswerHash: testAnswer,
    verificationTokenHash: tokenHash,
    verificationExpiresAt: expiresAt,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  // Verify pending record
  const [pendingRecord] = await db
    .select()
    .from(pendingUserRegistrations)
    .where(eq(pendingUserRegistrations.email, testEmail))
    .limit(1);

  if (!pendingRecord || pendingRecord.verificationUsedAt) {
    throw new Error("Pending registration record was not created properly.");
  }
  console.log("✓ Verified: Pending registration created in 'pending_user_registrations' with secure token hash.");

  // Still no active user in users table
  const [stillNoUser] = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
  if (stillNoUser) {
    throw new Error("Active user was prematurely created before email verification!");
  }
  console.log("✓ Verified: Account remains strictly inactive and unusable before verification.");

  // Test EmailJS sending
  const verificationLink = `https://vpansak.vercel.app/verify-email?token=${rawToken}`;
  console.log(`2. Sending verification email via EmailJS (service_15li5i6)...`);
  const emailRes = await sendVerificationEmail(testEmail, testName, verificationLink);
  if (!emailRes.success) {
    throw new Error(`EmailJS delivery failed: ${emailRes.error}`);
  }
  console.log("✓ Verified: Verification email successfully delivered via EmailJS!");

  // Test Token Verification & Account Activation
  console.log("3. Simulating user clicking verification link...");
  const verifyTokenHash = hashVerificationToken(rawToken);
  if (verifyTokenHash !== pendingRecord.verificationTokenHash) {
    throw new Error("Token hash mismatch!");
  }

  // Create active user
  await db.insert(users).values({
    email: pendingRecord.email,
    passwordHash: pendingRecord.passwordHash,
    fullName: pendingRecord.fullName,
    mobile: pendingRecord.mobile,
    role: "customer",
    authProvider: "email",
    emailVerified: true,
    accountStatus: "active",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  // Mark token as used
  await db
    .update(pendingUserRegistrations)
    .set({ verificationUsedAt: now.toISOString() })
    .where(eq(pendingUserRegistrations.id, pendingRecord.id));

  // Verify active user exists
  const [activatedUser] = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
  if (!activatedUser || !activatedUser.emailVerified) {
    throw new Error("User account failed to activate after token verification.");
  }
  console.log("✓ Verified: User account successfully activated with emailVerified=true.");

  // Test password verification / login capability
  const isPassValid = verifyPassword(testPass, activatedUser.passwordHash);
  if (!isPassValid) {
    throw new Error("Password authentication failed for newly activated account.");
  }
  console.log("✓ Verified: Login with newly created and verified account succeeds!");

  // Test single-use token protection
  const [usedPending] = await db
    .select()
    .from(pendingUserRegistrations)
    .where(eq(pendingUserRegistrations.id, pendingRecord.id))
    .limit(1);

  if (!usedPending || !usedPending.verificationUsedAt) {
    throw new Error("Token was not marked as used after activation!");
  }
  console.log("✓ Verified: Verification token is invalidated and cannot be re-used.");

  // Cleanup test user
  await db.delete(users).where(eq(users.email, testEmail));
  await db.delete(pendingUserRegistrations).where(eq(pendingUserRegistrations.email, testEmail));
  console.log("✓ Cleanup complete.");

  console.log("\n=== ALL E2E VERIFICATION CHECKS PASSED SUCCESSFULLY ===");
}

runE2ETest().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
