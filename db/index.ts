import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as schema from "./schema";

let localDbInstance: ReturnType<typeof drizzleLibsql> | null = null;
let d1InitPromise: Promise<void> | null = null;

const SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL UNIQUE,
      owner_email TEXT,
      customer_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Order Confirmed',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donation_id TEXT NOT NULL UNIQUE,
      donor_name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Manual',
      payment_status TEXT NOT NULL DEFAULT 'Pending Verification',
      certificate_id TEXT NOT NULL UNIQUE,
      appreciation_message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'percentage',
      value INTEGER NOT NULL,
      min_order INTEGER NOT NULL DEFAULT 0,
      max_discount INTEGER,
      active INTEGER NOT NULL DEFAULT 1,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS seller_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      email TEXT NOT NULL,
      business_name TEXT NOT NULL,
      business_type TEXT NOT NULL,
      gstin TEXT,
      document_prefix TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending Review',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Normal',
      status TEXT NOT NULL DEFAULT 'Open',
      assigned_officer TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ticket_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT NOT NULL,
      author_type TEXT NOT NULL,
      author_name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS officers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      officer_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      assigned_count INTEGER NOT NULL DEFAULT 0,
      resolved_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT 'VPANSAK Select',
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      specifications TEXT NOT NULL DEFAULT '{}',
      image_url TEXT NOT NULL,
      images TEXT NOT NULL DEFAULT '[]',
      price INTEGER NOT NULL,
      mrp INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      sku TEXT NOT NULL UNIQUE,
      rating INTEGER NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Approved',
      seller_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      full_name TEXT NOT NULL DEFAULT '',
      mobile TEXT NOT NULL DEFAULT '',
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_email TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT 'Home',
      full_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      line1 TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_email TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_email TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_email TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;

async function initLocalDb() {
  if (localDbInstance) return localDbInstance;

  const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  if (dbUrl) {
    const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
    const client = createClient({ url: dbUrl, authToken });
    await client.executeMultiple(SCHEMA_SQL);
    localDbInstance = drizzleLibsql(client, { schema });
    return localDbInstance;
  }

  let dataDir = path.join(process.cwd(), ".data");
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const testFile = path.join(dataDir, ".write-test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
  } catch {
    dataDir = path.join(os.tmpdir(), "vpansak-data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  const dbPath = path.join(dataDir, "sqlite.db");
  const client = createClient({ url: `file:${dbPath}` });

  await client.executeMultiple(SCHEMA_SQL);

  localDbInstance = drizzleLibsql(client, { schema });
  return localDbInstance;
}

export async function getDb(): Promise<any> {
  try {
    const { env } = await import("cloudflare:workers");
    const d1 = (env as any)?.DB;
    if (d1) {
      if (!d1InitPromise) {
        d1InitPromise = (async () => {
          try {
            // Execute table definitions on D1
            const statements = SCHEMA_SQL.split(";")
              .map((s) => s.trim())
              .filter(Boolean);
            for (const stmt of statements) {
              await d1.prepare(stmt).run();
            }
          } catch (e) {
            console.error("D1 initialization notice:", e);
          }
        })();
      }
      await d1InitPromise;
      return drizzleD1(d1, { schema });
    }
  } catch {
    // Not running inside Cloudflare Workers environment
  }

  return await initLocalDb();
}
