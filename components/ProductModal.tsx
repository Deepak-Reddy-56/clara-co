"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Toast from "./Toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductModal({ product, onClose }: any) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

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

          {/* Image Gallery */}
          <div className="flex flex-col gap-4 relative">
            <div className="relative flex-1 bg-[#F8F9FA] rounded-2xl flex items-center justify-center p-2 sm:p-4 min-h-[400px] sm:min-h-[500px]">
               <img
                src={
                  (product.images?.length > 0 ? product.images[activeImage] : product.image) || "https://placehold.co/500x600?text=No+Image"
                }
                alt={product.name}
                className="w-full h-full max-h-[450px] sm:max-h-[550px] object-contain drop-shadow-sm"
              />
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === 0 ? product.images.length - 1 : prev - 1); }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white flex items-center justify-center w-10 h-10 rounded-full shadow-lg border border-gray-100 text-black hover:bg-gray-50 transition-all z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === product.images.length - 1 ? 0 : prev + 1); }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white flex items-center justify-center w-10 h-10 rounded-full shadow-lg border border-gray-100 text-black hover:bg-gray-50 transition-all z-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto snap-x pb-2 pt-1 px-1">
                {product.images.map((img: string, i: number) => (
                   <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 shrink-0 snap-start bg-[#F8F9FA] rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-blue-600 shadow-md ring-2 ring-blue-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Side */}
          <div className="flex flex-col h-full">
            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase mb-2">Clara & Co. Official</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h2>

            {/* Price Block */}
            <div className="mb-2">
              {discountedPrice ? (
                <div className="flex flex-col">
                  <div className="flex items-end gap-3 mb-1">
                    <span className="text-[#CC0C39] text-2xl font-light">-{product.discount}%</span>
                    <span className="text-4xl font-bold text-black border-l border-gray-300 pl-3">
                      <span className="text-2xl font-medium relative -top-2 pr-1">₹</span>{discountedPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    M.R.P.: <span className="line-through">₹{product.price.toFixed(2)}</span>
                  </span>
                </div>
              ) : (
                <p className="text-4xl font-bold mb-4 text-black">
                  <span className="text-2xl font-medium relative -top-2 pr-1">₹</span>{product.price.toFixed(2)}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-6 font-medium">Inclusive of all taxes</p>

            {/* Stock status */}
            <div className="mb-6">
              {product.inStock ? (
                <p className="text-[#007600] font-bold text-lg">In Stock</p>
              ) : (
                <p className="text-[#B12704] font-bold text-lg">Currently Unavailable</p>
              )}
            </div>

            <hr className="border-gray-200 mb-6" />

            {/* Quantity Selector */}
            {product.inStock && (
              <div className="flex items-center gap-4 mb-8">
                <span className="font-semibold text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-lg shadow-sm bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-200 text-gray-700 transition-colors font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="px-5 py-2 font-bold w-14 text-center border-x border-gray-300 bg-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-200 text-gray-700 transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-auto w-full">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-3.5 px-6 rounded-full font-bold text-base shadow-sm transition-all duration-200
                  ${
                    product.inStock
                      ? "bg-[#FFD814] hover:bg-[#F7CA00] text-black border border-[#FCD200] active:scale-[0.98]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {added ? "Added to Cart ✓" : "Add to Cart"}
              </button>
            </div>
            
          </div>
        </div>
      </div>

      <Toast message="Item added to cart" show={showToast} />
    </>
  );
}
