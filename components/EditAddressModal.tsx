"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EditAddressModal({ address, onClose, onSaved }: any) {
  const [form, setForm] = useState(address);

  useEffect(() => {
    setForm(address);
  }, [address]);

  const handleSave = async () => {
    await updateDoc(doc(db, "addresses", address.id), {
      fullName: form.fullName,
      phone: form.phone,
      street: form.street,
      city: form.city,
      state: form.state,
      postal: form.postal,
      country: form.country,
    });

    onSaved();   // refresh list
    onClose();   // close modal
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4">
        <h3 className="text-xl font-semibold">Edit Address</h3>

        {Object.keys(form).map((key) =>
          key !== "id" && key !== "userId" && key !== "isDefault" && key !== "createdAt" ? (
            <input
              key={key}
              value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="border p-2 rounded w-full"
              placeholder={key}
            />
          ) : null
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-black text-white rounded">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
