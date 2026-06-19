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
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AddProductModal from "@/components/AddProductModal";
import { authFetch } from "@/lib/authClient";

type Product = {
  id?: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  sections: string[];
  discount?: number;
  images?: string[];
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 🎠 Carousel States
  const [carouselSectionName, setCarouselSectionName] = useState("");
  const [carouselImages, setCarouselImages] = useState<{ url: string; link: string }[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [carouselSaving, setCarouselSaving] = useState(false);

  // 🔐 Admin auth check (server-side)
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    authFetch("/api/check-admin")
      .then((res) => res.json())
      .then((data) => {
        if (!data.isAdmin) {
          router.push("/");
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => router.push("/"));
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

  // 🎠 Load Carousel Settings from Firestore
  useEffect(() => {
    if (!authorized) return;
    const loadCarousel = async () => {
      try {
        const docRef = doc(db, "settings", "carousel");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCarouselSectionName(data.sectionName || "");
          setCarouselImages(data.images || []);
        } else {
          setCarouselSectionName("Exclusive Drops");
          setCarouselImages([
            { url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200", link: "/shop" }
          ]);
        }
      } catch (err) {
        console.error("Failed to load carousel settings:", err);
      } finally {
        setCarouselLoading(false);
      }
    };
    loadCarousel();
  }, [authorized]);

  // 💾 Save Carousel Settings to Firestore
  const saveCarouselSettings = async () => {
    setCarouselSaving(true);
    try {
      const docRef = doc(db, "settings", "carousel");
      await setDoc(docRef, {
        sectionName: carouselSectionName,
        images: carouselImages.filter(img => img.url.trim() !== ""),
      });
      alert("Homepage carousel settings saved successfully!");
    } catch (err: any) {
      alert("Error saving carousel settings: " + err.message);
    } finally {
      setCarouselSaving(false);
    }
  };

  if (!authorized) return null;

  // 🔄 Update field locally
  const updateField = (id: string, field: keyof Product, value: any) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, [field]: value };
        if (field === "images" && Array.isArray(value)) {
          next.image = value.length > 0 ? value[0] : "";
        }
        return next;
      })
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
  const handleAddProductSave = async (data: any) => {
    try {
      const newUrls = await Promise.all(data.brandNewFiles.map((f: File) => uploadToCloudinary(f)));
      
      const newProduct = {
        name: data.name,
        price: data.price,
        discount: data.discount,
        category: data.category,
        inStock: data.inStock,
        sections: data.sections,
        image: newUrls.length > 0 ? newUrls[0] : "",
        images: newUrls,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "products"), newProduct);

      setProducts((prev) => [
        { id: docRef.id, ...newProduct } as Product,
        ...prev,
      ]);
    } catch (err: any) {
      alert("Error adding product: " + err.message);
    }
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

  // ☁️ Upload image to Cloudinary (via server-side API)
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await authFetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Upload failed");
    }

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
          onClick={() => setIsAddModalOpen(true)}
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

      {/* 🎠 Homepage Carousel Settings Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Homepage Carousel Settings</h2>
            <p className="text-sm text-gray-500">Manage the auto-scrolling promo banner images (up to 5) and the section title.</p>
          </div>
          <button
            onClick={saveCarouselSettings}
            disabled={carouselSaving || carouselLoading}
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition flex-shrink-0"
          >
            {carouselSaving ? "Saving..." : "Save Carousel Settings"}
          </button>
        </div>

        {carouselLoading ? (
          <p className="text-gray-500">Loading settings...</p>
        ) : (
          <div className="space-y-4">
            {/* Section Title Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                className="w-full border p-2.5 rounded-lg"
                placeholder="e.g., Exclusive Deals, Trending Styles"
                value={carouselSectionName}
                onChange={(e) => setCarouselSectionName(e.target.value)}
              />
            </div>

            {/* Banner Slots */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Banner Images (Max 5)</label>
              
              <div className="grid gap-4">
                {carouselImages.map((image, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-gray-50 relative group">
                    {/* Image Preview */}
                    <div className="w-full sm:w-32 h-20 flex-shrink-0 border rounded-lg overflow-hidden bg-gray-200 relative">
                      {image.url ? (
                        <img src={image.url} className="w-full h-full object-cover" alt={`Banner ${index + 1}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                      )}
                    </div>

                    {/* URL and Link Fields */}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          className="flex-1 border p-1.5 rounded text-sm bg-white"
                          placeholder="Image URL"
                          value={image.url}
                          onChange={(e) => {
                            const updated = [...carouselImages];
                            updated[index].url = e.target.value;
                            setCarouselImages(updated);
                          }}
                        />
                        
                        {/* File Upload for specific slot */}
                        <label className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm cursor-pointer whitespace-nowrap select-none">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const url = await uploadToCloudinary(file);
                                const updated = [...carouselImages];
                                updated[index].url = url;
                                setCarouselImages(updated);
                              } catch (err: any) {
                                alert("Upload failed: " + err.message);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        className="w-full border p-1.5 rounded text-sm bg-white"
                        placeholder="Redirect Link (e.g. /shop, /product/abc)"
                        value={image.link}
                        onChange={(e) => {
                          const updated = [...carouselImages];
                          updated[index].link = e.target.value;
                          setCarouselImages(updated);
                        }}
                      />
                    </div>

                    {/* Slot Management Buttons */}
                    <div className="flex sm:flex-col justify-between sm:justify-end gap-2 items-center sm:items-end">
                      <div className="flex gap-1">
                        <button
                          disabled={index === 0}
                          onClick={() => {
                            const updated = [...carouselImages];
                            const temp = updated[index];
                            updated[index] = updated[index - 1];
                            updated[index - 1] = temp;
                            setCarouselImages(updated);
                          }}
                          className="p-1 border rounded bg-white text-xs disabled:opacity-30 hover:bg-gray-100 font-bold"
                        >
                          ▲
                        </button>
                        <button
                          disabled={index === carouselImages.length - 1}
                          onClick={() => {
                            const updated = [...carouselImages];
                            const temp = updated[index];
                            updated[index] = updated[index + 1];
                            updated[index + 1] = temp;
                            setCarouselImages(updated);
                          }}
                          className="p-1 border rounded bg-white text-xs disabled:opacity-30 hover:bg-gray-100 font-bold"
                        >
                          ▼
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setCarouselImages(carouselImages.filter((_, i) => i !== index));
                        }}
                        className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {carouselImages.length === 0 && (
                  <p className="text-sm text-gray-500 py-2">No banners added yet. Add a banner below.</p>
                )}

                {carouselImages.length < 5 && (
                  <button
                    onClick={() => {
                      setCarouselImages([...carouselImages, { url: "", link: "" }]);
                    }}
                    className="border-2 border-dashed border-gray-300 hover:border-gray-400 py-3 rounded-lg text-sm text-gray-600 font-semibold hover:bg-gray-50 transition"
                  >
                    + Add Banner Slot (Max 5)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm font-semibold text-gray-700">Product Images</p>
                <div className="flex gap-3 flex-wrap">
                  {(product.images || (product.image ? [product.image] : [])).map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} className="w-16 h-16 object-cover rounded border border-gray-300" />
                      <button 
                        onClick={() => {
                          const list = [...(product.images || (product.image ? [product.image] : []))];
                          list.splice(i, 1);
                          updateField(product.id!, "images", list);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 text-gray-500 transition">
                    <span className="text-xl">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        
                        const current = product.images || (product.image ? [product.image] : []);
                        
                        // Upload sequentially or parallel (parallel here)
                        const newUrls = await Promise.all(files.map(f => uploadToCloudinary(f)));
                        updateField(product.id!, "images", [...current, ...newUrls]);
                      }}
                    />
                  </label>
                </div>
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

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddProductSave} 
      />
    </main>
  );
}
