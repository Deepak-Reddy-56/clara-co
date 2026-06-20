"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, getDoc, setDoc, serverTimestamp, orderBy, query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChevronDown, ChevronUp, Plus, Save, Trash2, Package, ShoppingBag, LogOut, Sliders } from "lucide-react";
import AddProductModal from "@/components/AddProductModal";
import { authFetch } from "@/lib/authClient";

// ── Types ──────────────────────────────────────────────────

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

type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED";
type OrderItem = { name?: string; price?: number; quantity?: number };
type ShippingDetails = {
  name?: string; address?: string; city?: string; zip?: string;
  fullName?: string; street?: string; postal?: string; phone?: string;
};
type FirestoreTs = { seconds?: number; toDate?: () => Date };
type Order = {
  id: string;
  userEmail?: string;
  items?: OrderItem[];
  total?: number;
  status?: string;
  expectedDelivery?: string;
  trackingLink?: string;
  createdAt?: FirestoreTs;
  shippingDetails?: ShippingDetails;
};

// ── Helpers ────────────────────────────────────────────────

const SECTIONS = ["new-arrivals", "top-selling", "casual", "formal", "party", "gym"];
const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

function statusColor(s?: string) {
  switch (s) {
    case "PAID":      return { bg: "#dbeafe", color: "#1d4ed8" };
    case "SHIPPED":   return { bg: "#ede9fe", color: "#7c3aed" };
    case "DELIVERED": return { bg: "#dcfce7", color: "#16a34a" };
    default:          return { bg: "#fef9c3", color: "#a16207" };
  }
}

function formatDate(ts?: FirestoreTs) {
  if (ts?.toDate) return ts.toDate().toLocaleDateString();
  if (ts?.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
  return "—";
}

function calcTotal(order: Order) {
  if (typeof order.total === "number") return order.total;
  return (order.items || []).reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 0), 0);
}

function normalizeShipping(d?: ShippingDetails) {
  return {
    name: d?.fullName || d?.name || "—",
    address: d?.street || d?.address || "—",
    city: d?.city || "—",
    zip: d?.postal || d?.zip || "—",
    phone: d?.phone || "",
  };
}

// ── Styles ─────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "white",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  marginBottom: "12px",
  overflow: "hidden",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
};

const inputSt: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "13px",
  outline: "none",
  background: "#f8fafc",
  color: "#0f172a", // explicit dark contrast text
  boxSizing: "border-box",
};

const pill = (active: boolean): React.CSSProperties => ({
  padding: "6px 14px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
  border: active ? "1px solid #0f172a" : "1px solid #cbd5e1",
  background: active ? "#0f172a" : "#ffffff",
  color: active ? "#ffffff" : "#475569",
  transition: "all 0.15s ease",
});

const btn = (color = "#0f172a"): React.CSSProperties => ({
  padding: "10px 18px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 700,
  background: color,
  color: "white",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
});

// ── Main component ─────────────────────────────────────────

