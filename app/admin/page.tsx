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
  orderBy,
  query,
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
  sizeRange?: string;
  outOfStockSizes?: string;
};

type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED";

type OrderItem = {
  name?: string;
  price?: number;
  quantity?: number;
  size?: string;
};

type ShippingDetails = {
  name?: string;
  address?: string;
  city?: string;
  zip?: string;
  fullName?: string;
  street?: string;
  postal?: string;
  phone?: string;
};

type FirestoreTimestampLike = {
  seconds?: number;
  toDate?: () => Date;
};

type Order = {
  id: string;
  userEmail?: string;
  items?: OrderItem[];
  total?: number;
  status?: string;
  expectedDelivery?: string;
  trackingLink?: string;
  createdAt?: FirestoreTimestampLike;
  shippingDetails?: ShippingDetails;
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

  // 🏷️ Styles Settings States
  const [stylesSectionName, setStylesSectionName] = useState("");
  const [stylesList, setStylesList] = useState<{ name: string; slug: string; image: string; description?: string }[]>([]);
  const [stylesLoading, setStylesLoading] = useState(true);
  const [stylesSaving, setStylesSaving] = useState(false);

  // 🛍️ Orders & Tabs States
  const [tab, setTab] = useState<"products" | "orders" | "carousel" | "styles">("products");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [deliveryDates, setDeliveryDates] = useState<Record<string, string>>({});
  const [trackingLinks, setTrackingLinks] = useState<Record<string, string>>({});

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

  // 🏷️ Load Styles Settings from Firestore
  useEffect(() => {
    if (!authorized) return;
    const loadStyles = async () => {
      try {
        const docRef = doc(db, "settings", "styles");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStylesSectionName(data.sectionName || "");
          setStylesList(data.styles || []);
        } else {
          setStylesSectionName("Shop by Style");
          setStylesList([
            { name: "Casual", slug: "casual", image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=800", description: "Everyday effortless looks" },
            { name: "Formal", slug: "formal", image: "https://images.unsplash.com/photo-1516822003754-cca485356ecb?q=80&w=800", description: "Sharp and professional" },
            { name: "Party", slug: "party", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800", description: "Stand out every night" },
            { name: "Gym", slug: "gym", image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800", description: "Performance meets style" }
          ]);
        }
      } catch (err) {
        console.error("Failed to load styles settings:", err);
      } finally {
        setStylesLoading(false);
      }
    };
    loadStyles();
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

  // 💾 Save Styles Settings to Firestore
  const saveStylesSettings = async () => {
    setStylesSaving(true);
    try {
      const docRef = doc(db, "settings", "styles");
      const cleanStyles = stylesList
        .map(s => ({
          name: s.name.trim(),
          slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          image: s.image.trim(),
          description: (s.description || "").trim()
        }))
        .filter(s => s.name !== "");
      
      await setDoc(docRef, {
        sectionName: stylesSectionName,
        styles: cleanStyles,
      });
      alert("Styles settings saved successfully!");
    } catch (err: any) {
      alert("Error saving styles settings: " + err.message);
    } finally {
      setStylesSaving(false);
    }
  };

  // 🛍️ Load Orders from Firestore
  useEffect(() => {
    if (!authorized || tab !== "orders") return;

    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(ordersQuery);

        const data: Order[] = snapshot.docs.map((orderDoc) => ({
          id: orderDoc.id,
          ...(orderDoc.data() as Omit<Order, "id">),
        }));

        setOrders(data);

        // Seed local state with any existing values from Firestore
        const dates: Record<string, string> = {};
        const links: Record<string, string> = {};
        data.forEach((o) => {
          if (o.expectedDelivery) dates[o.id] = o.expectedDelivery;
          if (o.trackingLink) links[o.id] = o.trackingLink;
        });
        setDeliveryDates(dates);
        setTrackingLinks(links);
      } catch (fetchError) {
        console.error("Failed to load admin orders:", fetchError);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [authorized, tab]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setSavingOrderId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (updateError) {
      console.error("Failed to update order status:", updateError);
      alert("Could not update order status. Please try again.");
    } finally {
      setSavingOrderId(null);
    }
  };

  const updateDeliveryInfo = async (orderId: string) => {
    const expectedDelivery = deliveryDates[orderId] ?? "";
    const trackingLink = trackingLinks[orderId] ?? "";

    setSavingOrderId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        expectedDelivery,
        trackingLink,
      });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, expectedDelivery, trackingLink }
            : order
        )
      );
      alert("Delivery info saved!");
    } catch (updateError) {
      console.error("Failed to update delivery info:", updateError);
      alert("Could not save delivery info. Please try again.");
    } finally {
      setSavingOrderId(null);
    }
  };

  // Helper functions for orders formatting
  const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];
  const normalizeStatus = (status?: string): OrderStatus => {
    if (status === "PAID" || status === "SHIPPED" || status === "DELIVERED") {
      return status;
    }
    return "PENDING";
  };

  const calculateOrderTotal = (order: Order) => {
    if (typeof order.total === "number") {
      return order.total;
    }
    return (order.items || []).reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
      0
    );
  };

  const formatOrderDate = (createdAt?: FirestoreTimestampLike) => {
    if (createdAt?.toDate) {
      return createdAt.toDate().toLocaleString();
    }
    if (typeof createdAt?.seconds === "number") {
      return new Date(createdAt.seconds * 1000).toLocaleString();
    }
    return "Processing";
  };

  const normalizeShipping = (details?: ShippingDetails) => {
    return {
      name: details?.fullName || details?.name || "—",
      address: details?.street || details?.address || "—",
      city: details?.city || "—",
      zip: details?.postal || details?.zip || "—",
      phone: details?.phone || "",
    };
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "PAID":
        return "bg-blue-100 text-blue-700";
      case "SHIPPED":
        return "bg-purple-100 text-purple-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
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
        sizeRange: data.sizeRange || "",
        outOfStockSizes: data.outOfStockSizes || "",
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
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => router.push("/")}
          className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-semibold transition"
        >
          Exit Admin
        </button>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="max-w-6xl mx-auto flex border-b border-gray-200 mb-8 gap-4 bg-white p-2 rounded-xl border shadow-sm flex-wrap">
        {(["products", "orders", "carousel", "styles"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all capitalize flex items-center gap-2 ${
              tab === t
                ? "bg-black text-white shadow-sm"
                : "text-gray-600 hover:text-black hover:bg-gray-50"
            }`}
          >
            {t === "products" && "📦 Products Catalog"}
            {t === "orders" && "🛍️ Customer Orders"}
            {t === "carousel" && "🎠 Hero Carousel"}
            {t === "styles" && "🏷️ Homepage Styles"}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        {/* ══════════ PRODUCTS TAB ══════════ */}
        {tab === "products" && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
              >
                + Add Product
              </button>

              <button
                onClick={saveChanges}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
              >
                Save Changes
              </button>
            </div>

            <div className="space-y-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-6 rounded-xl shadow-sm border flex gap-6"
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
                              
                              // Upload sequentially or parallel
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
                        <option value="goggles">Goggles</option>
                        <option value="perfumes">Perfumes</option>
                      </select>
                    </div>

                    {product.category === "clothes" && (
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-gray-500 mb-1">Size Range</label>
                          <input
                            type="text"
                            placeholder="32-42"
                            className="border p-2 rounded w-44 text-sm"
                            value={product.sizeRange || ""}
                            onChange={(e) =>
                              updateField(product.id!, "sizeRange", e.target.value)
                            }
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-gray-500 mb-1">Out of Stock Sizes</label>
                          <input
                            type="text"
                            placeholder="40"
                            className="border p-2 rounded w-44 text-sm"
                            value={product.outOfStockSizes || ""}
                            onChange={(e) =>
                              updateField(product.id!, "outOfStockSizes", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 flex-wrap">
                      {(["new-arrivals", "top-selling", ...stylesList.map(s => s.slug)]).map(
                        (section) => (
                          <button
                            key={section}
                            onClick={() => toggleSection(product.id!, section)}
                            className={`px-3 py-1 rounded-full text-sm border capitalize ${
                              product.sections?.includes(section)
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-700 border-gray-300"
                            }`}
                          >
                            {section === "new-arrivals" ? "New Arrivals" : section === "top-selling" ? "Top Selling" : (stylesList.find(s => s.slug === section)?.name || section)}
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
                      className="text-red-600 text-sm font-semibold hover:underline"
                    >
                      Delete Product
                    </button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="bg-white p-6 rounded-xl border text-center text-gray-500">
                  No products in catalog yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════ ORDERS TAB ══════════ */}
        {tab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Orders</h2>
            {ordersLoading ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border text-gray-500 text-center animate-pulse">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border text-gray-500 text-center">
                No orders yet.
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const status = normalizeStatus(order.status);
                  const shipping = normalizeShipping(order.shippingDetails);
                  return (
                    <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="text-lg font-bold">Order #{order.id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-gray-600 font-medium">{order.userEmail || "No customer email"}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatOrderDate(order.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
                          <p className="font-bold text-gray-700 mb-2">Shipping Details</p>
                          <p className="font-semibold text-gray-800">{shipping.name}</p>
                          <p className="text-gray-600">{shipping.address}</p>
                          <p className="text-gray-600">{shipping.city} - {shipping.zip}</p>
                          {shipping.phone && <p className="text-gray-600 mt-1">📞 {shipping.phone}</p>}
                        </div>

                        <div className="space-y-2 border-t pt-4 text-sm">
                          <p className="font-bold text-gray-700 mb-2">Order Items</p>
                          {(order.items || []).map((item, index) => (
                            <div key={index} className="flex justify-between text-gray-800">
                              <span>{item.name || "Unnamed item"}{item.size ? ` (Size: ${item.size})` : ""} x {item.quantity ?? 0}</span>
                              <span className="font-medium">₹{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(0)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold border-t pt-2 text-base text-gray-900">
                            <span>Total Paid</span>
                            <span>₹{calculateOrderTotal(order).toFixed(0)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-80 flex flex-col justify-between gap-4 border-l md:pl-6 border-gray-100">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Status</label>
                          <div className="flex gap-2 items-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(status)}`}>
                              {status}
                            </span>
                            <select
                              value={status}
                              disabled={savingOrderId === order.id}
                              onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                              className="border rounded p-1.5 text-sm bg-white cursor-pointer font-semibold"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-100">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expected Delivery</label>
                            <input
                              type="date"
                              value={deliveryDates[order.id] ?? ""}
                              disabled={savingOrderId === order.id}
                              onChange={(e) => setDeliveryDates(prev => ({ ...prev, [order.id]: e.target.value }))}
                              className="w-full border p-2 rounded-lg text-sm bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tracking Link</label>
                            <input
                              type="text"
                              placeholder="https://track.example.com/..."
                              value={trackingLinks[order.id] ?? ""}
                              disabled={savingOrderId === order.id}
                              onChange={(e) => setTrackingLinks(prev => ({ ...prev, [order.id]: e.target.value }))}
                              className="w-full border p-2 rounded-lg text-sm bg-white"
                            />
                          </div>
                          <button
                            disabled={savingOrderId === order.id}
                            onClick={() => updateDeliveryInfo(order.id)}
                            className="w-full bg-black text-white text-xs font-bold py-2.5 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                          >
                            {savingOrderId === order.id ? "Saving..." : "Save Delivery Info"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════ CAROUSEL TAB ══════════ */}
        {tab === "carousel" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
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
              <p className="text-gray-500 animate-pulse">Loading settings...</p>
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
                            <label className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm cursor-pointer whitespace-nowrap select-none font-bold">
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
        )}

        {/* ══════════ STYLES TAB ══════════ */}
        {tab === "styles" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Homepage Styles Settings</h2>
                <p className="text-sm text-gray-500">Manage the shop style categories, upload thumbnails, and update the section title.</p>
              </div>
              <button
                onClick={saveStylesSettings}
                disabled={stylesSaving || stylesLoading}
                className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition flex-shrink-0"
              >
                {stylesSaving ? "Saving..." : "Save Styles Settings"}
              </button>
            </div>

            {stylesLoading ? (
              <p className="text-gray-500 animate-pulse">Loading settings...</p>
            ) : (
              <div className="space-y-4">
                {/* Section Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    className="w-full border p-2.5 rounded-lg"
                    placeholder="e.g. Shop by Style, Browse by Style"
                    value={stylesSectionName}
                    onChange={(e) => setStylesSectionName(e.target.value)}
                  />
                </div>

                {/* Style Cards Editor */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Style Categories</label>
                  
                  <div className="grid gap-4">
                    {stylesList.map((style, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-gray-50 relative group">
                        {/* Image Preview */}
                        <div className="w-full sm:w-32 h-20 flex-shrink-0 border rounded-lg overflow-hidden bg-gray-200 relative">
                          {style.image ? (
                            <img src={style.image} className="w-full h-full object-cover" alt={`Style ${index + 1}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                          )}
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              className="border p-1.5 rounded text-sm bg-white font-bold text-gray-800"
                              placeholder="Style Name (e.g., Casual, Formal)"
                              value={style.name}
                              onChange={(e) => {
                                const updated = [...stylesList];
                                updated[index].name = e.target.value;
                                updated[index].slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                                setStylesList(updated);
                              }}
                            />
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                className="flex-1 border p-1.5 rounded text-sm bg-white"
                                placeholder="Thumbnail Image URL"
                                value={style.image}
                                onChange={(e) => {
                                  const updated = [...stylesList];
                                  updated[index].image = e.target.value;
                                  setStylesList(updated);
                                }}
                              />
                              <label className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm cursor-pointer whitespace-nowrap select-none font-bold">
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
                                      const updated = [...stylesList];
                                      updated[index].image = url;
                                      setStylesList(updated);
                                    } catch (err: any) {
                                      alert("Upload failed: " + err.message);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          <input
                            type="text"
                            className="w-full border p-1.5 rounded text-sm bg-white"
                            placeholder="Sub-description (e.g. Everyday looks — comfort meets cool.)"
                            value={style.description || ""}
                            onChange={(e) => {
                              const updated = [...stylesList];
                              updated[index].description = e.target.value;
                              setStylesList(updated);
                            }}
                          />
                        </div>

                        {/* Ordering / Deleting Controls */}
                        <div className="flex sm:flex-col justify-between sm:justify-end gap-2 items-center sm:items-end">
                          <div className="flex gap-1">
                            <button
                              disabled={index === 0}
                              onClick={() => {
                                const updated = [...stylesList];
                                const temp = updated[index];
                                updated[index] = updated[index - 1];
                                updated[index - 1] = temp;
                                setStylesList(updated);
                              }}
                              className="p-1 border rounded bg-white text-xs disabled:opacity-30 hover:bg-gray-100 font-bold"
                            >
                              ▲
                            </button>
                            <button
                              disabled={index === stylesList.length - 1}
                              onClick={() => {
                                const updated = [...stylesList];
                                const temp = updated[index];
                                updated[index] = updated[index + 1];
                                updated[index + 1] = temp;
                                setStylesList(updated);
                              }}
                              className="p-1 border rounded bg-white text-xs disabled:opacity-30 hover:bg-gray-100 font-bold"
                            >
                              ▼
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setStylesList(stylesList.filter((_, i) => i !== index));
                            }}
                            className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {stylesList.length === 0 && (
                      <p className="text-sm text-gray-500 py-2">No styles configured. Click below to add one.</p>
                    )}

                    <button
                      onClick={() => {
                        setStylesList([...stylesList, { name: "", slug: "", image: "", description: "" }]);
                      }}
                      className="border-2 border-dashed border-gray-300 hover:border-gray-400 py-3 rounded-lg text-sm text-gray-600 font-semibold hover:bg-gray-50 transition"
                    >
                      + Add Style Slot
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddProductSave} 
        availableSections={stylesList.map(s => s.slug)}
      />
    </main>
  );
}
