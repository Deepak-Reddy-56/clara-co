import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const code = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

    await addDoc(collection(db, "email_otps"), {
      email,
      code,
      expiresAt,
      createdAt: serverTimestamp(),
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
