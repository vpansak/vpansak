import { and, desc, eq, or } from "drizzle-orm";
import { getDb } from "../../../db";
import { addresses, notifications, orders, persistentCartItems, profiles, reviews, sellerApplications, tickets, users, wishlistItems } from "../../../db/schema";
import { getAuthUserFromRequest, hashPassword, setSessionCookieHeaders, verifyPassword } from "../../lib/auth-session";
import {
  getAddressesFromSupabase,
  getCartFromSupabase,
  getUserFromSupabase,
  getUserOrdersFromSupabase,
  getWishlistFromSupabase,
  saveAddressToSupabase,
  saveCartItemToSupabase,
  saveUserToSupabase,
  saveWishlistItemToSupabase,
} from "../../lib/supabase";

export async function GET(request: Request) {
  const userSession = await getAuthUserFromRequest(request);
  if (!userSession || !userSession.email) {
    return Response.json({ error: "Sign in to access your account." }, { status: 401 });
  }
  const email = userSession.email.toLowerCase();
  try {
    const db = await getDb();
    let [userRecord] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    // If userRecord is missing in local SQLite, restore from Supabase Cloud DB or session
    if (!userRecord) {
      const remoteUser = await getUserFromSupabase(email);
      const now = new Date().toISOString();

      const userToInsert = remoteUser || {
        email,
        passwordHash: "NO_HASH",
        fullName: userSession.fullName || email.split("@")[0],
        mobile: userSession.mobile || "",
        role: userSession.role || "customer",
        profileImage: null,
        authProvider: "email",
        emailVerified: true,
        accountStatus: "active",
        createdAt: now,
      };

      try {
        const [restored] = await db
          .insert(users)
          .values({
            email: userToInsert.email,
            passwordHash: userToInsert.passwordHash || "NO_HASH",
            fullName: userToInsert.fullName,
            mobile: userToInsert.mobile,
            role: userToInsert.role,
            profileImage: userToInsert.profileImage || null,
            authProvider: userToInsert.authProvider || "email",
            emailVerified: true,
            accountStatus: userToInsert.accountStatus || "active",
            createdAt: userToInsert.createdAt || now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: { fullName: userToInsert.fullName, mobile: userToInsert.mobile, updatedAt: now },
          })
          .returning();
        userRecord = restored;
      } catch {}

      try {
        await db.insert(profiles).values({
          email: userToInsert.email,
          fullName: userToInsert.fullName,
          mobile: userToInsert.mobile,
          avatarUrl: userToInsert.profileImage || null,
          createdAt: userToInsert.createdAt || now,
          updatedAt: now,
        }).onConflictDoUpdate({
          target: profiles.email,
          set: { fullName: userToInsert.fullName, mobile: userToInsert.mobile, updatedAt: now },
        });
      } catch {}

      // Sync remote orders
      try {
        const remoteOrders = await getUserOrdersFromSupabase(email);
        for (const o of remoteOrders) {
          try {
            await db.insert(orders).values({
              orderId: o.orderId,
              ownerEmail: o.ownerEmail,
              customerName: o.customerName || "Customer",
              mobile: o.mobile || "",
              address: o.address || "",
              city: o.city || "",
              pinCode: o.pinCode || "",
              total: o.total || 0,
              status: o.status || "Order Confirmed",
              paymentMethod: o.paymentMethod || "COD",
              createdAt: o.createdAt || now,
            }).onConflictDoNothing();
          } catch {}
        }
      } catch {}

      // Sync remote addresses
      try {
        const remoteAddresses = await getAddressesFromSupabase(email);
        for (const a of remoteAddresses) {
          try {
            await db.insert(addresses).values({
              ownerEmail: a.ownerEmail,
              label: a.label || "Home",
              fullName: a.fullName || userToInsert.fullName,
              mobile: a.mobile || userToInsert.mobile,
              line1: a.line1 || "",
              city: a.city || "",
              state: a.state || "",
              pinCode: a.pinCode || "",
              isPrimary: Boolean(a.isPrimary),
            }).onConflictDoNothing();
          } catch {}
        }
      } catch {}

      // Sync remote cart
      try {
        const remoteCart = await getCartFromSupabase(email);
        for (const c of remoteCart) {
          try {
            await db.insert(persistentCartItems).values({
              ownerEmail: c.ownerEmail,
              productId: c.productId,
              quantity: c.quantity || 1,
            }).onConflictDoUpdate({
              target: [persistentCartItems.ownerEmail, persistentCartItems.productId],
              set: { quantity: c.quantity || 1 },
            });
          } catch {}
        }
      } catch {}

      // Sync remote wishlist
      try {
        const remoteWishlist = await getWishlistFromSupabase(email);
        for (const w of remoteWishlist) {
          try {
            await db.insert(wishlistItems).values({
              ownerEmail: w.ownerEmail,
              productId: w.productId,
            }).onConflictDoNothing();
          } catch {}
        }
      } catch {}
    }

    let profileRecord: any = null;
    try {
      const [prof] = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
      profileRecord = prof;
    } catch {}

    const userMobile = profileRecord?.mobile?.trim() || userRecord?.mobile?.trim() || userSession.mobile?.trim() || "";

    let addressRows: any[] = [];
    let wishlist: any[] = [];
    let cart: any[] = [];
    let orderRows: any[] = [];
    let notificationRows: any[] = [];
    let userReviews: any[] = [];
    let userTickets: any[] = [];
    let sellerApps: any[] = [];

    try {
      const results = await Promise.all([
        db.select().from(addresses).where(eq(addresses.ownerEmail, email)).orderBy(desc(addresses.isPrimary)).catch(() => []),
        db.select().from(wishlistItems).where(eq(wishlistItems.ownerEmail, email)).catch(() => []),
        db.select().from(persistentCartItems).where(eq(persistentCartItems.ownerEmail, email)).catch(() => []),
        userMobile
          ? db.select().from(orders).where(or(eq(orders.ownerEmail, email), eq(orders.mobile, userMobile))).orderBy(desc(orders.createdAt)).limit(50).catch(() => [])
          : db.select().from(orders).where(eq(orders.ownerEmail, email)).orderBy(desc(orders.createdAt)).limit(50).catch(() => []),
        db.select().from(notifications).where(eq(notifications.ownerEmail, email)).orderBy(desc(notifications.createdAt)).limit(50).catch(() => []),
        db.select().from(reviews).where(eq(reviews.ownerEmail, email)).orderBy(desc(reviews.createdAt)).catch(() => []),
        db.select().from(tickets).where(eq(tickets.email, email)).orderBy(desc(tickets.createdAt)).catch(() => []),
        db.select().from(sellerApplications).where(eq(sellerApplications.email, email)).orderBy(desc(sellerApplications.createdAt)).limit(1).catch(() => []),
      ]);
      addressRows = results[0];
      wishlist = results[1];
      cart = results[2];
      orderRows = results[3];
      notificationRows = results[4];
      userReviews = results[5];
      userTickets = results[6];
      sellerApps = results[7];
    } catch {}

    // Fallback: If local SQLite orderRows is empty, fetch direct from Supabase
    if (!orderRows.length) {
      try {
        orderRows = await getUserOrdersFromSupabase(email);
      } catch {}
    }

    const safeUser = {
      id: userRecord?.id || 1,
      email,
      fullName: profileRecord?.fullName || userRecord?.fullName || userSession.fullName || email.split("@")[0],
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
    // Safe graceful fallback response so page loads without error toast
    return Response.json({
      email,
      user: {
        id: 1,
        email,
        fullName: userSession.fullName || email.split("@")[0],
        mobile: userSession.mobile || "",
        role: userSession.role || "customer",
        profileImage: null,
        emailVerified: true,
        accountStatus: "active",
        authProvider: "email",
        createdAt: new Date().toISOString(),
      },
      profile: null,
      addresses: [],
      wishlist: [],
      cart: [],
      orders: [],
      notifications: [],
      reviews: [],
      tickets: [],
      sellerApp: null,
    });
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
      const now = new Date().toISOString();
      await db.insert(users).values({
        email,
        passwordHash: "NO_HASH",
        fullName,
        mobile,
        profileImage: avatarUrl || null,
        role: userSession.role || "customer",
        authProvider: userSession.authProvider || "email",
        emailVerified: true,
        accountStatus: "active",
        createdAt: now,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: users.email,
        set: { fullName, mobile, ...(avatarUrl ? { profileImage: avatarUrl } : {}), updatedAt: now }
      });

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
      const addressPayload = {
        ownerEmail: email,
        label: String(body.label || "Home").slice(0, 30),
        fullName: String(body.fullName).slice(0, 100),
        mobile: String(body.mobile).slice(0, 20),
        line1: String(body.line1).slice(0, 300),
        city: String(body.city).slice(0, 100),
        state: String(body.state).slice(0, 100),
        pinCode: String(body.pinCode).slice(0, 12),
        isPrimary: primary,
      };
      await db.insert(addresses).values(addressPayload);
      await saveAddressToSupabase(addressPayload);
      return Response.json({ ok: true, message: "Address saved." });
    }

    if (action === "deleteAddress") {
      await db.delete(addresses).where(and(eq(addresses.id, Number(body.id)), eq(addresses.ownerEmail, email)));
      return Response.json({ ok: true });
    }

    if (action === "wishlist") {
      const productId = String(body.productId || "").slice(0,80);
      if (!productId) return Response.json({ error: "Product ID required." }, { status: 400 });
      const existing = await db.select().from(wishlistItems).where(and(eq(wishlistItems.ownerEmail, email), eq(wishlistItems.productId, productId))).limit(1);
      const isRemoving = existing.length > 0;
      if (isRemoving) {
        await db.delete(wishlistItems).where(eq(wishlistItems.id, existing[0].id));
      } else {
        await db.insert(wishlistItems).values({ ownerEmail: email, productId }).onConflictDoNothing();
      }
      await saveWishlistItemToSupabase(email, productId, isRemoving);
      return Response.json({ saved: !isRemoving, ok: true });
    }

    if (action === "cart") {
      const productId = String(body.productId || "").slice(0,80);
      if (!productId) return Response.json({ error: "Product ID required." }, { status: 400 });
      const quantity = Math.max(0, Math.min(20, Number(body.quantity) || 0));
      const existing = await db.select().from(persistentCartItems).where(and(eq(persistentCartItems.ownerEmail, email), eq(persistentCartItems.productId, productId))).limit(1);
      
      if (!quantity) {
        if (existing.length) {
          await db.delete(persistentCartItems).where(eq(persistentCartItems.id, existing[0].id));
        }
      } else if (existing.length) {
        await db.update(persistentCartItems).set({ quantity, updatedAt: new Date().toISOString() }).where(eq(persistentCartItems.id, existing[0].id));
      } else {
        await db.insert(persistentCartItems).values({ ownerEmail: email, productId, quantity }).onConflictDoUpdate({
          target: [persistentCartItems.ownerEmail, persistentCartItems.productId],
          set: { quantity, updatedAt: new Date().toISOString() }
        });
      }
      await saveCartItemToSupabase(email, productId, quantity);
      return Response.json({ ok: true });
    }

    if (action === "readNotification") {
      await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, Number(body.id)), eq(notifications.ownerEmail, email)));
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unsupported account action." }, { status: 400 });
  } catch (err) {
    console.error("Account POST error:", err);
    return Response.json({ error: "Your changes could not be saved." }, { status: 500 });
  }
}
