"use client";

import Link from "next/link";
import { X } from "lucide-react";

interface MobileSidebarProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function MobileSidebar({ open, setOpen }: MobileSidebarProps) {
  return (
    <div
      className={`sidebar-overlay ${open ? "show" : ""}`}
      onClick={() => setOpen(false)}
    >
      <div
        className={`sidebar ${open ? "slide-in" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="sidebar-top">
          <button className="close-btn" onClick={() => setOpen(false)}>
            <X size={22} />
          </button>
          <h3>Browse by Styles</h3>
        </div>

        {/* LINKS */}
        <nav className="sidebar-links">
          <Link href="/m/styles/casual" onClick={() => setOpen(false)}>Casual</Link>
          <Link href="/m/styles/formal" onClick={() => setOpen(false)}>Formal</Link>
          <Link href="/m/styles/party" onClick={() => setOpen(false)}>Party</Link>
          <Link href="/m/styles/gym" onClick={() => setOpen(false)}>Gym</Link>
        </nav>
      </div>
    </div>
  );
}
