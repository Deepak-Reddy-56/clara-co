"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  isDefault: boolean;
};

export default function MobileAccountPage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Section-level toggles
  const [showOrders, setShowOrders] = useState(false);

  // Per-order accordion
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Back to top
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Address form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postal: "",
    country: "India",
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* 🔒 Redirect */
  useEffect(() => {
    if (!loading && !user) router.push("/m/login");
  }, [user, loading]);

  /* 📦 Orders */
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchOrders();
  }, [user]);

  /* 🏠 Addresses */
  useEffect(() => {
    if (!user) return;
    const fetchAddresses = async () => {
      const q = query(collection(db, "addresses"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      setAddresses(
        snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Address, "id">) }))
      );
    };
    fetchAddresses();
  }, [user]);

  /* 🔼 Back to top */
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 350);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!user) return null;

  return (
    <div style={{ padding: "16px", color: "#111" }}>

      {/* USER CARD */}
      <div style={userCard}>
        <h3>{user.displayName}</h3>
        <p style={{ color: "#666" }}>{user.email}</p>
      </div>

      {/* ── ORDERS — section dropdown ── */}
      <button
        onClick={() => setShowOrders((v) => !v)}
        style={sectionToggleBtn}
      >
        <h3 style={{ fontWeight: 600, fontSize: "16px", margin: 0 }}>Your Orders</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#888" }}>
          {orders.length > 0 && (
            <span style={{ fontSize: "12px" }}>
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          )}
          <span style={{
            fontSize: "10px",
            display: "inline-block",
            transform: showOrders ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>▼</span>
        </div>
      </button>

      {showOrders && (
        <div style={{ marginBottom: "8px" }}>
          {orders.length === 0 ? (
            <p style={{ color: "#666", fontSize: "14px" }}>No orders yet</p>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedIds.has(order.id);
              const date = order.createdAt?.seconds
                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                : "—";
              const total =
                order.total ??
                order.items?.reduce(
                  (s: number, i: any) => s + (i.price ?? 0) * (i.quantity ?? 0),
                  0
                ) ??
                0;

              return (
                <div key={order.id} style={{ ...cardBase, padding: 0, overflow: "hidden" }}>

                  {/* Per-order summary row */}
                  <button onClick={() => toggleExpand(order.id)} style={summaryBtn}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>
                        #{order.id.slice(-6)}
                      </p>
                      <p style={{ fontSize: "11px", color: "#999", margin: "2px 0 0" }}>{date}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={getStatusStyle(order.status || "PENDING")}>
                        {order.status || "PENDING"}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>₹{total}</span>
                      <span style={{
                        fontSize: "10px", color: "#aaa", display: "inline-block",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}>▼</span>
                    </div>
                  </button>

                  {/* Per-order expanded body */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa", padding: "12px 14px" }}>
                      {(order.items || []).map((item: any, i: number) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#444", marginBottom: "4px" }}>
                          <span>{item.name} × {item.quantity}</span>
                          <span>₹{((item.price ?? 0) * (item.quantity ?? 0))}</span>
                        </div>
                      ))}

                      <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #ececec" }}>
                        <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px" }}>
                          Expected Delivery:{" "}
                          <span style={{ fontWeight: 600, color: "#333" }}>
                            {order.expectedDelivery || "—"}
                          </span>
                        </p>
                        {order.trackingLink && (
                          <a
                            href={order.trackingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: "13px", color: "#2563eb", fontWeight: 600, textDecoration: "none" }}
                          >
                            Track Order →
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => router.push(`/m/order/${order.id}`)}
                        style={viewDetailsBtn}
                      >
                        View Full Details →
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── ADDRESSES ── */}
      <h3 style={sectionTitle}>Your Addresses</h3>

      <button
        onClick={() => { setShowForm(true); setEditingId(null); }}
        style={btnOutline}
      >
        + Add Address
      </button>

      {showForm && (
        <div style={cardBase}>
          {["fullName", "phone", "street", "city", "state", "postal"].map((f) => (
            <input
              key={f}
              placeholder={f}
              value={(form as any)[f]}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              style={input}
            />
          ))}

          <button
            style={btn}
            onClick={async () => {
              if (!user) return;

              if (editingId) {
                await updateDoc(doc(db, "addresses", editingId), form);
                setAddresses((prev) =>
                  prev.map((a) => (a.id === editingId ? { ...a, ...form } : a))
                );
              } else {
                const docRef = await addDoc(collection(db, "addresses"), {
                  ...form,
                  userId: user.uid,
                  isDefault: addresses.length === 0,
                });
                setAddresses((prev) => [
                  ...prev,
                  { id: docRef.id, ...form, isDefault: addresses.length === 0 },
                ]);
              }

              setShowForm(false);
              setEditingId(null);
              setForm({ fullName: "", phone: "", street: "", city: "", state: "", postal: "", country: "India" });
            }}
          >
            {editingId ? "Update Address" : "Save Address"}
          </button>
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} style={cardBase}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b>{addr.fullName}</b>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {addr.isDefault && <span style={defaultTag}>Default</span>}

              {!addr.isDefault && (
                <button
                  onClick={async () => {
                    await Promise.all(
                      addresses.map((a) =>
                        updateDoc(doc(db, "addresses", a.id), { isDefault: a.id === addr.id })
                      )
                    );
                    setAddresses((prev) =>
                      prev.map((a) => ({ ...a, isDefault: a.id === addr.id }))
                    );
                  }}
                  style={setDefaultBtn}
                >
                  Set Default
                </button>
              )}

              <button
                onClick={() => { setShowForm(true); setEditingId(addr.id); setForm({ ...addr }); }}
                style={editBtn}
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  await deleteDoc(doc(db, "addresses", addr.id));
                  setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
                }}
                style={deleteBtn}
              >
                Delete
              </button>
            </div>
          </div>

          <p>{addr.street}, {addr.city}</p>
          <p>{addr.state} - {addr.postal}</p>
          <p>📞 {addr.phone}</p>
        </div>
      ))}

      {/* LOGOUT */}
      <button onClick={logout} style={btn}>Logout</button>

      {/* ── Floating Back to Top ── */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "20px",
            zIndex: 50,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "#111",
            color: "white",
            border: "none",
            fontSize: "20px",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            cursor: "pointer",
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
}

/* ── Styles ── */

const cardBase: React.CSSProperties = {
  marginBottom: "10px",
  borderRadius: "12px",
  border: "1px solid #eee",
  padding: "14px 16px",
};

const sectionToggleBtn: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "0",
  marginTop: "20px",
  marginBottom: "10px",
};

const summaryBtn: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 14px",
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
};

const viewDetailsBtn: React.CSSProperties = {
  marginTop: "12px",
  width: "100%",
  padding: "9px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  background: "white",
  fontSize: "13px",
  cursor: "pointer",
  fontWeight: 500,
};

const userCard: React.CSSProperties = {
  marginBottom: "20px",
  padding: "16px",
  borderRadius: "12px",
  background: "#f5f5f5",
};

const btn: React.CSSProperties = {
  marginTop: "10px",
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  background: "black",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const btnOutline: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px dashed #ccc",
  borderRadius: "10px",
  marginBottom: "10px",
  background: "none",
  cursor: "pointer",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginBottom: "8px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  boxSizing: "border-box",
};

const actionBtn: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  padding: "3px 10px",
  borderRadius: "999px",
  cursor: "pointer",
  border: "1.5px solid currentColor",
  background: "none",
  lineHeight: 1.5,
};

const editBtn: React.CSSProperties = {
  ...actionBtn,
  color: "#111",
  borderColor: "#bbb",
};

const deleteBtn: React.CSSProperties = {
  ...actionBtn,
  color: "#dc2626",
  borderColor: "#fca5a5",
  background: "#fff1f1",
};

const setDefaultBtn: React.CSSProperties = {
  ...actionBtn,
  color: "#15803d",
  borderColor: "#86efac",
  background: "#f0fdf4",
};

const defaultTag: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  padding: "3px 10px",
  borderRadius: "999px",
  background: "#15803d",
  color: "white",
  lineHeight: 1.5,
};

const sectionTitle: React.CSSProperties = {
  marginTop: "20px",
  marginBottom: "10px",
  fontWeight: 600,
};

function getStatusStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "999px",
  };
  switch (status) {
    case "PAID":      return { ...base, background: "#dbeafe", color: "#1d4ed8" };
    case "SHIPPED":   return { ...base, background: "#ede9fe", color: "#6d28d9" };
    case "DELIVERED": return { ...base, background: "#dcfce7", color: "#15803d" };
    default:          return { ...base, background: "#fef9c3", color: "#a16207" };
  }
}