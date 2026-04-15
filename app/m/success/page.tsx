"use client";

import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div
      style={{
        padding: "20px",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
        🎉 Order Placed!
      </h2>

      <p style={{ color: "#666", marginBottom: "20px" }}>
        Your order has been successfully placed.
      </p>

      <button
        onClick={() => router.push("/m/shop")}
        style={{
          padding: "12px 20px",
          borderRadius: "10px",
          background: "black",
          color: "white",
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
}