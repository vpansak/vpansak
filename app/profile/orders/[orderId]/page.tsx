"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function OrderDetailRoute() {
  const params = useParams<{ orderId: string }>();
  
  useEffect(() => {
    if (params.orderId) {
      window.location.href = `/track?id=${encodeURIComponent(params.orderId)}`;
    }
  }, [params.orderId]);

  return (
    <main className="account-loading-skeleton">
      <div className="skeleton-container">
        <p>Loading order details for {params.orderId}…</p>
      </div>
    </main>
  );
}
