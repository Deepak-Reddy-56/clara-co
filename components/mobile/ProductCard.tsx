"use client";

import { useState } from "react";
import ProductModal from "./ProductModal";

interface Props {
  product: any;
}

export default function ProductCard({ product }: Props) {
  const [open, setOpen] = useState(false);

  const discountedPrice =
    product.discount && product.discount > 0
      ? (product.price - (product.price * product.discount) / 100).toFixed(0)
      : null;

  return (
    <>
      <div className="product-card" onClick={() => setOpen(true)}>
        <div
          className="product-image"
          style={{
            backgroundImage: `url(${product.image})`,
            position: "relative",
          }}
        >
          {product.discount > 0 && (
            <div style={{
              position: "absolute", top: "8px", left: "8px",
              background: "#CC0C39", color: "white", fontSize: "10px",
              fontWeight: 700, padding: "3px 6px", borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}>
              -{product.discount}%
            </div>
          )}
        </div>

        <div className="product-info">
          <p className="product-name">{product.name}</p>
          {discountedPrice ? (
            <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
              <p className="product-price" style={{ fontWeight: 700, color: "#111" }}>₹{discountedPrice}</p>
              <p className="product-price" style={{ textDecoration: "line-through", color: "#888", fontSize: "11px" }}>₹{product.price}</p>
            </div>
          ) : (
            <p className="product-price">₹{product.price}</p>
          )}
        </div>
      </div>

      {open && (
        <ProductModal
          product={product}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}