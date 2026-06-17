import { writeProducts } from "@/lib/store";
import { NextResponse } from "next/server";
import { verifyAuth, unauthorized, forbidden } from "@/lib/authUtils";

export async function POST(req: Request) {
  // 🔐 Require admin authentication
  const auth = await verifyAuth(req);
  if (!auth) return unauthorized();
  if (!auth.isAdmin) return forbidden();

  const products = await req.json();
  writeProducts(products);
  return NextResponse.json({ success: true });
}
