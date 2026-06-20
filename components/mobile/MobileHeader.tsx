"use client";

import { Search, Menu, X, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import MobileSidebar from "./MobileSidebar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function MobileHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [query, setQuery]             = useState("");
  const [results, setResults]         = useState<any[]>([]);
  const [searching, setSearching]     = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 80);
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const q = query.trim().toLowerCase();
      if (!q) return setResults([]);
      setSearching(true);
      try {
        const snap = await getDocs(collection(db, "products"));
        const all = snap.docs.map(d => ({
          id: d.id,
          name: d.data().name || "",
          image: d.data().image || "",
          price: Number(d.data().price) || 0,
          category: d.data().category || "",
        }));
        setResults(all.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8));
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  const close = () => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  };

  const go = (path: string) => {
    router.push(path);
    close();
  };

  const quickLinks = [
    { emoji: "✨", label: "New Arrivals",  sub: "Fresh drops",      href: "/m/new"                    },
    { emoji: "🔥", label: "Top Selling",   sub: "Best sellers",     href: "/m/top"                    },
    { emoji: "👕", label: "Clothes",       sub: "All styles",       href: "/m/shop?category=clothes"  },
    { emoji: "🕶️", label: "Goggles",       sub: "Shades & frames",  href: "/m/shop?category=goggles"  },
    { emoji: "🌹", label: "Perfumes",      sub: "Fragrances",       href: "/m/shop?category=perfumes" },
  ];

  return (
    <>
      {/* ── HEADER ── */}
      <header className="mobile-header">
        <button onClick={() => setSidebarOpen(true)} aria-label="Menu">
          <Menu size={22} />
        </button>

        <h1 className="logo">Clara&amp;Co</h1>

        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          style={{
            background: "none", border: "none",
            padding: "6px", color: "#111", cursor: "pointer",
            display: "flex", alignItems: "center",
          }}
        >
          <Search size={20} />
        </button>
      </header>

      <MobileSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          animation: "searchSlideUp 0.2s cubic-bezier(0.16,1,0.3,1)",
        }}>

          {/* ── TOP BAR ── */}
          <div style={{
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            padding: "10px 14px 10px",
          }}>
            {/* Search pill */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#f4f4f4",
                borderRadius: "10px",
                padding: "0 14px",
                border: "1.5px solid transparent",
                transition: "border-color 0.2s",
              }}
              className="search-pill"
              >
                <Search size={15} color="#999" style={{ flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && query.trim())
                      go(`/m/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                  placeholder="Search for products..."
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "15px",
                    color: "#111",
                    padding: "13px 0",
                    caretColor: "#111",
                    fontWeight: 400,
                  }}
                  className="search-pill-input"
                />
                {query.length > 0 && (
                  <button
                    onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                    style={{
                      background: "#d0d0d0",
                      border: "none",
                      borderRadius: "50%",
                      width: "18px", height: "18px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#555", fontSize: "10px",
                      cursor: "pointer", flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>

              <button
                onClick={close}
                style={{
                  background: "none", border: "none",
                  fontSize: "14px", fontWeight: 600,
                  color: "#111", cursor: "pointer",
                  padding: "8px 4px",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.01em",
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* ── BODY ── */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch" as any,
            background: "#fff",
          }}>

            {/* Spinner */}
            {searching && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
                <div style={{
                  width: "20px", height: "20px",
                  border: "2.5px solid #eee",
                  borderTopColor: "#111",
                  borderRadius: "50%",
                  animation: "spin 0.65s linear infinite",
                }} />
              </div>
            )}

            {/* ── RESULTS ── */}
            {!searching && query && results.length > 0 && (
              <div>
                <p style={{
                  fontSize: "11px",
                  color: "#aaa",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  padding: "14px 16px 8px",
                }}>
                  Products ({results.length})
                </p>

                {results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => go(`/m/shop?highlight=${p.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f7f7f7",
                      transition: "background 0.1s",
                    }}
                    onTouchStart={e => (e.currentTarget.style.background = "#f9f9f9")}
                    onTouchEnd={e => (e.currentTarget.style.background = "#fff")}
                  >
                    {/* Image */}
                    <div style={{
                      width: "58px",
                      height: "68px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      flexShrink: 0,
                      background: "#f5f5f5",
                      border: "1px solid #f0f0f0",
                    }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#111",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        lineHeight: 1.4,
                      }}>
                        {p.name}
                      </p>
                      <p style={{
                        fontSize: "11px",
                        color: "#aaa",
                        margin: "2px 0 6px",
                        textTransform: "capitalize",
                      }}>
                        {p.category}
                      </p>
                      <p style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#111",
                        margin: 0,
                      }}>
                        ₹{p.price.toLocaleString()}
                      </p>
                    </div>

                    <ChevronRight size={16} color="#ddd" style={{ flexShrink: 0 }} />
                  </div>
                ))}

                {/* View all CTA */}
                <button
                  onClick={() => go(`/m/search?q=${encodeURIComponent(query)}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "calc(100% - 32px)",
                    margin: "14px 16px",
                    padding: "14px 18px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#111",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                    letterSpacing: "0.01em",
                  }}
                >
                  <span>See all results for &ldquo;{query}&rdquo;</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* ── NO RESULTS ── */}
            {!searching && query && results.length === 0 && (
              <div style={{ textAlign: "center", padding: "56px 32px" }}>
                <div style={{
                  width: "64px", height: "64px",
                  borderRadius: "50%",
                  background: "#f5f5f5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <Search size={26} color="#ccc" />
                </div>
                <p style={{ fontWeight: 700, color: "#111", fontSize: "16px", marginBottom: "6px" }}>
                  No results found
                </p>
                <p style={{ fontSize: "13px", color: "#aaa", lineHeight: 1.5 }}>
                  We couldn&apos;t find anything for &ldquo;{query}&rdquo;.<br />Try a different keyword.
                </p>
              </div>
            )}

            {/* ── EMPTY STATE — Categories ── */}
            {!query && (
              <>
                {/* Categories */}
                <div style={{ padding: "14px 16px 0" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Browse
                  </span>
                </div>

                {quickLinks.map((item, i) => (
                  <div
                    key={item.label}
                    onClick={() => go(item.href)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "13px 16px",
                      borderBottom: "1px solid #f7f7f7",
                      cursor: "pointer",
                      animation: `fadeUpItem 0.22s ease both`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                    onTouchStart={e => (e.currentTarget.style.background = "#f9f9f9")}
                    onTouchEnd={e => (e.currentTarget.style.background = "#fff")}
                  >
                    <div style={{
                      width: "42px", height: "42px",
                      borderRadius: "12px",
                      background: "#f5f5f5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "21px",
                      flexShrink: 0,
                    }}>
                      {item.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#111", margin: 0 }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: "12px", color: "#aaa", margin: "1px 0 0" }}>
                        {item.sub}
                      </p>
                    </div>
                    <ChevronRight size={16} color="#ddd" />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .search-pill-input::placeholder { color: #aaa; }
        @keyframes searchSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUpItem {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}