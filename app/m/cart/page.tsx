"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation"; // ✅ ADD
import { useAuth } from "@/context/AuthContext"; // ✅ ADD

export default function CartPage() {
  const { cart, increaseQty, decreaseQty, removeFromCart } = useCart();
  const { user } = useAuth(); // ✅ ADD
  const router = useRouter(); // ✅ ADD

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ padding: "16px", color: "#111" }}>
      <h2
        style={{
          fontSize: "20px",
          marginBottom: "16px",
          fontWeight: 600,
        }}
      >
        Your Cart
      </h2>

      {cart.length === 0 ? (
        <p style={{ color: "#555" }}>Your cart is empty</p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
                borderBottom: "1px solid #eee",
                paddingBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "10px",
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, color: "#111" }}>
                  {item.name}
                </p>

                <p style={{ color: "#444", fontSize: "14px" }}>
                  ₹{item.price}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "8px",
                  }}
                >
                  <button
                    onClick={() => decreaseQty(item.id)}
                    style={btnSmall}
                  >
                    −
                  </button>

                  <span style={qtyStyle}>{item.quantity}</span>

                  <button
                    onClick={() => increaseQty(item.id)}
                    style={btnSmall}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#888",
                    background: "none",
                    border: "none",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <h3 style={{ marginTop: "10px", color: "#111" }}>
            Total: ₹{total}
          </h3>

          {/* 🔥 FIXED CHECKOUT */}
          <button
            style={checkoutBtn}
            onClick={() => {
              if (!user) {
                router.push("/m/login");
                return;
              }

              // 👉 GO TO ADDRESS SELECTION
              router.push("/m/checkout");
            }}
          >
            Checkout
          </button>
        </>
      )}
    </div>
  );
}

const btnSmall = {
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  background: "white",
  color: "#111",
  fontWeight: "600",
};

const qtyStyle = {
  minWidth: "20px",
  textAlign: "center" as const,
  color: "#111",
  fontWeight: 500,
};

const checkoutBtn = {
  marginTop: "16px",
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  background: "black",
  color: "white",
  fontWeight: "600",
  fontSize: "16px",
};