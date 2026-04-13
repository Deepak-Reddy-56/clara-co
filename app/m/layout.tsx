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
      <main className="mobile-content">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
