"use client";

import EditAddressModal from "./EditAddressModal";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AddressesSection() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postal: "",
    country: "",
  });

  const fetchAddresses = async () => {
    if (!user) return;
    const q = query(collection(db, "addresses"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    setAddresses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const addAddress = async () => {
    if (!user) return;

    await addDoc(collection(db, "addresses"), {
      ...newAddress,
      userId: user.uid,
      isDefault: addresses.length === 0,
      createdAt: serverTimestamp(),
    });

    setNewAddress({ fullName: "", phone: "", street: "", city: "", state: "", postal: "", country: "" });
    fetchAddresses();
  };

  const deleteAddress = async (id: string) => {
    await deleteDoc(doc(db, "addresses", id));
    fetchAddresses();
  };

  const setDefaultAddress = async (id: string) => {
    await Promise.all(
      addresses.map((addr) =>
        updateDoc(doc(db, "addresses", addr.id), { isDefault: addr.id === id })
      )
    );
    fetchAddresses();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Saved Addresses</h2>

      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="border p-4 rounded-lg flex justify-between">
            <div>
              <p className="font-semibold">
                {addr.fullName} {addr.isDefault && <span className="text-xs text-green-600 ml-2">(Default)</span>}
              </p>
              <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state}</p>
              <p className="text-sm text-gray-600">{addr.postal}, {addr.country}</p>
              <p className="text-sm text-gray-600">📞 {addr.phone}</p>
            </div>
            <div className="flex flex-col gap-2">
  {!addr.isDefault && (
    <button
      onClick={() => setDefaultAddress(addr.id)}
      className="text-blue-600 text-sm"
    >
      Set Default
    </button>
  )}

  <button
    onClick={() => setEditingAddress(addr)}
    className="text-indigo-600 text-sm"
  >
    Edit
  </button>

  <button
    onClick={() => deleteAddress(addr.id)}
    className="text-red-600 text-sm"
  >
    Delete
  </button>
</div>

          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {Object.keys(newAddress).map((field) => (
          <input
            key={field}
            placeholder={field}
            value={(newAddress as any)[field]}
            onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
            className="border p-2 rounded"
          />
        ))}
      </div>

      <button onClick={addAddress} className="mt-4 bg-black text-white px-4 py-2 rounded">
        Add Address
      </button>

      {editingAddress && (
  <EditAddressModal
    address={editingAddress}
    onClose={() => setEditingAddress(null)}
    onSaved={fetchAddresses}
  />
)}

    </div>
  );
}
