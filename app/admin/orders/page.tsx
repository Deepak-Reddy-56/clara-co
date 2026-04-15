"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Order = {
  id: string;
  userEmail: string;
  items: any[];
  total: number;
  status: string;
  createdAt: any;
  shippingDetails?: {
    // Desktop
    name?: string;
    address?: string;
    city?: string;
    zip?: string;

    // Mobile
    fullName?: string;
    street?: string;
    postal?: string;
    phone?: string;
  };
};

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  // 🔐 Admin protection
  useEffect(() => {
    if (loading) return;
    if (!user) return router.push("/login");
    if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return router.push("/");
    }
  }, [user, loading, router]);

  // 📦 Load all orders
  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data: Order[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));

      setOrders(data);
    };

    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">📦 Orders Dashboard</h1>

          <button
            onClick={() => router.push("/account")}
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 hover:border-gray-400 transition cursor-pointer"
          >
            ← Back to Account
          </button>
        </div>

        {orders.length === 0 && (
          <p className="text-gray-600">No orders yet.</p>
        )}

        <div className="space-y-6">
          {orders.map((order) => {
            const date = order.createdAt?.seconds
              ? new Date(order.createdAt.seconds * 1000).toLocaleString()
              : "Processing";

            return (
              <div
                key={order.id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg">
                      Order #{order.id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-700">
                      {order.userEmail}
                    </p>
                    <p className="text-sm text-gray-600">{date}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">
                      $
                      {(
                        order.total ??
                        order.items?.reduce(
                          (sum: number, item: any) =>
                            sum + item.price * item.quantity,
                          0
                        ) ??
                        0
                      ).toFixed(2)}
                    </p>

                    <div className="mt-2 flex items-center gap-2 justify-end">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>

                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-900 cursor-pointer hover:border-black transition"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 🔥 CLEAN SHIPPING INFO */}
                <div className="mb-4 text-sm text-gray-800">
                  <p className="font-semibold mb-1">Shipping Address</p>

                  {(() => {
                    const s = order.shippingDetails || {};

                    const name = s.fullName || s.name || "—";
                    const address = s.street || s.address || "—";
                    const city = s.city || "—";
                    const zip = s.postal || s.zip || "—";
                    const phone = s.phone;

                    return (
                      <>
                        <p>{name}</p>
                        <p>{address}</p>
                        <p>
                          {city} – {zip}
                        </p>
                        {phone && <p>📞 {phone}</p>}
                      </>
                    );
                  })()}
                </div>

                {/* ITEMS */}
                <div className="border-t pt-4 space-y-2 text-sm text-gray-800">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}