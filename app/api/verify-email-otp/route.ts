import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifyAuth, unauthorized } from "@/lib/authUtils";

// Rate limit: max verification attempts per email
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// In-memory rate limiter (per server instance; use Redis in production)
const attemptTracker = new Map<string, { count: number; firstAttempt: number }>();

export async function POST(req: Request) {
  // 🔐 Require authenticated user
  const auth = await verifyAuth(req);
  if (!auth) return unauthorized();

  try {
    const { email, code } = await req.json();

    // 🛡️ Rate limit verification attempts
    const now = Date.now();
    const tracker = attemptTracker.get(email);
    if (tracker) {
      if (now - tracker.firstAttempt < ATTEMPT_WINDOW_MS) {
        if (tracker.count >= MAX_ATTEMPTS) {
          return NextResponse.json(
            { error: "Too many attempts. Please request a new code." },
            { status: 429 }
          );
        }
        tracker.count++;
      } else {
        // Reset window
        attemptTracker.set(email, { count: 1, firstAttempt: now });
      }
    } else {
      attemptTracker.set(email, { count: 1, firstAttempt: now });
    }

    // Query OTP using adminDb
    const snapshot = await adminDb
      .collection("email_otps")
      .where("email", "==", email)
      .where("code", "==", code)
      .where("used", "==", false)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const otpDoc = snapshot.docs[0];
    const otpData = otpDoc.data();

    if (Date.now() > otpData.expiresAt) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // ✅ Mark OTP as used (prevents replay attacks)
    await otpDoc.ref.update({ used: true });

    // Clear rate limit tracker on success
    attemptTracker.delete(email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
