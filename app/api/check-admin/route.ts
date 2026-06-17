import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/authUtils";

export async function GET(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ isAdmin: false });
  }
  return NextResponse.json({ isAdmin: auth.isAdmin });
}
