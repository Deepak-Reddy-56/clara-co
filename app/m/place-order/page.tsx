"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { placeOrder } from "@/lib/placeOrder";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* 🔥 TYPE FIX (ONLY FOR TS, NO RUNTIME CHANGE) */
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
      // 🔥 FETCH FULL ADDRESS
      const docRef = doc(db, "addresses", addressId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        alert("Address not found ❌");
        router.push("/m/checkout");
        return;
      }

      // 🔥 TYPE-SAFE ADDRESS
      const address: Address = {
        id: snap.id,
        ...(snap.data() as Omit<Address, "id">),
      };

      console.log("ADDRESS BEING SENT:", address);

      // 🔥 PLACE ORDER (DESKTOP COMPATIBLE)
      const result = await placeOrder(cart, user, address);

      if (result.success) {
        const total = cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // 🔥 SAME TELEGRAM LOGIC AS DESKTOP
        await fetch("/api/notify-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: result.orderId,
            customerName: user.displayName,
            email: user.email,
            phone: address.phone || "N/A",
            address: {
              street: address.street || address.address || "—",
              city: address.city || "—",
              postal: address.postal || address.zip || "—",
            },
            items: cart,
            total,
          }),
        });

        clearCart();
        router.push("/m/success");
      } else {
        alert("Order failed ❌");
        router.push("/m/cart");
      }
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