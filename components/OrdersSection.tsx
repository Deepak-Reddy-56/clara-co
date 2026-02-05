"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrdersSection() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "PAID": return "bg-blue-100 text-blue-700";
      case "SHIPPED": return "bg-purple-100 text-purple-700";
      case "DELIVERED": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Past Orders</h2>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const date = order.createdAt?.seconds
              ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
              : "Processing";

            return (
              <div key={order.id} className="border rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">{date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status || "PENDING")}`}>
                      {order.status || "PENDING"}
                    </span>
                  </div>
                </div>

                {(order.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm text-gray-700">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
