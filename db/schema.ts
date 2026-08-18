import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const wishlistItems = sqliteTable("wishlist_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  productId: text("product_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userProductUnique: uniqueIndex("wishlist_user_prod_unique").on(table.ownerEmail, table.productId),
}));

export const persistentCartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userCartUnique: uniqueIndex("cart_user_prod_unique").on(table.ownerEmail, table.productId),
}));

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id").notNull().unique(),
  ownerEmail: text("owner_email"),
  customerName: text("customer_name").notNull(),
  mobile: text("mobile").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  pinCode: text("pin_code").notNull(),
  paymentMethod: text("payment_method").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("Order Confirmed"),
  currentLocation: text("current_location").default("Fulfillment Hub"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sellerApplications = sqliteTable("seller_applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationId: text("application_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email").notNull(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  gstin: text("gstin"),
  documentPrefix: text("document_prefix").notNull(),
  status: text("status").notNull().default("Pending Review"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull().default("VPANSAK Select"),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  specifications: text("specifications").notNull().default("{}"),
  imageUrl: text("image_url").notNull(),
  images: text("images").notNull().default("[]"),
  price: integer("price").notNull(),
  mrp: integer("mrp").notNull(),
  stock: integer("stock").notNull().default(0),
  sku: text("sku").notNull().unique(),
  rating: integer("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  status: text("status").notNull().default("Approved"),
  sellerId: text("seller_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const profiles = sqliteTable("profiles", {
  email: text("email").primaryKey(),
  fullName: text("full_name").notNull().default(""),
  mobile: text("mobile").notNull().default(""),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const addresses = sqliteTable("addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  label: text("label").notNull().default("Home"),
  fullName: text("full_name").notNull(),
  mobile: text("mobile").notNull(),
  line1: text("line1").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pinCode: text("pin_code").notNull(),
  isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});


export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: text("product_id").notNull(),
  ownerEmail: text("owner_email").notNull(),
  displayName: text("display_name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull().default(""),
  body: text("body").notNull(),
  status: text("status").notNull().default("Pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const coupons = sqliteTable("coupons", {
  code: text("code").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("percentage"),
  value: integer("value").notNull(),
  minOrder: integer("min_order").notNull().default(0),
  maxDiscount: integer("max_discount"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  expiresAt: text("expires_at"),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tickets = sqliteTable("tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: text("ticket_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile").notNull().default(""),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("Normal"),
  status: text("status").notNull().default("Open"),
  assignedOfficer: text("assigned_officer"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const ticketReplies = sqliteTable("ticket_replies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: text("ticket_id").notNull(),
  authorType: text("author_type").notNull(),
  authorName: text("author_name").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const officers = sqliteTable("officers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  officerId: text("officer_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  assignedCount: integer("assigned_count").notNull().default(0),
  resolvedCount: integer("resolved_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const contributions = sqliteTable("contributions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  verificationId: text("verification_id").notNull().unique(),
  certificateNumber: text("certificate_number").unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile").notNull(),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method").notNull().default("manual"),
  transactionId: text("transaction_id"),
  paymentScreenshotUrl: text("payment_screenshot_url"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id").unique(),
  razorpaySignature: text("razorpay_signature"),
  paymentStatus: text("payment_status").notNull().default("pending_verification"),
  verificationMethod: text("verification_method"),
  rejectionReason: text("rejection_reason"),
  publicRejectionReason: text("public_rejection_reason"),
  adminNote: text("admin_note"),
  submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  verifiedAt: text("verified_at"),
  verifiedBy: text("verified_by"),
  certificateGeneratedAt: text("certificate_generated_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const donations = contributions;


export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  mobile: text("mobile").notNull().default(""),
  role: text("role").notNull().default("customer"),
  profileImage: text("profile_image"),
  authProvider: text("auth_provider").notNull().default("email"),
  googleUserId: text("google_user_id").unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  accountStatus: text("account_status").notNull().default("active"),
  securityQuestionId: text("security_question_id"),
  securityAnswerHash: text("security_answer_hash"),
  lastLoginAt: text("last_login_at"),
  passwordUpdatedAt: text("password_updated_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const otpCodes = sqliteTable("otp_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  code: text("code").notNull(),
  purpose: text("purpose").notNull().default("email_verification"),
  expiresAt: text("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const passwordResets = sqliteTable("password_resets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: text("expires_at").notNull(),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pendingUserRegistrations = sqliteTable("pending_user_registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  mobile: text("mobile").notNull(),
  passwordHash: text("password_hash").notNull(),
  securityQuestionId: text("security_question_id"),
  securityAnswerHash: text("security_answer_hash"),
  verificationTokenHash: text("verification_token_hash").notNull(),
  verificationExpiresAt: text("verification_expires_at").notNull(),
  verificationUsedAt: text("verification_used_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

