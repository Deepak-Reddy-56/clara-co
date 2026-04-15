"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
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

  /* 🔒 Redirect */
  useEffect(() => {
    if (!loading && !user) {
      router.push("/m/login");
    }
  }, [user, loading]);

  /* 📦 Orders */
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    fetchOrders();
  }, [user]);

  /* 📦 Addresses */
  useEffect(() => {
    if (!user) return;

    const fetchAddresses = async () => {
      const q = query(
        collection(db, "addresses"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const data: Address[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Address, "id">),
      }));

      setAddresses(data);
    };

    fetchAddresses();
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ padding: "16px", color: "#111" }}>
      {/* USER */}
      <div style={userCard}>
        <h3>{user.displayName}</h3>
        <p style={{ color: "#666" }}>{user.email}</p>
      </div>

      {/* ORDERS */}
      <h3 style={sectionTitle}>Your Orders</h3>

      {orders.length === 0 ? (
        <p style={{ color: "#666" }}>No orders yet</p>
      ) : (
       orders.map((order) => (
  <div
    key={order.id}
    onClick={() => router.push(`/m/order/${order.id}`)}
    style={{
      ...card,
      cursor: "pointer",
    }}
  >
            <p style={small}>Order ID: {order.id}</p>

            {order.items?.map((item: any, i: number) => (
              <div key={i}>
                {item.name} × {item.quantity}
              </div>
            ))}
          </div>
        ))
      )}

      {/* 🔥 ADDRESSES */}
      <h3 style={sectionTitle}>Your Addresses</h3>

      <button
        onClick={() => {
          setShowForm(true);
          setEditingId(null);
        }}
        style={btnOutline}
      >
        + Add Address
      </button>

      {showForm && (
        <div style={card}>
          {["fullName","phone","street","city","state","postal"].map((f) => (
            <input
              key={f}
              placeholder={f}
              value={(form as any)[f]}
              onChange={(e) =>
                setForm({ ...form, [f]: e.target.value })
              }
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
                  prev.map((a) =>
                    a.id === editingId ? { ...a, ...form } : a
                  )
                );
              } else {
                const docRef = await addDoc(collection(db, "addresses"), {
                  ...form,
                  userId: user.uid,
                  isDefault: addresses.length === 0,
                });

                const saved: Address = {
                  id: docRef.id,
                  ...form,
                  isDefault: addresses.length === 0,
                };

                setAddresses((prev) => [...prev, saved]);
              }

              setShowForm(false);
              setEditingId(null);
              setForm({
                fullName: "",
                phone: "",
                street: "",
                city: "",
                state: "",
                postal: "",
                country: "India",
              });
            }}
          >
            {editingId ? "Update Address" : "Save Address"}
          </button>
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <b>{addr.fullName}</b>

            <div style={{ display: "flex", gap: "8px" }}>
              {addr.isDefault && <span style={defaultTag}>Default</span>}

              {!addr.isDefault && (
                <button
                  onClick={async () => {
                    await Promise.all(
                      addresses.map((a) =>
                        updateDoc(doc(db, "addresses", a.id), {
                          isDefault: a.id === addr.id,
                        })
                      )
                    );

                    setAddresses((prev) =>
                      prev.map((a) => ({
                        ...a,
                        isDefault: a.id === addr.id,
                      }))
                    );
                  }}
                  style={actionBtn}
                >
                  Default
                </button>
              )}

              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(addr.id);
                  setForm({ ...addr });
                }}
                style={actionBtn}
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  await deleteDoc(doc(db, "addresses", addr.id));

                  setAddresses((prev) =>
                    prev.filter((a) => a.id !== addr.id)
                  );
                }}
                style={{ ...actionBtn, color: "red" }}
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
      <button onClick={logout} style={btn}>
        Logout
      </button>
    </div>
  );
}

/* styles */
const card = {
  marginBottom: "12px",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #eee",
};

const userCard = {
  marginBottom: "20px",
  padding: "16px",
  borderRadius: "12px",
  background: "#f5f5f5",
};

const btn = {
  marginTop: "10px",
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  background: "black",
  color: "white",
};

const btnOutline = {
  width: "100%",
  padding: "12px",
  border: "1px dashed #ccc",
  borderRadius: "10px",
  marginBottom: "10px",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "8px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const actionBtn = {
  fontSize: "12px",
  border: "none",
  background: "none",
  color: "#007bff",
  cursor: "pointer",
};

const defaultTag = {
  fontSize: "12px",
  color: "green",
};

const sectionTitle = {
  marginTop: "20px",
  marginBottom: "10px",
  fontWeight: 600,
};

const small = { fontSize: "12px", color: "#888" };