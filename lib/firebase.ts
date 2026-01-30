// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBXyYvllP9QFn4Rk0QUGKc7fTJbtVQk_oo",
  authDomain: "claraandco-3001.firebaseapp.com",
  projectId: "claraandco-3001",
  storageBucket: "claraandco-3001.firebasestorage.app",
  messagingSenderId: "590875417879",
  appId: "1:590875417879:web:9749de1533f2d027f42b52",
  measurementId: "G-BE09LMC3PH"
};

// Prevent re-initializing Firebase in dev (Next.js fast refresh)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Auth works everywhere (client + server)
export const auth = getAuth(app);

export const db = getFirestore(app);

// 📊 Analytics (browser only)
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      getAnalytics(app);
    }
  });
}