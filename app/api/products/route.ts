import { readProducts } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  const products = readProducts();
  return NextResponse.json(products);
}
