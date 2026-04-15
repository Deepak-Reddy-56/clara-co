"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrdersSection() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrders, setShowOrders] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  /* Back to top scroll listener */
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":   return "bg-yellow-100 text-yellow-700";
      case "PAID":      return "bg-blue-100 text-blue-700";
      case "SHIPPED":   return "bg-purple-100 text-purple-700";
      case "DELIVERED": return "bg-green-100 text-green-700";
      default:          return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm">

      {/* ── Section-level dropdown header ── */}
      <button
        onClick={() => setShowOrders((v) => !v)}
        className="w-full flex justify-between items-center mb-2 group"
      >
        <h2 className="text-2xl font-bold">Past Orders</h2>
        <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-800 transition-colors">
          {!loading && (
            <span className="text-sm font-normal">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          )}
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${showOrders ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* ── Full list shown only when section is open ── */}
      {showOrders && (
        <div className="mt-4">
          {loading ? (
            <p className="text-gray-500">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const isExpanded = expandedIds.has(order.id);

                const date = order.createdAt?.seconds
                  ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                  : "Processing";

                const total = (
                  order.total ??
                  order.items?.reduce(
                    (sum: number, item: any) => sum + (item.price ?? 0) * (item.quantity ?? 0),
                    0
                  ) ??
                  0
                ).toFixed(2);

                return (
                  <div key={order.id} className="border rounded-xl overflow-hidden shadow-sm">

                    {/* ── Per-order summary row ── */}
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="font-semibold text-sm">Order #{order.id.slice(-6)}</p>
                        <p className="text-xs text-gray-400">{date}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status || "PENDING")}`}>
                          {order.status || "PENDING"}
                        </span>
                        <span className="font-semibold text-sm">${total}</span>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* ── Per-order expanded details ── */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 px-5 pt-4 pb-5 space-y-3">
                        <div className="space-y-1.5">
                          {(order.items || []).map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm text-gray-700">
                              <span>{item.name} × {item.quantity}</span>
                              <span>${((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t text-sm text-gray-600 space-y-1">
                          <p>
                            Expected Delivery:{" "}
                            <span className="font-medium text-gray-800">
                              {order.expectedDelivery || "—"}
                            </span>
                          </p>
                          {order.trackingLink && (
                            <a
                              href={order.trackingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-blue-600 hover:underline font-medium"
                            >
                              Track Order →
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Floating Back to Top ── */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-8 right-8 z-50 bg-black text-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
