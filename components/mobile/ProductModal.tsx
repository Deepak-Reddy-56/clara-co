"use client";

import { useRef, useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface Props {
  product: any;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const startY = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  const { user } = useAuth();
  const { cart, addToCart, increaseQty, decreaseQty } = useCart();

  useEffect(() => {
    // Entrance animation trigger
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!product) return null;

  const existingItem = cart.find(
    (item) => item.id === String(product.id)
  );

  const discountedPrice =
    product.discount && product.discount > 0
      ? product.price - (product.price * product.discount) / 100
      : null;

  const images = (product.images?.length > 0 ? product.images : [product.image]) || ["https://placehold.co/400x500?text=No+Image"];

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) setTranslateY(diff);
  };

  const handleTouchEnd = () => {
    if (translateY > 120) {
      setMounted(false);
      setTimeout(onClose, 300); // Wait for exit animation
    } else {
      setTranslateY(0);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300 ${mounted ? "opacity-100" : "opacity-0"}`} 
        onClick={() => {
           setMounted(false);
           setTimeout(onClose, 300);
        }}
      />
      
      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 w-full bg-white z-[9999] flex flex-col rounded-t-[28px] overflow-hidden drop-shadow-2xl"
        style={{
          transform: `translateY(${mounted ? translateY : 100}%)`,
          transition: translateY === 0 ? "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none",
          maxHeight: "92vh",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe Handle */}
        <div className="w-full flex justify-center py-3 bg-white pb-1 pt-4">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 pb-32">
          
          {/* Gallery */}
          <div className="relative w-full bg-[#f8f9fa] pt-2">
            <div
              className="flex overflow-x-auto snap-x snap-mandatory w-full scrollbar-none"
              onScroll={(e) => {
                const el = e.currentTarget;
                const index = Math.round(el.scrollLeft / el.offsetWidth);
                setActiveImage(index);
              }}
              style={{ scrollBehavior: "smooth" }}
            >
              {images.map((img: string, i: number) => (
                <div key={i} className="flex-none w-full min-h-[320px] snap-center px-4 flex items-center justify-center">
                  <img src={img} alt="" className="w-full h-full max-h-[350px] object-contain drop-shadow-sm mix-blend-multiply" />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5">
                {images.map((_: any, i: number) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${activeImage === i ? "w-4 bg-blue-600" : "w-1.5 bg-gray-300"}`} />
                ))}
              </div>
            )}
          </div>

          <div className="px-5 pt-5">
            <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase mb-1 block">Clara & Co. Official</span>
            <h2 className="text-xl leading-tight font-bold text-gray-900 mb-4">{product.name}</h2>
            
            {/* Pricing block */}
            <div className="flex items-end gap-2 mb-1">
              {discountedPrice ? (
                <>
                  <span className="text-[#CC0C39] text-lg font-light">-{product.discount}%</span>
                  <span className="text-3xl font-extrabold text-black">
                    <span className="text-xl pr-0.5">₹</span>{discountedPrice.toFixed(0)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-extrabold text-black">
                  <span className="text-xl pr-0.5">₹</span>{product.price.toFixed(0)}
                </span>
              )}
            </div>
            
            {discountedPrice && (
              <div className="text-sm text-gray-500 font-medium mb-1">
                M.R.P.: <span className="line-through">₹{product.price.toFixed(0)}</span>
              </div>
            )}
            <p className="text-[12px] text-gray-600 mb-5 font-medium">Inclusive of all taxes</p>

            {/* Stock indicator */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6">
              {product.inStock ? (
                <p className="text-[#007600] font-bold text-[15px]">In Stock</p>
              ) : (
                <p className="text-[#B12704] font-bold text-[15px]">Currently Unavailable</p>
              )}
            </div>

          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 px-4 py-4 pb-8 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-50">
          {!user ? (
            <button
              onClick={() => (window.location.href = "/m/login")}
              className="w-full bg-gray-900 text-white font-bold text-[15px] py-4 rounded-full active:scale-95 transition-transform"
            >
              Login to Checkout
            </button>
          ) : existingItem ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center justify-between border-2 border-gray-200 rounded-full bg-gray-50 w-[140px] px-2 py-1.5 h-14" style={{color: "black"}}>
                <button
                  onClick={() => decreaseQty(existingItem.id)}
                  className="w-10 h-10 flex items-center justify-center text-xl font-bold bg-white rounded-full shadow-sm active:scale-90 transition-transform"
                >
                  −
                </button>
                <span className="text-lg font-bold w-6 text-center">{existingItem.quantity}</span>
                <button
                  onClick={() => increaseQty(existingItem.id)}
                  className="w-10 h-10 flex items-center justify-center text-xl font-bold bg-white rounded-full shadow-sm active:scale-90 transition-transform"
                >
                  +
                </button>
              </div>
              <button
                className="flex-1 bg-green-600 text-white font-bold text-[15px] py-4 rounded-full h-14"
              >
                Added to Cart ✓
              </button>
            </div>
          ) : (
             <button
              onClick={() =>
                addToCart({
                  id: String(product.id),
                  name: product.name,
                  price: discountedPrice || product.price,
                  image: product.image,
                })
              }
              disabled={!product.inStock}
              className={`w-full font-bold text-[15px] py-4 rounded-full h-14 active:scale-[0.98] transition-transform ${
                product.inStock 
                ? "bg-[#FFD814] text-black shadow-sm font-extrabold border border-[#e3c01c]" 
                : "bg-gray-200 text-gray-500"
              }`}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </>
  );
}