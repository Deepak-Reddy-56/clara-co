"use client";

import { useState } from "react";
import ProductModal from "./ProductModal";

interface Props {
  product: any;
}

export default function ProductCard({ product }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="product-card" onClick={() => setOpen(true)}>
        <div
          className="product-image"
          style={{
            backgroundImage: `url(${product.image})`,
          }}
        />

        <div className="product-info">
          <p className="product-name">{product.name}</p>
          <p className="product-price">₹{product.price}</p>
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