import { writeProducts } from "@/lib/store";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const products = await req.json();
  writeProducts(products);
  return NextResponse.json({ success: true });
}
