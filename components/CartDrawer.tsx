"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartDrawer({ open, onClose }: any) {
  const { cart, increaseQty, decreaseQty, clearCart } = useCart();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = cart.length > 0 ? 5 : 0;
  const total = subtotal + shipping;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Cart</h2>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 && (
              <p className="text-gray-500">Your cart is empty</p>
            )}

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b pb-4 items-center"
              >
                <img
                  src={item.image || "https://placehold.co/80"}
                  className="w-16 h-16 rounded object-cover"
                  alt={item.name}
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ${item.price.toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center mt-2 border rounded-full w-fit overflow-hidden">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="px-3 py-1 hover:bg-gray-100 transition"
                    >
                      −
                    </button>
                    <span className="px-4 text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="px-3 py-1 hover:bg-gray-100 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals & Actions */}
          {cart.length > 0 && (
            <div className="pt-6 border-t mt-4 space-y-5">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-700">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-semibold text-lg text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-4 pt-2">
                <Link href="/checkout" onClick={onClose}>
                  <button className="w-full bg-black text-white py-3 rounded-lg shadow-md hover:shadow-lg">
                    Checkout
                  </button>
                </Link>

                <button
                  onClick={clearCart}
                  className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
