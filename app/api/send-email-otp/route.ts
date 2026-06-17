import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAuth, unauthorized } from "@/lib/authUtils";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

function generateOTP() {
  // Use crypto for secure random generation instead of Math.random
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}

// Rate limit: max OTP requests per email within a time window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_OTPS_PER_WINDOW = 5;

export async function POST(req: Request) {
  // 🔐 Require authenticated user
  const auth = await verifyAuth(req);
  if (!auth) return unauthorized();

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // 🛡️ Rate limiting: check recent OTPs for this email using adminDb
    const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;
    const recentSnapshot = await adminDb
      .collection("email_otps")
      .where("email", "==", email)
      .where("createdAtMs", ">=", windowStart)
      .get();

    if (recentSnapshot.size >= MAX_OTPS_PER_WINDOW) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    const code = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

    await adminDb.collection("email_otps").add({
      email,
      code,
      expiresAt,
      createdAtMs: Date.now(), // numeric timestamp for rate limiting queries
      createdAt: FieldValue.serverTimestamp(),
      used: false,
    });

    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: "Your Clara&Co Verification Code",
      html: `<h2>Your OTP Code</h2><p>Your verification code is:</p>
             <h1>${code}</h1>
             <p>This code expires in 10 minutes.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
