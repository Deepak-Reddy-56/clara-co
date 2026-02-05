"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const { cart } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* Close profile when clicking outside */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* 🔎 SEARCH WITH IMAGE + PRICE */
  useEffect(() => {
    const delay = setTimeout(async () => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return setSuggestions([]);

      setSearching(true);
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || "",
          image: doc.data().image || "",
          price: Number(doc.data().price) || 0,
        }));

        setSuggestions(
          products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5)
        );
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => setActiveIndex(-1), [suggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSuggestions([]);
  };

  return (
    <>
      <header className="w-full bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">

          {/* LOGO */}
          <Link href="/" className="text-xl md:text-2xl font-extrabold">
            Clara&Co
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex gap-10 text-gray-700 font-medium absolute left-1/2 -translate-x-1/2">
            <Link href="/shop">Shop</Link>
            <Link href="/#new-arrivals">New Arrivals</Link>
            <Link href="/#top-selling">Top Selling</Link>
            <Link href="/#browse-style">Styles</Link>
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-5">

            {/* SEARCH */}
            {searchOpen ? (
              <div className="relative w-64 md:w-72">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (!suggestions.length) return;

                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveIndex(i => (i + 1) % suggestions.length);
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setActiveIndex(i => (i <= 0 ? suggestions.length - 1 : i - 1));
                      }
                      if (e.key === "Enter" && activeIndex >= 0) {
                        const p = suggestions[activeIndex];
                        router.push(`/shop?highlight=${p.id}`);
                        setSearchOpen(false);
                        setSuggestions([]);
                      }
                      if (e.key === "Escape") {
                        setSearchOpen(false);
                        setSuggestions([]);
                      }
                    }}
                    className="w-full border px-3 py-2 rounded-md text-sm"
                    placeholder="Search products..."
                  />
                  <button type="button" onClick={() => setSearchOpen(false)}>✕</button>
                </form>

                {searchQuery && (
                  <div className="absolute top-11 w-full bg-white border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searching ? (
                      <p className="p-3 text-sm text-gray-500">Searching...</p>
                    ) : suggestions.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">No products found</p>
                    ) : (
                      suggestions.map((p, i) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            router.push(`/shop?highlight=${p.id}`);
                            setSearchOpen(false);
                            setSuggestions([]);
                          }}
                          className={`flex items-center gap-3 p-3 cursor-pointer ${i === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"}`}
                        >
                          <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" />
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-gray-500">${p.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                </svg>
              </button>
            )}

            {/* CART */}
            <button onClick={() => setCartOpen(true)} className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1 5h13M9 21a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            {/* PROFILE */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <Image
                  src={user.photoURL || "/avatar.png"}
                  alt="Profile"
                  width={36}
                  height={36}
                  className="rounded-full border cursor-pointer"
                  onClick={() => setProfileOpen(!profileOpen)}
                />
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white border rounded-lg shadow-lg z-50">
                    {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-indigo-600 font-semibold hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      My Account
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
