"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { authFetch } from "@/lib/authClient";

type Address = {
  id: string;
  fullName?: string;
  phone?: string;
  street?: string;
  address?: string;
  city?: string;
  state?: string;
  postal?: string;
  zip?: string;
};

function PlaceOrderContent() {
  const params = useSearchParams();
  const router = useRouter();

  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const addressId = params.get("addr");

  useEffect(() => {
    if (!user || !addressId || cart.length === 0) return;

    const run = async () => {
      // Fetch full address
      const docRef = doc(db, "addresses", addressId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        alert("Address not found ❌");
        router.push("/m/checkout");
        return;
      }

      const address: Address = {
        id: snap.id,
        ...(snap.data() as Omit<Address, "id">),
      };

      // 🔐 Place order via server-side API (validates prices)
      const orderRes = await authFetch("/api/place-order", {
        method: "POST",
        body: JSON.stringify({
          cart: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size || "",
          })),
          shippingDetails: {
            name: address.fullName || "",
            email: user.email || "",
            phone: address.phone || "",
            address: address.street || address.address || "",
            city: address.city || "",
            zip: address.postal || address.zip || "",
          },
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.error || "Order failed ❌");
        router.push("/m/cart");
        return;
      }

      // 🔔 Notify admin via Telegram (authenticated)
      await authFetch("/api/notify-admin", {
        method: "POST",
        body: JSON.stringify({
          orderId: orderData.orderId,
          customerName: user.displayName,
          email: user.email,
          phone: address.phone || "N/A",
          address: {
            street: address.street || address.address || "—",
            city: address.city || "—",
            postal: address.postal || address.zip || "—",
          },
          items: cart,
          total: orderData.total,
        }),
      });

      clearCart();
      router.push("/m/success");
    };

    run();
  }, [user, addressId, cart, router, clearCart]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p>Placing your order...</p>
    </div>
  );
}

export default function PlaceOrderPage() {
  return (
    <Suspense fallback={<div style={{ padding: "20px", textAlign: "center" }}><p>Loading...</p></div>}>
      <PlaceOrderContent />
    </Suspense>
  );
}