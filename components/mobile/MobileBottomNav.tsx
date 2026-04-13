"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sparkles, Flame, Palette, User } from "lucide-react";

export default function MobileBottomNav() {
  const path = usePathname();

  const tabs = [
    { href: "/m/shop", icon: ShoppingBag, label: "Shop" },
    { href: "/m/new", icon: Sparkles, label: "New" },
    { href: "/m/top", icon: Flame, label: "Top" },
    { href: "/m/styles", icon: Palette, label: "Styles" },
    { href: "/account", icon: User, label: "User" },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href} className={`nav-item ${path === href ? "active" : ""}`}>
          <Icon size={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
