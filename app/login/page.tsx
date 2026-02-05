"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      if (err.code !== "auth/cancelled-popup-request") {
        console.error(err);
        alert("Login failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 px-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Sign in to continue shopping at Clara&Co
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-[0.98] transition disabled:opacity-60"
        >
          <Image
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
          <span className="font-medium text-gray-700">
            {loading ? "Opening Google..." : "Continue with Google"}
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-8">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">Secure Login</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Trust Indicators */}
        <div className="space-y-3 text-sm text-gray-500">

          <div className="flex items-center gap-2 justify-center">
            {/* Lock Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.875a4.125 4.125 0 10-8.25 0V10.5M5.25 10.5h13.5A2.25 2.25 0 0121 12.75v6A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75v-6A2.25 2.25 0 015.25 10.5z" />
            </svg>
            <span>Your information is encrypted</span>
          </div>

          <div className="flex items-center gap-2 justify-center">
            {/* Lightning Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Fast & secure authentication</span>
          </div>

        </div>
      </div>
    </main>
  );
}
