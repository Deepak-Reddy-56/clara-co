"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const found = products.find((p: any) =>
          `${p.price}-${(p.name || "").replace(/\s+/g, "-").toLowerCase()}` === slug
        );
        setProduct(found);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProduct();
  }, [slug]);

  if (!product) {
    return <div className="p-20 text-center text-gray-500">Loading...</div>;
  }

  const discountedPrice =
    product.discount && product.discount > 0
      ? product.price - (product.price * product.discount) / 100
      : null;

  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : ["https://via.placeholder.com/600x700?text=No+Image"]);
  const [activeImage, setActiveImage] = useState(0);

  return (
    <main className="min-h-screen bg-white text-gray-800 px-6 py-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        
        {/* Gallery */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
              {images.map((img: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? "border-black" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="flex-1 relative group">
             <img
              src={images[activeImage]}
              alt={product.name}
              className="w-full rounded-2xl object-cover aspect-[4/5]"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                  className="hidden md:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 bg-white flex w-10 h-10 rounded-full shadow-lg border border-gray-100 text-black hover:bg-gray-50 transition-all z-10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === images.length - 1 ? 0 : prev + 1); }}
                  className="hidden md:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 bg-white flex w-10 h-10 rounded-full shadow-lg border border-gray-100 text-black hover:bg-gray-50 transition-all z-10"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            
            {/* Mobile Thumbnails */}
            {images.length > 1 && (
              <div className="flex md:hidden gap-3 mt-4 overflow-x-auto snap-x pb-2">
                {images.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-20 shrink-0 snap-start rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? "border-black" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          {discountedPrice ? (
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-black">
                ₹{discountedPrice.toFixed(2)}
              </span>
              <span className="text-xl text-gray-400 line-through">
                ₹{product.price.toFixed(2)}
              </span>
              <span className="text-red-500 font-semibold">
                {product.discount}% OFF
              </span>
            </div>
          ) : (
            <p className="text-3xl font-bold mb-4">₹{product.price.toFixed(2)}</p>
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
