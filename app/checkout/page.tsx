"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = cart.length > 0 ? 5 : 0;
  const total = subtotal + shipping;

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const placeOrder = () => {
    alert("Order placed successfully!");
    clearCart();
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6 text-gray-800">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

        {/* SHIPPING FORM */}
        <div className="bg-white p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">
            Shipping Details
          </h2>

          <div className="space-y-5">
            <input
              name="name"
              placeholder="Full Name"
              className="w-full border p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder="Email Address"
              className="w-full border p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              onChange={handleChange}
            />
            <input
              name="address"
              placeholder="Street Address"
              className="w-full border p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              onChange={handleChange}
            />
            <div className="flex gap-4">
              <input
                name="city"
                placeholder="City"
                className="w-full border p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
                onChange={handleChange}
              />
              <input
                name="zip"
                placeholder="ZIP Code"
                className="w-full border p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={placeOrder}
            className="mt-10 w-full bg-black text-white py-3 rounded-lg shadow-md hover:shadow-lg active:scale-95 transition"
          >
            Place Order
          </button>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-white p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">
            Order Summary
          </h2>

          <div className="space-y-5 max-h-80 overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-gray-800">
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

          <div className="border-t mt-8 pt-5 space-y-3 text-gray-800">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
