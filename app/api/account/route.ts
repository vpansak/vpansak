import { and, desc, eq, or } from "drizzle-orm";
import { getDb } from "../../../db";
import { addresses, notifications, orders, persistentCartItems, profiles, reviews, sellerApplications, tickets, users, wishlistItems } from "../../../db/schema";
import { getAuthUserFromRequest, hashPassword, setSessionCookieHeaders, verifyPassword } from "../../lib/auth-session";
import { saveUserToSupabase } from "../../lib/supabase";

async function emailFrom(request: Request) {
  const user = await getAuthUserFromRequest(request);
  return user?.email?.toLowerCase() || null;
}

export async function GET(request: Request) {
  const userSession = await getAuthUserFromRequest(request);
  if (!userSession || !userSession.email) return Response.json({ error: "Sign in to access your account." }, { status: 401 });
  const email = userSession.email.toLowerCase();
  try {
    const db = await getDb();
    const [userRecord] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const [profileRecord] = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    
    const userMobile = profileRecord?.mobile?.trim() || userRecord?.mobile?.trim() || userSession.mobile?.trim() || "";

    const [addressRows, wishlist, cart, orderRows, notificationRows, userReviews, userTickets, sellerApps] = await Promise.all([
      db.select().from(addresses).where(eq(addresses.ownerEmail, email)).orderBy(desc(addresses.isPrimary)),
      db.select().from(wishlistItems).where(eq(wishlistItems.ownerEmail, email)),
      db.select().from(persistentCartItems).where(eq(persistentCartItems.ownerEmail, email)),
      userMobile
        ? db.select().from(orders).where(or(eq(orders.ownerEmail, email), eq(orders.mobile, userMobile))).orderBy(desc(orders.createdAt)).limit(50)
        : db.select().from(orders).where(eq(orders.ownerEmail, email)).orderBy(desc(orders.createdAt)).limit(50),
      db.select().from(notifications).where(eq(notifications.ownerEmail, email)).orderBy(desc(notifications.createdAt)).limit(50),
      db.select().from(reviews).where(eq(reviews.ownerEmail, email)).orderBy(desc(reviews.createdAt)),
      db.select().from(tickets).where(eq(tickets.email, email)).orderBy(desc(tickets.createdAt)),
      db.select().from(sellerApplications).where(eq(sellerApplications.email, email)).orderBy(desc(sellerApplications.createdAt)).limit(1),
    ]);

    const safeUser = {
      id: userRecord?.id || 1,
      email,
      fullName: profileRecord?.fullName || userRecord?.fullName || userSession.fullName || "",
      mobile: userMobile,
      role: userRecord?.role || userSession.role || "customer",
      profileImage: profileRecord?.avatarUrl || userRecord?.profileImage || null,
      emailVerified: userRecord?.emailVerified ?? true,
      accountStatus: userRecord?.accountStatus || "active",
      authProvider: userRecord?.authProvider || "email",
      createdAt: userRecord?.createdAt || new Date().toISOString(),
    };

    return Response.json({
      email,
      user: safeUser,
      profile: profileRecord ?? null,
      addresses: addressRows,
      wishlist,
      cart,
      orders: orderRows,
      notifications: notificationRows,
      reviews: userReviews,
      tickets: userTickets,
      sellerApp: sellerApps[0] ?? null,
    });
  } catch (err) {
    console.error("Account GET error:", err);
    return Response.json({ error: "Account data is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const userSession = await getAuthUserFromRequest(request);
  if (!userSession || !userSession.email) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  const email = userSession.email.toLowerCase();

  try {
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action || "");
    const db = await getDb();

    if (action === "profile") {
      const fullName = String(body.fullName || "").trim().slice(0, 100);
      const mobile = String(body.mobile || "").trim().slice(0, 20);
      const avatarUrl = body.avatarUrl ? String(body.avatarUrl).trim() : undefined;

      await db.insert(profiles).values({ email, fullName, mobile, avatarUrl }).onConflictDoUpdate({
        target: profiles.email,
        set: { fullName, mobile, ...(avatarUrl ? { avatarUrl } : {}), updatedAt: new Date().toISOString() }
      });
      await db.update(users).set({ fullName, mobile, ...(avatarUrl ? { profileImage: avatarUrl } : {}), updatedAt: new Date().toISOString() }).where(eq(users.email, email));

      const [updatedUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (updatedUser) await saveUserToSupabase(updatedUser);

      const sessionData = {
        email,
        fullName: updatedUser?.fullName || fullName || userSession.fullName,
        role: updatedUser?.role || userSession.role || "customer",
        mobile: updatedUser?.mobile || mobile || userSession.mobile || "",
        profileImage: updatedUser?.profileImage || avatarUrl || userSession.profileImage || "",
        emailVerified: userSession.emailVerified ?? true,
        authProvider: userSession.authProvider || "email",
      };

      const responseHeaders = new Headers({ "content-type": "application/json" });
      setSessionCookieHeaders(responseHeaders, sessionData);

      return new Response(
        JSON.stringify({ ok: true, message: "Your profile has been updated successfully.", user: sessionData }),
        { status: 200, headers: responseHeaders }
      );
    }

    if (action === "changePassword") {
      const currentPassword = String(body.currentPassword || "").trim();
      const newPassword = String(body.newPassword || "").trim();

      if (!currentPassword || !newPassword) return Response.json({ error: "Provide both current and new password." }, { status: 400 });
      if (newPassword.length < 6) return Response.json({ error: "New password must be at least 6 characters." }, { status: 400 });

      const [userRecord] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!userRecord || !verifyPassword(currentPassword, userRecord.passwordHash)) {
        return Response.json({ error: "Current password is incorrect." }, { status: 400 });
      }

      const newHash = hashPassword(newPassword);
      await db.update(users).set({ passwordHash: newHash, passwordUpdatedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(users.email, email));
      
      const [refreshedUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (refreshedUser) await saveUserToSupabase(refreshedUser);

      return Response.json({ ok: true, message: "Password updated successfully." });
    }

    if (action === "address") {
      const required = ["fullName", "mobile", "line1", "city", "state", "pinCode"];
      if (required.some((key) => !String(body[key] || "").trim())) return Response.json({ error: "Complete the full address." }, { status: 400 });
      const primary = Boolean(body.isPrimary);
      if (primary) await db.update(addresses).set({ isPrimary: false }).where(eq(addresses.ownerEmail, email));
      await db.insert(addresses).values({ ownerEmail: email, label: String(body.label || "Home").slice(0, 30), fullName: String(body.fullName).slice(0,100), mobile: String(body.mobile).slice(0,20), line1: String(body.line1).slice(0,300), city: String(body.city).slice(0,100), state: String(body.state).slice(0,100), pinCode: String(body.pinCode).slice(0,12), isPrimary: primary });
      return Response.json({ ok: true, message: "Address saved." });
    }

    if (action === "deleteAddress") {
      await db.delete(addresses).where(and(eq(addresses.id, Number(body.id)), eq(addresses.ownerEmail, email)));
      return Response.json({ ok: true });
    }

    if (action === "wishlist") {
      const productId = String(body.productId || "").slice(0,80);
      const existing = await db.select().from(wishlistItems).where(and(eq(wishlistItems.ownerEmail, email), eq(wishlistItems.productId, productId))).limit(1);
      if (existing.length) await db.delete(wishlistItems).where(eq(wishlistItems.id, existing[0].id));
      else await db.insert(wishlistItems).values({ ownerEmail: email, productId });
      return Response.json({ saved: !existing.length });
    }

    if (action === "cart") {
      const productId = String(body.productId || "").slice(0,80);
      const quantity = Math.max(0, Math.min(20, Number(body.quantity) || 0));
      const existing = await db.select().from(persistentCartItems).where(and(eq(persistentCartItems.ownerEmail, email), eq(persistentCartItems.productId, productId))).limit(1);
      if (!quantity && existing.length) await db.delete(persistentCartItems).where(eq(persistentCartItems.id, existing[0].id));
      else if (existing.length) await db.update(persistentCartItems).set({ quantity, updatedAt: new Date().toISOString() }).where(eq(persistentCartItems.id, existing[0].id));
      else if (quantity) await db.insert(persistentCartItems).values({ ownerEmail: email, productId, quantity });
      return Response.json({ ok: true });
    }

    if (action === "readNotification") {
      await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, Number(body.id)), eq(notifications.ownerEmail, email)));
      return Response.json({ ok: true });
    }

    if (action === "mergeGuestData") {
      const guestCart = Array.isArray(body.cart) ? (body.cart as Array<{ productId: string; quantity: number }>) : [];
      const guestWishlist = Array.isArray(body.wishlist) ? (body.wishlist as Array<string | { productId: string }>) : [];

      for (const item of guestCart) {
        const productId = String(item.productId || "").slice(0, 80);
        const qty = Math.max(1, Math.min(20, Number(item.quantity) || 1));
        if (!productId) continue;

        const [existing] = await db
          .select()
          .from(persistentCartItems)
          .where(and(eq(persistentCartItems.ownerEmail, email), eq(persistentCartItems.productId, productId)))
          .limit(1);

        if (existing) {
          await db
            .update(persistentCartItems)
            .set({ quantity: Math.min(20, existing.quantity + qty), updatedAt: new Date().toISOString() })
            .where(eq(persistentCartItems.id, existing.id));
        } else {
          await db.insert(persistentCartItems).values({ ownerEmail: email, productId, quantity: qty });
        }
      }

      for (const item of guestWishlist) {
        const productId = typeof item === "string" ? item : String((item as any)?.productId || "").slice(0, 80);
        if (!productId) continue;

        const [existing] = await db
          .select()
          .from(wishlistItems)
          .where(and(eq(wishlistItems.ownerEmail, email), eq(wishlistItems.productId, productId)))
          .limit(1);

        if (!existing) {
          await db.insert(wishlistItems).values({ ownerEmail: email, productId });
        }
      }

      return Response.json({ ok: true, mergedCartCount: guestCart.length, mergedWishlistCount: guestWishlist.length });
    }

    return Response.json({ error: "Unsupported account action." }, { status: 400 });
  } catch (err) {
    console.error("Account POST error:", err);
    return Response.json({ error: "Your changes could not be saved." }, { status: 500 });
  }
}
