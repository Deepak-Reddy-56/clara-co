"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="mobile-header">
        <button onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>

        <h1 className="logo">Clara&Co</h1>

        <div style={{ width: 22 }} /> {/* spacer */}
      </header>

      <MobileSidebar open={open} setOpen={setOpen} />
    </>
  );
}
