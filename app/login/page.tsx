"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <button
        onClick={loginWithGoogle}
        className="bg-black text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
      >
        Continue with Google
      </button>
    </main>
  );
}
