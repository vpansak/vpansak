import assert from "node:assert";
import { POST } from "../app/api/sellers/route";
import { getDb } from "../db/index";
import { sellerApplications } from "../db/schema";
import { eq } from "drizzle-orm";

async function testSellerUpload() {
  console.log("=== Testing Seller Application Upload Endpoint ===");

  const formData = new FormData();
  formData.append("fullName", "Alok Seller");
  formData.append("mobile", "9876543210");
  formData.append("email", "seller.alok@example.com");
  formData.append("businessName", "VPANSAK Traders");
  formData.append("businessType", "Proprietorship");
  formData.append("gstin", "07AAAAA0000A1Z5");

  const dummyImage = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const dummyVideo = new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32]);

  formData.append("aadhaarFront", new File([dummyImage], "aadhaar_front.jpg", { type: "image/jpeg" }));
  formData.append("aadhaarBack", new File([dummyImage], "aadhaar_back.jpg", { type: "image/jpeg" }));
  formData.append("panCard", new File([dummyImage], "1000001820.jpg", { type: "image/jpeg" }));
  formData.append("selfieVideo", new File([dummyVideo], "video_20260816_220615.mp4", { type: "video/mp4" }));

  const req = new Request("http://localhost:3000/api/sellers", {
    method: "POST",
    body: formData,
  });

  const res = await POST(req);
  assert.strictEqual(res.status, 201, "Response status must be 201 Created");
  const data = await res.json();
  assert.ok(data.applicationId, "Application ID must be returned");
  assert.strictEqual(data.status, "Pending Review", "Initial status must be Pending Review");

  console.log("✓ Application submission successful:", data.applicationId);

  const db = await getDb();
  const [row] = await db.select().from(sellerApplications).where(eq(sellerApplications.applicationId, data.applicationId)).limit(1);
  assert.ok(row, "Application record must exist in DB");
  assert.strictEqual(row.businessName, "VPANSAK Traders");
  assert.strictEqual(row.email, "seller.alok@example.com");

  console.log("✓ Database record verified successfully.");
  console.log("=== ALL SELLER UPLOAD TESTS PASSED ===");
}

testSellerUpload().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
