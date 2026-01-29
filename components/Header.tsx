"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { cart } = useCart();
  const { user, logout } = useAuth();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="w-full bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">

          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-gray-900"
          >
            Clara&Co
          </Link>

          {/* Center Navigation */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex gap-12 text-gray-700 font-medium text-[15px] tracking-wide">
            <Link href="/shop" className="hover:text-black transition">Shop</Link>
            <Link href="/#new-arrivals" className="hover:text-black transition">New Arrivals</Link>
            <Link href="/#top-selling" className="hover:text-black transition">Top Selling</Link>
            <Link href="/#browse-style" className="hover:text-black transition">Styles</Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-6 text-gray-700">

            {/* Search */}
            <button className="hover:text-black transition cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
              </svg>
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative hover:text-black transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386a1.5 1.5 0 0 1 1.464 1.175l.383 1.533m0 0 1.5 6h11.25l1.5-6m-14.25 0h14.25M6 21a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm12 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
              </svg>

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            {/* USER / LOGIN */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="cursor-pointer"
                  >
                    <img
                      src={user.photoURL || "/avatar.png"}
                      className="w-8 h-8 rounded-full border"
                      alt="Profile"
                    />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-40 bg-white shadow-lg rounded-lg border py-2 text-sm">
                      <p className="px-4 py-2 text-gray-500 border-b">
                        {user.displayName || user.email}
                      </p>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" className="hover:text-black transition cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
                  </svg>
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
