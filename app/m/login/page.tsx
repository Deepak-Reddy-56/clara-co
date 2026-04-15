"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MobileLoginPage() {
  const { user, loginWithGoogle, logout } = useAuth();
  const router = useRouter();

useEffect(() => {
  if (user) {
    router.push("/m/shop"); // 🔥 redirect after login
  }
}, [user]);

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "6px",
            textAlign: "center",
            color: "#111",
          }}
        >
          Welcome to Clara&Co
        </h2>

        <p
          style={{
            fontSize: "14px",
            color: "#666",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Sign in to continue shopping
        </p>

        {user ? (
          <>
            <p
              style={{
                textAlign: "center",
                marginBottom: "16px",
                fontWeight: 500,
                color: "#111",
              }}
            >
              Hi, {user.displayName}
            </p>

            <button style={logoutBtn} onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <button style={googleBtn} onClick={loginWithGoogle}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
    }}
  >
    {/* Google Logo */}
    <img
      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
      alt="google"
      style={{ width: "18px", height: "18px" }}
    />

    <span>Continue with Google</span>
  </div>
</button>
        )}
      </div>
    </div>
  );
}

const googleBtn = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  background: "black",
  color: "white",
  fontWeight: "600",
  fontSize: "15px",
};

const logoutBtn = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  background: "#f5f5f5",
  color: "#111",
  fontWeight: "600",
};