import { NextResponse } from "next/server";
import { adminAuth } from "./firebaseAdmin";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // server-only (no NEXT_PUBLIC_ prefix)

export type AuthResult = {
  uid: string;
  email: string | undefined;
  isAdmin: boolean;
};

/**
 * Verify the Firebase ID token from the Authorization header.
 * Returns the decoded user info if valid, or null if invalid/missing.
 */
export async function verifyAuth(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email,
      isAdmin: decoded.email === ADMIN_EMAIL,
    };
  } catch {
    return null;
  }
}

/**
 * Return a 401 Unauthorized response.
 */
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Return a 403 Forbidden response.
 */
export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
