"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED";

type OrderItem = {
  name?: string;
  price?: number;
  quantity?: number;
};

type ShippingDetails = {
  name?: string;
  address?: string;
  city?: string;
  zip?: string;
  fullName?: string;
  street?: string;
  postal?: string;
  phone?: string;
};

type FirestoreTimestampLike = {
  seconds?: number;
  toDate?: () => Date;
};

type Order = {
  id: string;
  userEmail?: string;
  items?: OrderItem[];
  total?: number;
  status?: string;
  expectedDelivery?: string;
  trackingLink?: string;
  createdAt?: FirestoreTimestampLike;
  shippingDetails?: ShippingDetails;
};

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
];

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  // Per-order delivery info tracked locally before saving
  const [deliveryDates, setDeliveryDates] = useState<Record<string, string>>({});
  const [trackingLinks, setTrackingLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push("/");
      return;
    }

    setAuthorized(true);
  }, [loading, router, user]);

  useEffect(() => {
    if (!authorized) return;

    const fetchOrders = async () => {
      setPageLoading(true);
      setError("");

      try {
        const ordersQuery = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(ordersQuery);

        const data: Order[] = snapshot.docs.map((orderDoc) => ({
          id: orderDoc.id,
          ...(orderDoc.data() as Omit<Order, "id">),
        }));

        setOrders(data);

        // Seed local state with any existing values from Firestore
        const dates: Record<string, string> = {};
        const links: Record<string, string> = {};
        data.forEach((o) => {
          if (o.expectedDelivery) dates[o.id] = o.expectedDelivery;
          if (o.trackingLink) links[o.id] = o.trackingLink;
        });
        setDeliveryDates(dates);
        setTrackingLinks(links);
      } catch (fetchError) {
        console.error("Failed to load admin orders:", fetchError);
        setError("Unable to load orders right now.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchOrders();
  }, [authorized]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setSavingOrderId(orderId);

    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (updateError) {
      console.error("Failed to update order status:", updateError);
      alert("Could not update order status. Please try again.");
    } finally {
      setSavingOrderId(null);
    }
  };

  const updateDeliveryInfo = async (orderId: string) => {
    const expectedDelivery = deliveryDates[orderId] ?? "";
    const trackingLink = trackingLinks[orderId] ?? "";

    setSavingOrderId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        expectedDelivery,
        trackingLink,
      });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, expectedDelivery, trackingLink }
            : order
        )
      );
    } catch (updateError) {
      console.error("Failed to update delivery info:", updateError);
      alert("Could not save delivery info. Please try again.");
    } finally {
      setSavingOrderId(null);
    }
  };

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Orders Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review incoming orders and update fulfillment status.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition hover:border-gray-400 hover:bg-gray-50"
          >
            Back to Admin
          </button>
        </div>

        {pageLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Loading orders...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = normalizeStatus(order.status);
              const shipping = normalizeShipping(order.shippingDetails);

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-md"
                >
                  <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <p className="text-lg font-semibold">
                        Order #{order.id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-700">
                        {order.userEmail || "No customer email"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatOrderDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-lg font-bold">
                        ₹{calculateOrderTotal(order).toFixed(2)}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 md:justify-end">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                        <select
                          value={status}
                          disabled={savingOrderId === order.id}
                          onChange={(event) =>
                            updateStatus(
                              order.id,
                              event.target.value as OrderStatus
                            )
                          }
                          className="cursor-pointer rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 transition hover:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Delivery tracking fields */}
                      <div className="mt-3 flex flex-col gap-2">
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-xs font-medium text-gray-500">
                            Expected Delivery
                          </label>
                          <input
                            type="date"
                            value={deliveryDates[order.id] ?? ""}
                            disabled={savingOrderId === order.id}
                            onChange={(e) =>
                              setDeliveryDates((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 transition hover:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                          />
                        </div>

                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-xs font-medium text-gray-500">
                            Tracking Link
                          </label>
                          <input
                            type="text"
                            placeholder="https://track.example.com/..."
                            value={trackingLinks[order.id] ?? ""}
                            disabled={savingOrderId === order.id}
                            onChange={(e) =>
                              setTrackingLinks((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 transition hover:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                          />
                        </div>

                        <button
                          disabled={savingOrderId === order.id}
                          onClick={() => updateDeliveryInfo(order.id)}
                          className="mt-1 cursor-pointer self-start rounded bg-black px-3 py-1 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          {savingOrderId === order.id ? "Saving…" : "Save Delivery Info"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 text-sm text-gray-800">
                    <p className="mb-1 font-semibold">Shipping Address</p>
                    <p>{shipping.name}</p>
                    <p>{shipping.address}</p>
                    <p>
                      {shipping.city} - {shipping.zip}
                    </p>
                    {shipping.phone && <p>{shipping.phone}</p>}
                  </div>

                  <div className="space-y-2 border-t pt-4 text-sm text-gray-800">
                    {(order.items || []).map((item, index) => (
                      <div key={`${order.id}-${index}`} className="flex justify-between gap-4">
                        <span>
                          {item.name || "Unnamed item"} x {item.quantity ?? 0}
                        </span>
                        <span>
                          ₹
                          {(
                            (item.price ?? 0) * (item.quantity ?? 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function normalizeStatus(status?: string): OrderStatus {
  if (status === "PAID" || status === "SHIPPED" || status === "DELIVERED") {
    return status;
  }

  return "PENDING";
}

function calculateOrderTotal(order: Order) {
  if (typeof order.total === "number") {
    return order.total;
  }

  return (order.items || []).reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
    0
  );
}

function formatOrderDate(createdAt?: FirestoreTimestampLike) {
  if (createdAt?.toDate) {
    return createdAt.toDate().toLocaleString();
  }

  if (typeof createdAt?.seconds === "number") {
    return new Date(createdAt.seconds * 1000).toLocaleString();
  }

  return "Processing";
}

function normalizeShipping(details?: ShippingDetails) {
  return {
    name: details?.fullName || details?.name || "—",
    address: details?.street || details?.address || "—",
    city: details?.city || "—",
    zip: details?.postal || details?.zip || "—",
    phone: details?.phone || "",
  };
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "PAID":
      return "bg-blue-100 text-blue-700";
    case "SHIPPED":
      return "bg-purple-100 text-purple-700";
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
