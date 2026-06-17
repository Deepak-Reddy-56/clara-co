import { NextResponse } from "next/server";
import * as jose from "jose";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // server-only (no NEXT_PUBLIC_ prefix)
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const JWKS = jose.createRemoteJWKSet(
  new URL("https://www.googleapis.com/robot/v1/metadata/jwk/securetoken@system.gserviceaccount.com")
);

export type AuthResult = {
  uid: string;
  email: string | undefined;
  isAdmin: boolean;
};

/**
 * Verify the Firebase ID token from the Authorization header using jose.
 * Returns the decoded user info if valid, or null if invalid/missing.
 */
export async function verifyAuth(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.slice(7);
  try {
    if (!FIREBASE_PROJECT_ID) {
      console.error("JWT Verification error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing");
      return null;
    }

    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });

    return {
      uid: payload.sub as string,
      email: payload.email as string | undefined,
      isAdmin: payload.email === ADMIN_EMAIL,
    };
  } catch (err) {
    console.error("JWT Verification failed:", err);
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
