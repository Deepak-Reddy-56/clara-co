"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/lib/products";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [draftProducts, setDraftProducts] = useState<Product[]>([]);

  // 🔐 Check if logged-in user is the admin
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

  // 📦 Load products AFTER auth is confirmed
  useEffect(() => {
    if (!authorized) return;

    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setDraftProducts(data));
  }, [authorized]);

  if (!authorized) return null; // prevents flicker & unauthorized view

  const updateField = (id: number, field: keyof Product, value: any) => {
    setDraftProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const toggleSection = (id: number, section: string) => {
    setDraftProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const sections = p.sections || [];
        const exists = sections.includes(section as any);
        return {
          ...p,
          sections: exists
            ? sections.filter((s) => s !== section)
            : [...sections, section as any],
        };
      })
    );
  };

  const deleteProduct = (id: number) => {
    setDraftProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now(),
      name: "New Product",
      price: 100,
      image: "https://via.placeholder.com/300",
      category: "clothes",
      inStock: true,
      sections: [],
    };
    setDraftProducts((prev) => [newProduct, ...prev]);
  };

  const saveChanges = async () => {
    await fetch("/api/save-products", {
      method: "POST",
      body: JSON.stringify(draftProducts),
    });
    alert("Changes saved!");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Admin Product Catalog</h1>
        <button
          onClick={() => router.push("/")}
          className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer"
        >
          Exit Admin
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={addProduct}
          className="bg-black text-white px-6 py-2 rounded-lg cursor-pointer"
        >
          + Add Product
        </button>

        <button
          onClick={saveChanges}
          className="bg-green-600 text-white px-6 py-2 rounded-lg cursor-pointer"
        >
          Save Changes
        </button>
      </div>

      <div className="space-y-8">
        {draftProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white p-6 rounded-xl shadow-sm flex gap-6"
          >
            <img
              src={
                product.image && product.image.trim() !== ""
                  ? product.image
                  : "https://via.placeholder.com/150?text=No+Image"
              }
              alt={product.name}
              className="w-28 h-28 object-cover rounded-lg"
            />

            <div className="flex-1 space-y-3">
              <input
                className="w-full border p-2 rounded"
                value={product.name}
                onChange={(e) => updateField(product.id, "name", e.target.value)}
              />

              <input
                className="w-full border p-2 rounded"
                placeholder="Image URL"
                value={product.image}
                onChange={(e) =>
                  updateField(product.id, "image", e.target.value)
                }
              />

              <div className="flex gap-4">
                <input
                  type="number"
                  className="border p-2 rounded w-32"
                  value={product.price}
                  onChange={(e) =>
                    updateField(product.id, "price", Number(e.target.value))
                  }
                />

                <input
                  type="number"
                  placeholder="Discount %"
                  className="border p-2 rounded w-32"
                  value={product.discount || ""}
                  onChange={(e) =>
                    updateField(product.id, "discount", Number(e.target.value))
                  }
                />

                <select
                  className="border p-2 rounded"
                  value={product.category}
                  onChange={(e) =>
                    updateField(product.id, "category", e.target.value)
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
                      onClick={() => toggleSection(product.id, section)}
                      className={`px-3 py-1 rounded-full text-sm border cursor-pointer ${
                        product.sections?.includes(section as any)
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
                  checked={product.inStock ?? true}
                  onChange={(e) =>
                    updateField(product.id, "inStock", e.target.checked)
                  }
                />
                In Stock
              </label>

              <button
                onClick={() => deleteProduct(product.id)}
                className="text-red-600 text-sm cursor-pointer"
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
