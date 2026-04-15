"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="mobile-header">
        {/* LEFT - menu */}
        <button onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>

        {/* CENTER - logo */}
        <h1 className="logo">Clara&Co</h1>

        {/* RIGHT - desktop switch */}
        <a href="/?desktop=true" className="desktop-switch-btn">
          Desktop
        </a>
      </header>

      <MobileSidebar open={open} setOpen={setOpen} />
    </>
  );
}