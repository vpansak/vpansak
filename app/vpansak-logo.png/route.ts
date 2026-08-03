import { NextResponse } from "next/server";

const logoSvg = `
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="58" fill="#071629"/>
  <rect x="18" y="18" width="220" height="220" rx="48" fill="none" stroke="#9DC2FF" stroke-width="8"/>
  <path d="M69 69h118c16 0 29 13 29 29v61c0 16-13 29-29 29H69c-16 0-29-13-29-29V98c0-16 13-29 29-29Z" fill="none" stroke="#FFB020" stroke-width="13"/>
  <path d="M76 92l52 75 52-75" fill="none" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="128" y="225" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="900" letter-spacing="6" fill="#FFFFFF">VP</text>
</svg>`;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(logoSvg.trim(), {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
