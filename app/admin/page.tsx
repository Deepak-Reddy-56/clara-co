"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Product = {
  id?: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  sections: string[];
  discount?: number;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // 🔐 Admin auth check
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push("/");
      return;
    }

    setAuthorized(true);
  }, [user, loading, router]);

  // 📦 Load products from Firestore
  useEffect(() => {
    if (!authorized) return;

    const loadProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));
      setProducts(data);
    };

    loadProducts();
  }, [authorized]);

  if (!authorized) return null;

  // 🔄 Update field locally
  const updateField = (id: string, field: keyof Product, value: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // 📂 Toggle sections
  const toggleSection = (id: string, section: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const sections = p.sections || [];
        const exists = sections.includes(section);
        return {
          ...p,
          sections: exists
            ? sections.filter((s) => s !== section)
            : [...sections, section],
        };
      })
    );
  };

  // ❌ Delete product
  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ➕ Add new product
  const addProduct = async () => {
    const newProduct = {
      name: "New Product",
      price: 100,
      image: "https://via.placeholder.com/300",
      category: "clothes",
      inStock: true,
      sections: [],
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "products"), newProduct);

    setProducts((prev) => [
      { id: docRef.id, ...newProduct } as Product,
      ...prev,
    ]);
  };

  // 💾 Save edits to Firestore
  const saveChanges = async () => {
    await Promise.all(
      products.map((product) => {
        if (!product.id) return;
        const { id, ...data } = product;
        return updateDoc(doc(db, "products", id), data);
      })
    );

    alert("Changes saved!");
  };

  // ☁️ Upload image to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dc2a3idlt/image/upload",
      { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Admin Product Catalog</h1>
        <button
          onClick={() => router.push("/")}
          className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Exit Admin
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={addProduct}
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          + Add Product
        </button>

        <button
          onClick={saveChanges}
          className="bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          Save Changes
        </button>

        <button
            onClick={() => router.push("/admin/orders")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            View Orders
      </button>
      </div>

       

      <div className="space-y-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-6 rounded-xl shadow-sm flex gap-6"
          >
            <img
              src={product.image || "https://via.placeholder.com/150"}
              alt={product.name}
              className="w-28 h-28 object-cover rounded-lg"
            />

            <div className="flex-1 space-y-3">
              <input
                className="w-full border p-2 rounded"
                value={product.name}
                onChange={(e) =>
                  updateField(product.id!, "name", e.target.value)
                }
              />

              {/* 📸 Cloudinary Upload */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const imageUrl = await uploadToCloudinary(file);
                    updateField(product.id!, "image", imageUrl);
                  }}
                  className="text-sm"
                />

                <input
                  className="w-full border p-2 rounded"
                  placeholder="Image URL (auto-filled after upload)"
                  value={product.image}
                  onChange={(e) =>
                    updateField(product.id!, "image", e.target.value)
                  }
                />
              </div>

              <div className="flex gap-4">
                <input
                  type="number"
                  className="border p-2 rounded w-32"
                  value={product.price}
                  onChange={(e) =>
                    updateField(product.id!, "price", Number(e.target.value))
                  }
                />

                <select
                  className="border p-2 rounded"
                  value={product.category}
                  onChange={(e) =>
                    updateField(product.id!, "category", e.target.value)
                  }
                >
                  <option value="clothes">Clothes</option>
                  <option value="phones">Phones</option>
                  <option value="footwear">Footwear</option>
                </select>
              </div>

              <div className="flex gap-3 flex-wrap">
                {["new-arrivals", "top-selling", "casual", "formal", "party", "gym"].map(
                  (section) => (
                    <button
                      key={section}
                      onClick={() => toggleSection(product.id!, section)}
                      className={`px-3 py-1 rounded-full text-sm border ${
                        product.sections?.includes(section)
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {section}
                    </button>
                  )
                )}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={product.inStock}
                  onChange={(e) =>
                    updateField(product.id!, "inStock", e.target.checked)
                  }
                />
                In Stock
              </label>

              <button
                onClick={() => deleteProduct(product.id!)}
                className="text-red-600 text-sm"
              >
                Delete Product
              </button>

             

            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
