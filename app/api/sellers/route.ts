import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { sellerApplications } from "../../../db/schema";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const imageExtensions = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);
const videoExtensions = new Set(["mp4", "webm", "mov"]);

async function getCloudflareBucket(): Promise<any> {
  try {
    const { env } = await import("cloudflare:workers");
    return (env as any)?.BUCKET || null;
  } catch {
    return null;
  }
}

async function saveFileLocally(prefix: string, fileName: string, buffer: ArrayBuffer) {
  let baseDir = path.join(process.cwd(), ".data", "uploads", prefix);
  try {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
  } catch {
    baseDir = path.join(os.tmpdir(), "vpansak-uploads", prefix);
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
  }
  const filePath = path.join(baseDir, fileName);
  await fs.promises.writeFile(filePath, Buffer.from(buffer));
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const field = (name: string) => String(form.get(name) ?? "").trim();
    const fullName = field("fullName");
    const mobile = field("mobile");
    const email = field("email");
    const businessName = field("businessName");
    const businessType = field("businessType");
    if (!fullName || !mobile || !email || !businessName || !businessType) {
      return Response.json({ error: "Complete all required business details." }, { status: 400 });
    }
    const documents = ["aadhaarFront", "aadhaarBack", "panCard", "selfieVideo"] as const;
    const files = documents.map((key) => [key, form.get(key)] as const);
    if (files.some(([, value]) => !(value instanceof File) || !value.size)) {
      return Response.json({ error: "Upload all required KYC documents." }, { status: 400 });
    }
    for (const [key, value] of files) {
      const file = value as File;
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      const isVideo = key === "selfieVideo";
      const validType = isVideo ? videoTypes.has(file.type) || videoExtensions.has(extension) : imageTypes.has(file.type) || imageExtensions.has(extension);
      const maxSize = isVideo ? 25 * 1024 * 1024 : 12 * 1024 * 1024;
      if (!validType) {
        return Response.json({ error: `${isVideo ? "Selfie video" : "KYC image"} format supported नहीं है। JPG, PNG, WebP, HEIC, MP4, WebM या MOV use करें।` }, { status: 400 });
      }
      if (file.size > maxSize) {
        return Response.json({ error: `${isVideo ? "Selfie video 25 MB" : "हर KYC image 12 MB"} से छोटा होना चाहिए।` }, { status: 400 });
      }
    }
    const applicationId = `VPSLR${Math.floor(100000 + Math.random() * 900000)}`;
    const documentPrefix = `seller-kyc/${applicationId}/${crypto.randomUUID()}`;
    const bucket = await getCloudflareBucket();

    await Promise.all(files.map(async ([key, value]) => {
      const file = value as File;
      const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
      const fileName = `${key}.${extension}`;
      const buffer = await file.arrayBuffer();

      if (bucket && typeof bucket.put === "function") {
        await bucket.put(`${documentPrefix}/${fileName}`, buffer, {
          httpMetadata: { contentType: file.type },
          customMetadata: { applicationId, documentType: key },
        });
      } else {
        await saveFileLocally(documentPrefix, fileName, buffer);
      }
    }));

    const db = await getDb();
    await db.insert(sellerApplications).values({
      applicationId,
      fullName: fullName.slice(0, 100),
      mobile: mobile.slice(0, 20),
      email: email.toLowerCase().slice(0, 150),
      businessName: businessName.slice(0, 150),
      businessType: businessType.slice(0, 80),
      gstin: field("gstin").slice(0, 30) || null,
      documentPrefix,
    });
    return Response.json({ applicationId, status: "Pending Review" }, { status: 201 });
  } catch (err) {
    console.error("Seller application submit error:", err);
    return Response.json({ error: "Your application could not be submitted. Please try again." }, { status: 500 });
  }
}

export async function getSellerApplicationsForAdmin() {
  const db = await getDb();
  return db.select().from(sellerApplications).orderBy(desc(sellerApplications.createdAt)).limit(30);
}
