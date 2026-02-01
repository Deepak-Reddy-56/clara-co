"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = async () => {
    if (loading) return; // ⛔ prevent double clicks
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      // Ignore popup cancelled errors
      if (err.code !== "auth/cancelled-popup-request") {
        console.error(err);
        alert("Login failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <button
        onClick={loginWithGoogle}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
      >
        {loading ? "Opening Google..." : "Continue with Google"}
      </button>
    </main>
  );
}
