"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function SigninRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnTo = searchParams.get("return_to") || searchParams.get("redirect") || "";
    if (returnTo) {
      router.replace(`/login?return_to=${encodeURIComponent(returnTo)}`);
    } else {
      router.replace("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="vp-auth-page">
      <div className="vp-auth-card" style={{ textAlign: "center", padding: "40px 20px" }}>
        <img src="/vpansak-logo.png" alt="VPANSAK" className="vp-auth-logo" style={{ margin: "0 auto 12px", height: "36px" }} />
        <p style={{ color: "#475569", fontSize: "14px", fontWeight: 600 }}>Redirecting to VPANSAK login…</p>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={<div className="vp-auth-loading">Loading VPANSAK login…</div>}>
      <SigninRedirector />
    </Suspense>
  );
}
