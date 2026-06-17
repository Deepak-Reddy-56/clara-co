import { NextResponse } from "next/server";
import { verifyAuth, unauthorized } from "@/lib/authUtils";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type ShippingForm = {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
};

export async function POST(req: Request) {
  // 🔐 Require authenticated user
  const auth = await verifyAuth(req);
  if (!auth) return unauthorized();

  try {
    const { cart, shippingDetails } = (await req.json()) as {
      cart: CartItem[];
      shippingDetails: ShippingForm;
    };

    // Validate required fields
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingDetails?.phone?.trim()) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // 🛡️ SERVER-SIDE PRICE VALIDATION
    // Look up each product's real price from Firestore
    const validatedItems: CartItem[] = [];
    let serverSubtotal = 0;

    for (const item of cart) {
      if (!item.id || typeof item.quantity !== "number" || item.quantity < 1) {
        return NextResponse.json(
          { error: `Invalid cart item: ${item.name || "unknown"}` },
          { status: 400 }
        );
      }

      const productDoc = await adminDb.collection("products").doc(item.id).get();

      if (!productDoc.exists) {
        return NextResponse.json(
          { error: `Product not found: ${item.name || item.id}` },
          { status: 400 }
        );
      }

      const productData = productDoc.data()!;
      
      // Calculate the real price (with discount if applicable)
      let realPrice = Number(productData.price) || 0;
      if (productData.discount && productData.discount > 0) {
        realPrice = realPrice - (realPrice * productData.discount) / 100;
      }

      // Check stock
      if (productData.inStock === false) {
        return NextResponse.json(
          { error: `${productData.name} is out of stock` },
          { status: 400 }
        );
      }

      validatedItems.push({
        id: item.id,
        name: productData.name,
        price: Math.round(realPrice * 100) / 100, // Use server price
        quantity: item.quantity,
      });

      serverSubtotal += realPrice * item.quantity;
    }

    const shipping = validatedItems.length > 0 ? 5 : 0;
    const serverTotal = Math.round((serverSubtotal + shipping) * 100) / 100;

    // Create the order with server-validated prices
    const orderRef = await adminDb.collection("orders").add({
      userId: auth.uid,
      userEmail: auth.email,
      items: validatedItems,
      subtotal: Math.round(serverSubtotal * 100) / 100,
      shipping,
      total: serverTotal,
      shippingDetails,
      status: "PENDING",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      total: serverTotal,
    });
  } catch (err) {
    console.error("Order placement error:", err);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
