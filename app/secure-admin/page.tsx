"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SecureAdminLogin() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = () => {
    if (password === "claracoadmin") {
      localStorage.setItem("admin-login-time", Date.now().toString());
      router.push("/admin");
    } else {
      alert("Wrong password");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-80">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-950">Admin Access</h1>

        <input
          type="password"
          placeholder="Enter password"
          className="w-full border p-2 rounded mb-4 text-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-black text-white py-2 rounded"
        >
          Enter
        </button>
      </div>
    </main>
  );
}
