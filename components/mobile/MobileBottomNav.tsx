"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sparkles, Flame, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function MobileBottomNav() {
  const path = usePathname();
  const { cart } = useCart();

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const tabs = [
    { href: "/m/shop", icon: ShoppingBag, label: "Shop" },
    { href: "/m/new", icon: Sparkles, label: "New" },
    { href: "/m/top", icon: Flame, label: "Top" },
    { href: "/m/account", icon: User, label: "User" },
    { href: "/m/cart", icon: ShoppingBag, label: "Cart", isCart: true }
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(({ href, icon: Icon, label, isCart }) => (
        <Link
          key={href}
          href={href}
          className={`nav-item ${path === href ? "active" : ""} ${
            isCart ? "cart-nav" : ""
          }`}
        >
          <Icon size={20} />

          {/* 🔴 Badge only for cart */}
          {isCart && totalItems > 0 && (
            <span className="cart-badge">{totalItems}</span>
          )}

          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}