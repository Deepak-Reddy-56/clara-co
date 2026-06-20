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
import { authFetch } from "@/lib/authClient";

export default function Header() {
  const [cartOpen, setCartOpen]       = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching]     = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAdmin, setIsAdmin]         = useState(false);
  const [mounted, setMounted]         = useState(false);

  const profileRef  = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const { cart } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => setMounted(true), []);

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

  /* Global keyboard shortcut: Cmd/Ctrl + K */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        setSuggestions([]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* Focus input when overlay opens */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  /* Check admin */
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    authFetch("/api/check-admin")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [user]);

  /* Live search */
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
          category: doc.data().category || "",
        }));
        setSuggestions(
          products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6)
        );
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 260);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => setActiveIndex(-1), [suggestions]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    closeSearch();
  };

  const goToProduct = (p: any) => {
    router.push(`/shop?highlight=${p.id}`);
    closeSearch();
  };

  return (
    <>
      <header className="w-full bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">

          {/* LOGO */}
          <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-tight">
            Clara&amp;Co
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

            {/* SEARCH TRIGGER */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 14px",
                borderRadius: "999px",
                border: "1.5px solid #e5e5e5",
                background: "#fafafa",
                color: "#888",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#ccc";
                (e.currentTarget as HTMLButtonElement).style.background = "#f3f3f3";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5e5";
                (e.currentTarget as HTMLButtonElement).style.background = "#fafafa";
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
              </svg>
              <span>Search</span>
              <span style={{
                marginLeft: "4px",
                padding: "1px 6px",
                borderRadius: "4px",
                background: "#ececec",
                color: "#aaa",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}>Ctrl K</span>
            </button>

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
                    {isAdmin && (
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

      {/* ── SEARCH OVERLAY ── */}
      {mounted && searchOpen && (
        <div
          onClick={closeSearch}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "80px",
            animation: "searchFadeIn 0.18s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "620px",
              margin: "0 16px",
              background: "#fff",
              borderRadius: "18px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.08)",
              overflow: "hidden",
              animation: "searchSlideDown 0.2s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Input Row */}
            <form onSubmit={handleSearch}>
              <div style={{
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                gap: "12px",
                borderBottom: searchQuery ? "1px solid #f0f0f0" : "none",
              }}>
                <svg width="18" height="18" fill="none" stroke="#999" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                </svg>
                <input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (!suggestions.length) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveIndex(i => Math.max(i - 1, -1));
                    }
                    if (e.key === "Enter" && activeIndex >= 0) {
                      e.preventDefault();
                      goToProduct(suggestions[activeIndex]);
                    }
                  }}
                  placeholder="Search for clothes, goggles, perfumes..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#111",
                    background: "transparent",
                    padding: "20px 0",
                    caretColor: "#111",
                  }}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
                    style={{
                      width: "24px", height: "24px",
                      borderRadius: "50%",
                      border: "none",
                      background: "#efefef",
                      color: "#888",
                      fontSize: "13px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeSearch}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1.5px solid #e5e5e5",
                      background: "none",
                      color: "#aaa",
                      fontSize: "12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Esc
                  </button>
                )}
              </div>
            </form>

            {/* Results */}
            {searchQuery && (
              <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                {searching ? (
                  <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: "10px", color: "#aaa", fontSize: "14px" }}>
                    <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid #ddd", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Searching...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div style={{ padding: "32px 20px", textAlign: "center" }}>
                    <p style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</p>
                    <p style={{ color: "#333", fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>No results for "{searchQuery}"</p>
                    <p style={{ color: "#aaa", fontSize: "13px" }}>Try a different keyword or browse the shop</p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: "11px", color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 20px 4px", fontWeight: 600 }}>
                      Products
                    </p>
                    {suggestions.map((p, i) => (
                      <div
                        key={p.id}
                        onClick={() => goToProduct(p)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: "10px 20px",
                          cursor: "pointer",
                          background: i === activeIndex ? "#f5f5f5" : "transparent",
                          transition: "background 0.12s",
                          borderRadius: "0",
                        }}
                        onMouseEnter={e => {
                          if (i !== activeIndex) (e.currentTarget as HTMLDivElement).style.background = "#fafafa";
                        }}
                        onMouseLeave={e => {
                          if (i !== activeIndex) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                        }}
                      >
                        {/* Thumbnail */}
                        <div style={{
                          width: "48px", height: "48px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          background: "#f5f5f5",
                          flexShrink: 0,
                        }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.name}
                          </p>
                          <p style={{ fontSize: "12px", color: "#aaa", margin: "2px 0 0", textTransform: "capitalize" }}>
                            {p.category}
                          </p>
                        </div>
                        {/* Price */}
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#111", flexShrink: 0 }}>
                          ₹{p.price.toLocaleString()}
                        </span>
                        {/* Arrow */}
                        <span style={{ color: "#ccc", fontSize: "16px", flexShrink: 0 }}>→</span>
                      </div>
                    ))}
                    {/* View all results */}
                    <div style={{ borderTop: "1px solid #f5f5f5", padding: "0" }}>
                      <button
                        onClick={() => { router.push(`/search?q=${encodeURIComponent(searchQuery)}`); closeSearch(); }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          width: "100%", padding: "14px 20px",
                          background: "none", border: "none",
                          color: "#555", fontSize: "14px",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#fafafa"}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}
                      >
                        <span>View all results for <strong>"{searchQuery}"</strong></span>
                        <span style={{ color: "#bbb" }}>↵ Enter</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Empty state / hints */}
            {!searchQuery && (
              <div style={{ padding: "16px 20px 20px" }}>
                <p style={{ fontSize: "11px", color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "10px" }}>
                  Quick links
                </p>
                {[
                  { label: "New Arrivals", href: "/#new-arrivals" },
                  { label: "Top Selling", href: "/#top-selling" },
                  { label: "Browse All Products", href: "/shop" },
                ].map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeSearch}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 0",
                      color: "#444", textDecoration: "none", fontSize: "14px",
                      borderBottom: "1px solid #f8f8f8",
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ color: "#ccc", fontSize: "16px" }}>→</span>
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes searchFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes searchSlideDown {
          from { opacity: 0; transform: translateY(-16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
