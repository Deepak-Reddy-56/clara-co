"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    async function fetchProduct() {
      const docRef = doc(db, "products", id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        setProduct({ id: snapshot.id, ...snapshot.data() });
      }
    }

    if (id) fetchProduct();
  }, [id]);

  if (!product) {
    return <p style={{ padding: "16px" }}>Loading...</p>;
  }

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          height: "250px",
          borderRadius: "16px",
          backgroundImage: `url(${product.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <h2 style={{ marginTop: "16px", fontSize: "20px" }}>
        {product.name}
      </h2>

      <p style={{ fontSize: "18px", margin: "8px 0" }}>
        ₹{product.price}
      </p>

      <button
        style={{
          marginTop: "16px",
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          background: "black",
          color: "white",
          fontWeight: "600",
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}