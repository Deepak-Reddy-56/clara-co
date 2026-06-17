"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import { authFetch } from "@/lib/authClient";

export default function ProfileSection() {
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    authFetch("/api/check-admin")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [user]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Account</h2>

      <div className="flex items-center gap-6">
        <Image
          src={user?.photoURL || "/avatar.png"}
          alt="User Avatar"
          width={80}
          height={80}
          className="rounded-full border object-cover"
        />

        <div>
          <p><strong>Name:</strong> {user?.displayName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        {isAdmin && (
          <a href="/admin" className="bg-indigo-600 text-white px-5 py-2 rounded-lg">
            Admin Dashboard
          </a>
        )}
        <button onClick={logout} className="bg-black text-white px-5 py-2 rounded-lg">
          Logout
        </button>
      </div>
    </div>
  );
}
