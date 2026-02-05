"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

type Address = {
  id: string;
  fullName?: string;
  phone?: string;
  street?: string;
  city?: string;
  postal?: string;
  isDefault?: boolean;
};

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    phone: "",
  });

  // 🔒 Redirect if not logged in
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  // 📥 Load saved addresses
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user) return;

      const q = query(collection(db, "addresses"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      const data: Address[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Address, "id">),
      }));

      setAddresses(data);

      const defaultAddr = data.find((a) => a.isDefault);
      if (defaultAddr) selectAddress(defaultAddr);
      else setForm((prev) => ({ ...prev, email: user.email || "" }));
    };

    loadAddresses();
  }, [user]);

  const selectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setForm({
      name: addr.fullName || "",
      email: user?.email || "",
      address: addr.street || "",
      city: addr.city || "",
      zip: addr.postal || "",
      phone: addr.phone || "",
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cart.length > 0 ? 5 : 0;
  const total = subtotal + shipping;

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async () => {
    if (!user) return;

    if (!form.phone.trim()) {
      alert("Please enter a phone number for delivery");
      return;
    }

    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email,
        items: cart,
        subtotal,
        shipping,
        total,
        shippingDetails: form,
        status: "PENDING",
        createdAt: serverTimestamp(),
      });

      await fetch("/api/notify-admin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderId: docRef.id,
    customerName: form.name,
    email: form.email,
    phone: form.phone,
    address: {
      street: form.address,
      city: form.city,
      postal: form.zip,
    },
    total,
    items: cart,
  }),
});


      alert("Order placed successfully!");
      clearCart();
      router.push("/account");
    } catch (err) {
      console.error(err);
      alert("Something went wrong placing your order");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6 text-gray-900">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

        {/* SHIPPING FORM */}
        <div className="bg-white p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Shipping Details</h2>

          {addresses.length > 0 && (
            <select
              value={selectedAddressId}
              onChange={(e) => {
                const addr = addresses.find(a => a.id === e.target.value);
                if (addr) selectAddress(addr);
              }}
              className="w-full mb-6 p-3 border rounded"
            >
              <option value="">Select Saved Address</option>
              {addresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.fullName} — {addr.street}, {addr.city}
                  {addr.isDefault ? " (Default)" : ""}
                </option>
              ))}
            </select>
          )}

          <div className="space-y-5">
            <input name="name" placeholder="Full Name" className="input" value={form.name} onChange={handleChange} />
            <input name="email" placeholder="Email Address" className="input" value={form.email} onChange={handleChange} />
            <input name="phone" placeholder="Mobile Number" className="input" value={form.phone} onChange={handleChange} />
            <input name="address" placeholder="Street Address" className="input" value={form.address} onChange={handleChange} />

            <div className="flex gap-4">
              <input name="city" placeholder="City" className="input" value={form.city} onChange={handleChange} />
              <input name="zip" placeholder="ZIP Code" className="input" value={form.zip} onChange={handleChange} />
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={loading}
            className="mt-10 w-full bg-black text-white py-3 rounded-lg shadow-md hover:shadow-lg active:scale-95 transition"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-white p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold mb-8">Order Summary</h2>

          <div className="space-y-5 max-h-80 overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-500 text-sm">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <span className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t mt-8 pt-5 space-y-3">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-lg pt-2">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
