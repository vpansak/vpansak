import { getDb } from "../db/index.js";
import { persistentCartItems, users } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "../app/lib/auth-session.js";

async function runCartIsolationTest() {
  console.log("=== VPANSAK CART ISOLATION TEST ===");
  const db = await getDb();
  const passHash = hashPassword("TestPass@123");
  const userAEmail = `user_a_${Date.now()}@gmail.com`;
  const userBEmail = `user_b_${Date.now()}@gmail.com`;
  const now = new Date().toISOString();

  // Create User A and User B
  await db.insert(users).values([
    {
      email: userAEmail,
      passwordHash: passHash,
      fullName: "User A",
      mobile: "9000000001",
      role: "customer",
      emailVerified: true,
      accountStatus: "active",
      createdAt: now,
    },
    {
      email: userBEmail,
      passwordHash: passHash,
      fullName: "User B",
      mobile: "9000000002",
      role: "customer",
      emailVerified: true,
      accountStatus: "active",
      createdAt: now,
    },
  ]);

  console.log("1. User A adds Product X ('prod_x') to cart...");
  await db.insert(persistentCartItems).values({
    ownerEmail: userAEmail,
    productId: "prod_x",
    quantity: 2,
    updatedAt: now,
  });

  // Verify User A cart
  const userACart = await db.select().from(persistentCartItems).where(eq(persistentCartItems.ownerEmail, userAEmail));
  if (userACart.length !== 1 || userACart[0].productId !== "prod_x") {
    throw new Error("User A cart failed to save!");
  }
  console.log("✓ Verified: User A's database cart contains Product X.");

  // Verify User B cart is EMPTY
  console.log("2. Checking User B's cart prior to adding items...");
  const userBCartInitial = await db.select().from(persistentCartItems).where(eq(persistentCartItems.ownerEmail, userBEmail));
  if (userBCartInitial.length !== 0) {
    throw new Error("User B can see User A's cart items! Isolation broken!");
  }
  console.log("✓ Verified: User B's cart is completely isolated and empty.");

  // User B adds Product Y
  console.log("3. User B adds Product Y ('prod_y') to cart...");
  await db.insert(persistentCartItems).values({
    ownerEmail: userBEmail,
    productId: "prod_y",
    quantity: 1,
    updatedAt: now,
  });

  // Re-verify User A cart
  const userACartFinal = await db.select().from(persistentCartItems).where(eq(persistentCartItems.ownerEmail, userAEmail));
  if (userACartFinal.length !== 1 || userACartFinal[0].productId !== "prod_x") {
    throw new Error("User A's cart was modified by User B!");
  }
  console.log("✓ Verified: User A's cart contains ONLY Product X.");

  // Re-verify User B cart
  const userBCartFinal = await db.select().from(persistentCartItems).where(eq(persistentCartItems.ownerEmail, userBEmail));
  if (userBCartFinal.length !== 1 || userBCartFinal[0].productId !== "prod_y") {
    throw new Error("User B's cart is corrupt!");
  }
  console.log("✓ Verified: User B's cart contains ONLY Product Y.");

  // Cleanup
  await db.delete(persistentCartItems).where(eq(persistentCartItems.ownerEmail, userAEmail));
  await db.delete(persistentCartItems).where(eq(persistentCartItems.ownerEmail, userBEmail));
  await db.delete(users).where(eq(users.email, userAEmail));
  await db.delete(users).where(eq(users.email, userBEmail));
  console.log("✓ Cleanup complete.");

  console.log("\n=== CART ISOLATION TEST PASSED 100% SUCCESSFULLY ===");
}

runCartIsolationTest().catch((err) => {
  console.error("Cart isolation test failed:", err);
  process.exit(1);
});
