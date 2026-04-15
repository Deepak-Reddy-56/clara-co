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
} from "firebase/firestore";
import { useRouter } from "next/navigation";

/* 🔥 ADDRESS TYPE */
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

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<Address | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postal: "",
    country: "India",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/m/login");
    }
  }, [user, loading, router]);

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

      const def = data.find((a) => a.isDefault);
      if (def) setSelected(def);
    };

    fetchAddresses();
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ padding: "16px", color: "#111" }}>
      <h2 style={{ marginBottom: "12px", fontWeight: 600 }}>
        Select Address
      </h2>

      {/* ➕ ADD NEW ADDRESS */}
      <button
        onClick={() => {
          setShowForm(true);
          setEditingId(null);
        }}
        style={btnOutline}
      >
        + Add New Address
      </button>

      {/* FORM */}
      {showForm && (
        <div style={formCard}>
          <input
            placeholder="Full Name"
            value={newAddress.fullName}
            onChange={(e) =>
              setNewAddress({ ...newAddress, fullName: e.target.value })
            }
            style={input}
          />

          <input
            placeholder="Phone"
            value={newAddress.phone}
            onChange={(e) =>
              setNewAddress({ ...newAddress, phone: e.target.value })
            }
            style={input}
          />

          <input
            placeholder="Street Address"
            value={newAddress.street}
            onChange={(e) =>
              setNewAddress({ ...newAddress, street: e.target.value })
            }
            style={input}
          />

          <input
            placeholder="City"
            value={newAddress.city}
            onChange={(e) =>
              setNewAddress({ ...newAddress, city: e.target.value })
            }
            style={input}
          />

          <input
            placeholder="State"
            value={newAddress.state}
            onChange={(e) =>
              setNewAddress({ ...newAddress, state: e.target.value })
            }
            style={input}
          />

          <input
            placeholder="Postal Code"
            value={newAddress.postal}
            onChange={(e) =>
              setNewAddress({ ...newAddress, postal: e.target.value })
            }
            style={input}
          />

          <button
            style={btn}
            onClick={async () => {
              if (!user) return;

              if (editingId) {
                await updateDoc(doc(db, "addresses", editingId), {
                  ...newAddress,
                });

                setAddresses((prev) =>
                  prev.map((a) =>
                    a.id === editingId ? { ...a, ...newAddress } : a
                  )
                );
              } else {
                const docRef = await addDoc(collection(db, "addresses"), {
                  ...newAddress,
                  userId: user.uid,
                  isDefault: addresses.length === 0,
                });

                const saved: Address = {
                  id: docRef.id,
                  ...newAddress,
                  isDefault: addresses.length === 0,
                };

                setAddresses((prev) => [...prev, saved]);
                setSelected(saved);
              }

              setShowForm(false);
              setEditingId(null);

              setNewAddress({
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

      {/* ADDRESS LIST */}
      {addresses.map((addr) => (
        <div
          key={addr.id}
          onClick={() => setSelected(addr)}
          style={{
            ...card,
            border:
              selected?.id === addr.id
                ? "2px solid black"
                : "1px solid #e5e5e5",
          }}
        >
          <div style={row}>
            <p style={{ fontWeight: 600 }}>{addr.fullName}</p>

            <div style={actions}>
              {addr.isDefault && <span style={defaultTag}>Default</span>}

              {/* ✅ EDIT ONLY */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowForm(true);
                  setEditingId(addr.id);
                  setNewAddress({ ...addr });
                }}
                style={actionBtn}
              >
                Edit
              </button>
            </div>
          </div>

          <p style={text}>{addr.street}, {addr.city}</p>
          <p style={text}>{addr.state} - {addr.postal}</p>
          <p style={text}>{addr.country}</p>
          <p style={text}>📞 {addr.phone}</p>
        </div>
      ))}

      {/* CONTINUE */}
      {addresses.length > 0 && (
        <button
          style={btn}
          onClick={() => {
            if (!selected) return;
            router.push(`/m/place-order?addr=${selected.id}`);
          }}
        >
          Deliver Here
        </button>
      )}
    </div>
  );
}

/* 🔥 STYLES */
const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const btn = {
  marginTop: "20px",
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  background: "black",
  color: "white",
  fontWeight: "600",
};

const btnOutline = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px dashed #ccc",
  background: "white",
  fontWeight: "600",
  marginBottom: "12px",
};

const formCard = {
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid #eee",
  marginBottom: "16px",
  background: "#fff",
};

const card = {
  padding: "14px",
  marginBottom: "12px",
  borderRadius: "14px",
  background: "white",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  cursor: "pointer",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
};

const actions = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const actionBtn = {
  fontSize: "12px",
  border: "none",
  background: "none",
  cursor: "pointer",
  color: "#007bff",
};

const defaultTag = {
  fontSize: "12px",
  color: "green",
  fontWeight: "600",
};

const text = {
  fontSize: "14px",
  color: "#555",
  marginTop: "4px",
};