"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import ProfileSection from "@/components/ProfileSection";
import OrdersSection from "@/components/OrdersSection";
import AddressesSection from "@/components/AddressesSection";

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← Back
        </button>

        <ProfileSection />
        <OrdersSection />
        <AddressesSection />
      </div>
    </main>
  );
}
