import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const filePath = join(process.cwd(), "public", "vpansak-logo.png");
    const imageBuffer = await readFile(filePath);
    return new NextResponse(imageBuffer, {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=86400, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("Logo not found", { status: 404 });
  }
}
