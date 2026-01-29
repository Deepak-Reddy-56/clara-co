"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Toast from "./Toast";

export default function ProductModal({ product, onClose }: any) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  if (!product) return null;

  const discountedPrice =
    product.discount && product.discount > 0
      ? product.price - (product.price * product.discount) / 100
      : null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: discountedPrice || product.price,
        image: product.image,
      });
    }

    setAdded(true);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setAdded(false);
      onClose(); // close modal after toast
    }, 1200);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 relative grid md:grid-cols-2 gap-8">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>

          {/* Image */}
          <img
            src={
              product.image && product.image.trim() !== ""
                ? product.image
                : "https://placehold.co/500x600?text=No+Image"
            }
            alt={product.name}
            className="w-full rounded-xl object-cover"
          />

          {/* Info */}
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              {product.name}
            </h2>

            {discountedPrice ? (
              <div className="flex gap-3 items-center mb-4">
                <span className="text-2xl font-bold text-black">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="line-through text-gray-400">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-red-500 font-semibold">
                  {product.discount}% OFF
                </span>
              </div>
            ) : (
              <p className="text-2xl font-bold mb-4 text-black">
                ${product.price.toFixed(2)}
              </p>
            )}

            {!product.inStock && (
              <p className="text-red-600 font-semibold mb-4">Out of Stock</p>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium text-gray-800">Quantity:</span>
              <div className="flex items-center border rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-6 text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`mt-2 px-8 py-3 rounded-lg font-semibold shadow-md transition-all duration-200
                ${
                  product.inStock
                    ? "bg-black text-white hover:shadow-lg active:scale-95"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      <Toast message="Item added to cart" show={showToast} />
    </>
  );
}
