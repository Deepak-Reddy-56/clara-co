import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    const q = query(
      collection(db, "email_otps"),
      where("email", "==", email),
      where("code", "==", code)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const doc = snapshot.docs[0].data();

    if (Date.now() > doc.expiresAt) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
