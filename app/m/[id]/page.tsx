"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "orders", String(id)));

      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) return <p style={{ padding: "20px" }}>Loading...</p>;

  const total =
    order.total ??
    order.items?.reduce(
      (sum: number, i: any) => sum + i.price * i.quantity,
      0
    ) ??
    0;

  const date = order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
    : "—";

  return (
    <div style={{ padding: "16px", color: "#111" }}>
      <h2 style={{ marginBottom: "12px" }}>Order Details</h2>

      {/* ORDER META */}
      <div style={card}>
        <p><b>Order ID:</b> {order.id}</p>
        <p><b>Status:</b> {order.status || "PENDING"}</p>
        <p><b>Ordered On:</b> {date}</p>
        <p><b>Expected Delivery:</b> —</p>
      </div>

      {/* ITEMS */}
      <h3 style={section}>Items</h3>

      <div style={card}>
        {order.items?.map((item: any, i: number) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            {item.name} × {item.quantity}
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div style={card}>
        <b>Total: ₹{total}</b>
      </div>

      {/* ADDRESS */}
      {order.shippingDetails && (
        <>
          <h3 style={section}>Shipping Address</h3>

          <div style={card}>
            <p>{order.shippingDetails.fullName}</p>
            <p>{order.shippingDetails.street}</p>
            <p>
              {order.shippingDetails.city} -{" "}
              {order.shippingDetails.postal}
            </p>
            <p>{order.shippingDetails.phone}</p>
          </div>
        </>
      )}
    </div>
  );
}

const card = {
  padding: "12px",
  border: "1px solid #eee",
  borderRadius: "12px",
  marginBottom: "12px",
};

const section = {
  marginTop: "12px",
  marginBottom: "8px",
  fontWeight: 600,
};