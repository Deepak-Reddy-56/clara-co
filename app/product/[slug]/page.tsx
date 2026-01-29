"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((products) => {
        const found = products.find((p: any) =>
          `${p.price}-${p.name.replace(/\s+/g, "-").toLowerCase()}` === slug
        );
        setProduct(found);
      });
  }, [slug]);

  if (!product) {
    return <div className="p-20 text-center text-gray-500">Loading...</div>;
  }

  const discountedPrice =
    product.discount && product.discount > 0
      ? product.price - (product.price * product.discount) / 100
      : null;

  return (
    <main className="min-h-screen bg-white text-gray-800 px-6 py-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">

        <img
          src={
            product.image && product.image.trim() !== ""
              ? product.image
              : "https://via.placeholder.com/600x700?text=No+Image"
          }
          alt={product.name}
          className="w-full rounded-2xl object-cover"
        />

        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          {discountedPrice ? (
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-black">
                ${discountedPrice.toFixed(2)}
              </span>
              <span className="text-xl text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-red-500 font-semibold">
                {product.discount}% OFF
              </span>
            </div>
          ) : (
            <p className="text-3xl font-bold mb-4">${product.price.toFixed(2)}</p>
          )}

          {!product.inStock && (
            <p className="text-red-600 font-semibold mb-4">Out of Stock</p>
          )}

          <button
            disabled={!product.inStock}
            className="mt-4 bg-black text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 disabled:bg-gray-400"
          >
            Add to Cart
          </button>
        </div>

      </div>
    </main>
  );
}