export default function MobileAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<"products" | "orders" | "carousel">("products");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 🎠 Carousel States
  const [carouselSectionName, setCarouselSectionName] = useState("");
  const [carouselImages, setCarouselImages] = useState<{ url: string; link: string }[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [carouselSaving, setCarouselSaving] = useState(false);
  const [uploadingCarouselIndex, setUploadingCarouselIndex] = useState<number | null>(null);

  // Load carousel settings
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

  const saveCarouselSettings = async () => {
    setCarouselSaving(true);
    try {
      const docRef = doc(db, "settings", "carousel");
      await setDoc(docRef, {
        sectionName: carouselSectionName,
        images: carouselImages.filter(img => img.url.trim() !== ""),
      });
      alert("Carousel settings saved successfully!");
    } catch (err: any) {
      alert("Error saving carousel settings: " + err.message);
    } finally {
      setCarouselSaving(false);
    }
  };

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [deliveryDates, setDeliveryDates] = useState<Record<string, string>>({});
  const [trackingLinks, setTrackingLinks] = useState<Record<string, string>>({});

  // ── Auth guard (server-side) ──────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/m/login"); return; }
    authFetch("/api/check-admin")
      .then((res) => res.json())
      .then((data) => {
        if (!data.isAdmin) {
          router.push("/m/shop");
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => router.push("/m/shop"));
  }, [user, loading, router]);

  // ── Load products ───────────────────────────────────────
  useEffect(() => {
    if (!authorized) return;
    getDocs(collection(db, "products")).then((snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) })));
    });
  }, [authorized]);

  // ── Load orders ─────────────────────────────────────────
  useEffect(() => {
    if (!authorized || tab !== "orders") return;
    setOrdersLoading(true);
    getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))).then((snap) => {
      const data: Order[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }));
      setOrders(data);
      const dates: Record<string, string> = {};
      const links: Record<string, string> = {};
      data.forEach((o) => {
        if (o.expectedDelivery) dates[o.id] = o.expectedDelivery;
        if (o.trackingLink) links[o.id] = o.trackingLink;
      });
      setDeliveryDates(dates);
      setTrackingLinks(links);
    }).finally(() => setOrdersLoading(false));
  }, [authorized, tab]);

  // ── Product helpers ─────────────────────────────────────
  const updateField = (id: string, field: keyof Product, value: any) =>
    setProducts((p) => p.map((x) => {
      if (x.id !== id) return x;
      const next = { ...x, [field]: value };
      if (field === "images" && Array.isArray(value)) {
        next.image = value.length > 0 ? value[0] : "";
      }
      return next;
    }));

  const toggleSection = (id: string, section: string) =>
    setProducts((p) => p.map((x) => {
      if (x.id !== id) return x;
      const s = x.sections || [];
      return { ...x, sections: s.includes(section) ? s.filter((v) => v !== section) : [...s, section] };
    }));

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

  const handleAddProductSave = async (data: any) => {
    setSaving(true);
    try {
      const newUrls = [];
      for (const f of data.brandNewFiles || []) {
        const url = await uploadToCloudinary(f);
        newUrls.push(url);
      }
      
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

      const ref = await addDoc(collection(db, "products"), newProduct);
      const newP = { id: ref.id, ...newProduct } as Product;
      setProducts((p) => [newP, ...p]);
      setExpandedProduct(ref.id);
    } catch (err: any) {
      alert("Error adding product: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  const saveAll = async () => {
    setSaving(true);
    await Promise.all(products.map((p) => {
      if (!p.id) return;
      const { id, ...data } = p;
      return updateDoc(doc(db, "products", id), data);
    }));
    setSaving(false);
    alert("All changes saved!");
  };

  const uploadImage = async (id: string, file: File) => {
    setUploading(id);
    try {
      const secureUrl = await uploadToCloudinary(file);
      updateField(id, "image", secureUrl);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  // ── Order helpers ───────────────────────────────────────
  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setSavingOrderId(orderId);
    await updateDoc(doc(db, "orders", orderId), { status });
    setOrders((o) => o.map((x) => x.id === orderId ? { ...x, status } : x));
    setSavingOrderId(null);
  };

  const saveDelivery = async (orderId: string) => {
    setSavingOrderId(orderId);
    await updateDoc(doc(db, "orders", orderId), {
      expectedDelivery: deliveryDates[orderId] ?? "",
      trackingLink: trackingLinks[orderId] ?? "",
    });
    setSavingOrderId(null);
    alert("Delivery info saved!");
  };

  if (!authorized) return null;

  return (
    <div className="mobile-shop" style={{ paddingBottom: "100px" }}>

      {/* ── Header ── */}
      <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#111" }}>Admin Panel</h1>
          <p style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{user?.email}</p>
        </div>
        <button onClick={() => router.push("/m/account")} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "999px", padding: "6px 12px", fontSize: "12px", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
          <LogOut size={13} /> Exit
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", padding: "0 16px", gap: "12px", borderBottom: "1px solid #e2e8f0", background: "white" }}>
        {(["products", "orders", "carousel"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "12px 4px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              background: "none",
              border: "none",
              color: tab === t ? "#0f172a" : "#64748b",
              borderBottom: tab === t ? "2px solid #0f172a" : "2px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textTransform: "capitalize",
              transition: "all 0.15s ease",
            }}
          >
            {t === "products" ? <Package size={14} /> : t === "orders" ? <ShoppingBag size={14} /> : <Sliders size={14} />}
            {t === "products" ? "Products" : t === "orders" ? "Orders" : "Carousel"}
          </button>
        ))}
      </div>

      {/* ══════════ PRODUCTS TAB ══════════ */}
      {tab === "products" && (
        <div style={{ padding: "16px" }}>
          {/* Action buttons */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            <button onClick={() => setIsAddModalOpen(true)} style={btn("#111")}>
              <Plus size={14} /> Add Product
            </button>
            <button onClick={saveAll} disabled={saving} style={btn("#16a34a")}>
              <Save size={14} /> {saving ? "Saving..." : "Save All"}
            </button>
          </div>

          {/* Product cards */}
          {products.map((product) => {
            const isExpanded = expandedProduct === product.id;
            return (
              <div key={product.id} style={card}>
                {/* Card header - always visible */}
                <button
                  onClick={() => setExpandedProduct(isExpanded ? null : product.id!)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "8px", flexShrink: 0,
                    backgroundImage: `url(${product.image || "https://via.placeholder.com/48"})`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    backgroundColor: "#f3f3f3",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "14px", color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                      ₹{product.price} · {product.inStock ? "In Stock" : "Out of Stock"}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={16} color="#aaa" /> : <ChevronDown size={16} color="#aaa" />}
                </button>

                {/* Expanded edit fields */}
                {isExpanded && (
                  <div style={{ padding: "0 12px 16px", borderTop: "1px solid #f5f5f5", display: "flex", flexDirection: "column", gap: "10px" }}>

                    {/* Name */}
                    <div>
                      <label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "4px" }}>Product Name</label>
                      <input style={inputSt} value={product.name} onChange={(e) => updateField(product.id!, "name", e.target.value)} />
                    </div>

                    {/* Price & Discount */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "4px" }}>Price (₹)</label>
                        <input style={inputSt} type="number" value={product.price}
                          onChange={(e) => updateField(product.id!, "price", Number(e.target.value))} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "4px" }}>Discount (%)</label>
                        <input style={inputSt} type="number" value={product.discount ?? 0}
                          onChange={(e) => updateField(product.id!, "discount", Number(e.target.value))} />
                      </div>
                    </div>

                    {/* Image upload */}
                    <div>
                      <label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "4px" }}>Images</label>
                      
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                        {(product.images || (product.image ? [product.image] : [])).map((img, i) => (
                          <div key={i} style={{ position: "relative" }}>
                            <div style={{
                              width: "48px", height: "48px", borderRadius: "8px",
                              backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundColor: "#eee"
                            }} />
                            <button
                              onClick={() => {
                                const list = [...(product.images || (product.image ? [product.image] : []))];
                                list.splice(i, 1);
                                updateField(product.id!, "images", list);
                              }}
                              style={{
                                position: "absolute", top: "-4px", right: "-4px",
                                background: "#dc2626", color: "white", width: "18px", height: "18px",
                                borderRadius: "50%", border: "none", fontSize: "10px", display: "flex",
                                alignItems: "center", justifyContent: "center"
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <input
                        type="file" accept="image/*" multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          
                          setUploading(product.id!);
                          try {
                            const newUrls = [];
                            for (const f of files) {
                              const url = await uploadToCloudinary(f);
                              newUrls.push(url);
                            }
                            const current = product.images || (product.image ? [product.image] : []);
                            updateField(product.id!, "images", [...current, ...newUrls]);
                          } catch (err: any) {
                            alert("Upload failed: " + err.message);
                          } finally {
                            setUploading(null);
                          }
                        }}
                        style={{ fontSize: "12px", marginBottom: "6px" }}
                      />
                      {uploading === product.id && <p style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>Uploading...</p>}
                    </div>

                    {/* Category */}
                    <div>
                      <label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "4px" }}>Category</label>
                      <select style={{ ...inputSt }} value={product.category}
                        onChange={(e) => updateField(product.id!, "category", e.target.value)}>
                        <option value="clothes">Clothes</option>
                        <option value="footwear">Footwear</option>
                        <option value="phones">Phones</option>
                      </select>
                    </div>

                    {/* Sections */}
                    <div>
                      <label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "8px" }}>Sections</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {SECTIONS.map((s) => (
                          <button key={s} onClick={() => toggleSection(product.id!, s)} style={pill(product.sections?.includes(s))}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* In Stock toggle */}
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <div
                        onClick={() => updateField(product.id!, "inStock", !product.inStock)}
                        style={{
                          width: "42px", height: "24px", borderRadius: "999px",
                          background: product.inStock ? "#16a34a" : "#d1d5db",
                          position: "relative", transition: "background 0.2s", flexShrink: 0,
                        }}
                      >
                        <div style={{
                          position: "absolute", top: "3px",
                          left: product.inStock ? "21px" : "3px",
                          width: "18px", height: "18px", borderRadius: "50%",
                          background: "white", transition: "left 0.2s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }} />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </label>

                    {/* Delete */}
                    <button
                      onClick={() => deleteProduct(product.id!)}
                      style={{ ...btn("#dc2626"), alignSelf: "flex-start", marginTop: "4px" }}
                    >
                      <Trash2 size={13} /> Delete Product
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {products.length === 0 && (
            <p style={{ textAlign: "center", color: "#aaa", fontSize: "13px", padding: "40px" }}>
              No products yet. Tap "Add Product" to start.
            </p>
          )}
        </div>
      )}

      {/* ══════════ ORDERS TAB ══════════ */}
      {tab === "orders" && (
        <div style={{ padding: "16px" }}>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} total
          </p>

          {ordersLoading ? (
            <p style={{ textAlign: "center", color: "#aaa", fontSize: "13px", padding: "40px" }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p style={{ textAlign: "center", color: "#aaa", fontSize: "13px", padding: "40px" }}>No orders yet.</p>
          ) : orders.map((order) => {
            const sc = statusColor(order.status);
            const shipping = normalizeShipping(order.shippingDetails);
            const isExpanded = expandedOrder === order.id;
            const total = calcTotal(order);

            return (
              <div key={order.id} style={card}>
                {/* Order header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "10px",
                    padding: "14px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 700, fontSize: "13px", color: "#111" }}>
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px",
                        background: sc.bg, color: sc.color,
                      }}>
                        {order.status || "PENDING"}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#888" }}>{order.userEmail || "No email"}</p>
                    <p style={{ fontSize: "12px", color: "#888" }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 700, fontSize: "14px", color: "#111" }}>₹{total.toFixed(0)}</p>
                    {isExpanded ? <ChevronUp size={16} color="#aaa" /> : <ChevronDown size={16} color="#aaa" />}
                  </div>
                </button>

                {/* Expanded order details */}
                {isExpanded && (
                  <div style={{ padding: "0 14px 16px", borderTop: "1px solid #f5f5f5", display: "flex", flexDirection: "column", gap: "12px" }}>

                    {/* Status change */}
                    <div>
                      <label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "6px" }}>Update Status</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {STATUS_OPTIONS.map((s) => {
                          const sc2 = statusColor(s);
                          const isActive = (order.status || "PENDING") === s;
                          return (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              disabled={savingOrderId === order.id}
                              style={{
                                padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
                                border: isActive ? `2px solid ${sc2.color}` : "2px solid #e5e7eb",
                                background: isActive ? sc2.bg : "white", color: isActive ? sc2.color : "#555",
                                cursor: "pointer",
                              }}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping address */}
                    <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "10px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#888", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Shipping</p>
                      <p style={{ fontSize: "13px", color: "#111", fontWeight: 600 }}>{shipping.name}</p>
                      <p style={{ fontSize: "12px", color: "#555" }}>{shipping.address}</p>
                      <p style={{ fontSize: "12px", color: "#555" }}>{shipping.city} - {shipping.zip}</p>
                      {shipping.phone && <p style={{ fontSize: "12px", color: "#555" }}>📞 {shipping.phone}</p>}
                    </div>

                    {/* Items */}
                    <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "10px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#888", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Items</p>
                      {(order.items || []).map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "13px", color: "#111" }}>{item.name} × {item.quantity}</span>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>
                            ₹{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(0)}
                          </span>
                        </div>
                      ))}
                      <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700 }}>Total</span>
                        <span style={{ fontSize: "13px", fontWeight: 700 }}>₹{total.toFixed(0)}</span>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div>
                      <label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "6px" }}>Expected Delivery</label>
                      <input
                        type="date" style={inputSt}
                        value={deliveryDates[order.id] ?? ""}
                        onChange={(e) => setDeliveryDates((prev) => ({ ...prev, [order.id]: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "6px" }}>Tracking Link</label>
                      <input
                        type="text" style={inputSt} placeholder="https://track.example.com/..."
                        value={trackingLinks[order.id] ?? ""}
                        onChange={(e) => setTrackingLinks((prev) => ({ ...prev, [order.id]: e.target.value }))}
                      />
                    </div>

                    <button
                      onClick={() => saveDelivery(order.id)}
                      disabled={savingOrderId === order.id}
                      style={btn(savingOrderId === order.id ? "#9ca3af" : "black")}
                    >
                      <Save size={13} /> {savingOrderId === order.id ? "Saving..." : "Save Delivery Info"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ CAROUSEL TAB ══════════ */}
      {tab === "carousel" && (
        <div style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>Homepage Carousel</h2>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0" }}>Update home promo slider</p>
            </div>
            <button
              onClick={saveCarouselSettings}
              disabled={carouselSaving || carouselLoading}
              style={btn(carouselSaving ? "#64748b" : "#0f172a")}
            >
              <Save size={14} /> {carouselSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>

          {carouselLoading ? (
            <p style={{ textAlign: "center", color: "#64748b", fontSize: "13px", padding: "40px" }}>Loading settings...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Section Name Card */}
              <div style={card}>
                <div style={{ padding: "16px" }}>
                  <label style={{ fontSize: "11px", color: "#334155", fontWeight: 700, display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Section Title
                  </label>
                  <input
                    style={inputSt}
                    placeholder="e.g., Exclusive Drops"
                    value={carouselSectionName}
                    onChange={(e) => setCarouselSectionName(e.target.value)}
                  />
                </div>
              </div>

              {/* Banners Manager */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Banner Images ({carouselImages.length}/5)
                </p>

                {carouselImages.map((image, index) => (
                  <div key={index} style={{ ...card, padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    
                    {/* Header Slot Info */}
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      {/* Image Preview */}
                      <div
                        style={{
                          width: "70px",
                          height: "50px",
                          borderRadius: "10px",
                          backgroundImage: `url(${image.url || "https://via.placeholder.com/70"})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundColor: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Banner Slot #{index + 1}</p>
                        <p style={{ fontSize: "11px", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", margin: "2px 0 0 0" }}>
                          {image.url || "No image uploaded yet"}
                        </p>
                      </div>
                    </div>

                    {/* Image URL Input & File Upload */}
                    <div>
                      <label style={{ fontSize: "10px", color: "#475569", fontWeight: 700, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Image Source
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          style={{ ...inputSt, flex: 1 }}
                          placeholder="Image URL"
                          value={image.url}
                          onChange={(e) => {
                            const updated = [...carouselImages];
                            updated[index].url = e.target.value;
                            setCarouselImages(updated);
                          }}
                        />
                        <label style={{
                          padding: "10px 14px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px",
                          fontSize: "12px", fontWeight: 700, color: "#334155", cursor: "pointer", display: "inline-flex",
                          alignItems: "center", justifyContent: "center", userSelect: "none"
                        }}>
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingCarouselIndex(index);
                              try {
                                const url = await uploadToCloudinary(file);
                                const updated = [...carouselImages];
                                updated[index].url = url;
                                setCarouselImages(updated);
                              } catch (err: any) {
                                alert("Upload failed: " + err.message);
                              } finally {
                                setUploadingCarouselIndex(null);
                              }
                            }}
                          />
                        </label>
                      </div>
                      {uploadingCarouselIndex === index && (
                        <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", margin: 0 }}>Uploading to Cloudinary...</p>
                      )}
                    </div>

                    {/* Redirect link */}
                    <div>
                      <label style={{ fontSize: "10px", color: "#475569", fontWeight: 700, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Redirect Link
                      </label>
                      <input
                        style={inputSt}
                        placeholder="e.g., /m/styles/casual"
                        value={image.link}
                        onChange={(e) => {
                          const updated = [...carouselImages];
                          updated[index].link = e.target.value;
                          setCarouselImages(updated);
                        }}
                      />
                    </div>

                    {/* Management controls */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          disabled={index === 0}
                          onClick={() => {
                            const updated = [...carouselImages];
                            const temp = updated[index];
                            updated[index] = updated[index - 1];
                            updated[index - 1] = temp;
                            setCarouselImages(updated);
                          }}
                          style={{
                            padding: "6px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px",
                            fontSize: "11px", fontWeight: 700, color: "#475569", cursor: "pointer", opacity: index === 0 ? 0.35 : 1
                          }}
                        >
                          ▲ Up
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
                          style={{
                            padding: "6px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px",
                            fontSize: "11px", fontWeight: 700, color: "#475569", cursor: "pointer", opacity: index === carouselImages.length - 1 ? 0.35 : 1
                          }}
                        >
                          ▼ Down
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setCarouselImages(carouselImages.filter((_, i) => i !== index));
                        }}
                        style={{
                          padding: "6px 12px", background: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5",
                          borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {carouselImages.length === 0 && (
                  <p style={{ textAlign: "center", fontSize: "13px", color: "#64748b", padding: "16px", margin: 0 }}>No banners added yet.</p>
                )}

                {carouselImages.length < 5 && (
                  <button
                    onClick={() => setCarouselImages([...carouselImages, { url: "", link: "" }])}
                    style={{
                      padding: "14px", border: "1px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc",
                      fontSize: "13px", fontWeight: 700, color: "#475569", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.15s ease"
                    }}
                  >
                    + Add Banner Slot (Max 5)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <AddProductModal 

        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddProductSave} 
      />
    </div>
  );
}
