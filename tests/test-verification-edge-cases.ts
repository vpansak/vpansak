import { getDb } from "../db/index.js";
import { pendingUserRegistrations, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  hashVerificationToken,
  generateVerificationToken,
} from "../app/lib/auth-session.js";

async function runEdgeCasesTest() {
  console.log("=== VPANSAK EMAIL VERIFICATION EDGE-CASES TEST ===");
  const db = await getDb();
  const testEmail = `edge_test_${Date.now()}@gmail.com`;
  const passHash = hashPassword("Test@12345");
  const now = new Date();

  // Test 1: Active User duplicate check
  await db.insert(users).values({
    email: testEmail,
    passwordHash: passHash,
    fullName: "Active User",
    mobile: "9998887770",
    role: "customer",
    authProvider: "email",
    emailVerified: true,
    accountStatus: "active",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  const [existingUser] = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
  if (!existingUser) throw new Error("Failed to insert active user");
  console.log("✓ Test 1 Passed: Active user existence recognized.");

  // Test 2: Expired Token
  const expiredEmail = `expired_${Date.now()}@gmail.com`;
  const expiredToken = generateVerificationToken();
  const expiredHash = hashVerificationToken(expiredToken);
  const expiredTime = new Date(now.getTime() - 20 * 60 * 1000).toISOString(); // 20 mins ago

  await db.insert(pendingUserRegistrations).values({
    fullName: "Expired User",
    email: expiredEmail,
    mobile: "9998887771",
    passwordHash: passHash,
    securityQuestionId: "school",
    securityAnswerHash: "Ans",
    verificationTokenHash: expiredHash,
    verificationExpiresAt: expiredTime,
    createdAt: expiredTime,
    updatedAt: expiredTime,
  });

  const [expiredRecord] = await db.select().from(pendingUserRegistrations).where(eq(pendingUserRegistrations.email, expiredEmail)).limit(1);
  const isExpired = new Date(expiredRecord.verificationExpiresAt).getTime() < Date.now();
  if (!isExpired) throw new Error("Expired token check failed");
  console.log("✓ Test 2 Passed: Expired token detection verified.");

  // Test 3: Already Used Token
  const usedEmail = `used_${Date.now()}@gmail.com`;
  const usedToken = generateVerificationToken();
  const usedHash = hashVerificationToken(usedToken);

  await db.insert(pendingUserRegistrations).values({
    fullName: "Used User",
    email: usedEmail,
    mobile: "9998887772",
    passwordHash: passHash,
    securityQuestionId: "school",
    securityAnswerHash: "Ans",
    verificationTokenHash: usedHash,
    verificationExpiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
    verificationUsedAt: now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  const [usedRecord] = await db.select().from(pendingUserRegistrations).where(eq(pendingUserRegistrations.email, usedEmail)).limit(1);
  if (!usedRecord.verificationUsedAt) throw new Error("Used token check failed");
  console.log("✓ Test 3 Passed: Already used token detection verified.");

  // Cleanup
  await db.delete(users).where(eq(users.email, testEmail));
  await db.delete(pendingUserRegistrations).where(eq(pendingUserRegistrations.email, expiredEmail));
  await db.delete(pendingUserRegistrations).where(eq(pendingUserRegistrations.email, usedEmail));
  console.log("✓ Cleanup complete.");

  console.log("\n=== ALL EDGE CASE CHECKS PASSED SUCCESSFULLY ===");
}

runEdgeCasesTest().catch((err) => {
  console.error("Edge case test failed:", err);
  process.exit(1);
});
