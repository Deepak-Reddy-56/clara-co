import type { ReactNode } from "react";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="mobile-app">
      <MobileHeader />

      {/* 🔥 Switch to Desktop
      <div className="mobile-switch">
        <a href="/?desktop=true">Switch to Desktop</a>
      </div> */}

      <main className="mobile-content">{children}</main>

      <MobileBottomNav />
    </div>
  );
}