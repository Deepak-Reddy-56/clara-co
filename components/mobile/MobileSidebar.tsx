"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MobileSidebarProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function MobileSidebar({ open, setOpen }: MobileSidebarProps) {
  const [styles, setStyles] = useState<{ name: string; slug: string }[]>([]);
  const [sectionName, setSectionName] = useState("Browse by Styles");

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const docRef = doc(db, "settings", "styles");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSectionName(data.sectionName || "Browse by Styles");
          setStyles(data.styles || []);
        } else {
          // Fallback static list
          setStyles([
            { name: "Casual", slug: "casual" },
            { name: "Formal", slug: "formal" },
            { name: "Party", slug: "party" },
            { name: "Gym", slug: "gym" }
          ]);
        }
      } catch (err) {
        console.error("Failed to load sidebar styles:", err);
      }
    };

    fetchStyles();
  }, []);

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
          <h3>{sectionName}</h3>
        </div>

        {/* LINKS */}
        <nav className="sidebar-links">
          {styles.map((style) => (
            <Link
              key={style.slug}
              href={`/m/styles/${style.slug}`}
              onClick={() => setOpen(false)}
            >
              {style.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
