"use client";

import { useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface Props {
  product: any;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const startY = useRef(0);
  const [translateY, setTranslateY] = useState(0);

  const { user } = useAuth();
  const { cart, addToCart, increaseQty, decreaseQty } = useCart();

  if (!product) return null;

  const existingItem = cart.find(
    (item) => item.id === String(product.id)
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) setTranslateY(diff);
  };

  const handleTouchEnd = () => {
    if (translateY > 120) onClose();
    else setTranslateY(0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: translateY === 0 ? "0.2s ease" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="modal-handle" />

        <div
          className="modal-image"
          style={{ backgroundImage: `url(${product.image})` }}
        />

        <h2>{product.name}</h2>
        <p>₹{product.price}</p>

        {/* 🔥 SMART BUTTON AREA */}
        <div className="modal-footer">
          {!user ? (
            // 🔐 NOT LOGGED IN
            <button
              className="modal-btn"
              onClick={() => (window.location.href = "/m/login")}
            >
              Login to continue
            </button>
          ) : existingItem ? (
            // 🔁 ALREADY IN CART
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <button
                onClick={() => decreaseQty(existingItem.id)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "#f5f5f5",
                  color: "#111",
                  fontSize: "18px",
                }}
              >
                −
              </button>

              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#111",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {existingItem.quantity}
              </span>

              <button
                onClick={() => increaseQty(existingItem.id)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "#f5f5f5",
                  color: "#111",
                  fontSize: "18px",
                }}
              >
                +
              </button>
            </div>
          ) : (
            // 🛒 ADD TO CART
            <button
              className="modal-btn"
              onClick={() =>
                addToCart({
                  id: String(product.id),
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}