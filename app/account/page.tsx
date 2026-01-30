"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 Redirect if not logged in
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  // 📦 Fetch past orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(data);
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* 🔙 Back Button */}
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-black transition cursor-pointer"
        >
          ← Back
        </button>

        {/* 👤 Account Info */}
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Account</h2>

          <div className="flex items-center gap-6">
            <img
              src={user.photoURL || "/avatar.png"}
              className="w-20 h-20 rounded-full object-cover border"
              alt="User Avatar"
            />

            <div className="space-y-1">
              <p><span className="font-semibold">Name:</span> {user.displayName}</p>
              <p><span className="font-semibold">Email:</span> {user.email}</p>
            </div>
          </div>
        </div>

        {/* 🔧 ACTION BUTTONS (ADMIN + LOGOUT) */}
        <div className="flex flex-wrap gap-4">
          {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
            <a
              href="/admin"
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:opacity-90 transition"
            >
              Go to Admin Dashboard
            </a>
          )}

          <button
            onClick={logout}
            className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* 📦 Past Orders */}
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Past Orders</h2>

          {loading ? (
            <p className="text-gray-500">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-5">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Order ID</span>
                    <span className="text-sm text-gray-500">
                      {order.createdAt?.seconds
                        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                        : "Processing"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
