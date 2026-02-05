"use client";

import { useState } from "react";
import ProductModal from "./ProductModal";

type ProductCardProps = {
  id: string;              // ✅ Firestore IDs are strings
  name: string;
  price: number;
  image: string;
  discount?: number;
  inStock?: boolean;
  category?: string;
  sections?: string[];
};

export default function ProductCard({
  id,
  name,
  price,
  image,
  discount,
  inStock = true,
}: ProductCardProps) {
  const [open, setOpen] = useState(false);

  const discountedPrice =
    discount && discount > 0 ? price - (price * discount) / 100 : null;

  return (
    <>
      {/* CARD */}
      <div
        onClick={() => setOpen(true)}
        className="bg-white rounded-2xl shadow-sm overflow-hidden relative border hover:shadow-md transition cursor-pointer"
      >
        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-red-600 font-bold text-lg z-10">
            OUT OF STOCK
          </div>
        )}

        {/* Discount Badge */}
        {discount && discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
            -{discount}%
          </div>
        )}

        <img
          src={
            image && image.trim() !== ""
              ? image
              : "https://via.placeholder.com/400x500?text=No+Image"
          }
          alt={name}
          className="w-full h-64 object-cover"
        />

        <div className="p-4">
          <h3 className="font-semibold text-gray-800">{name}</h3>

          <div className="mt-2 flex items-center gap-2">
            {discountedPrice ? (
              <>
                <span className="text-black font-bold">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-gray-400 line-through text-sm">
                  ${price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-black font-bold">${price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      {open && (
        <ProductModal
          product={{ id, name, price, image, discount, inStock }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
