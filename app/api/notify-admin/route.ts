import { NextResponse } from "next/server";
import { verifyAuth, unauthorized } from "@/lib/authUtils";

export async function POST(req: Request) {
  // 🔐 Require authenticated user (any logged-in user placing an order)
  const auth = await verifyAuth(req);
  if (!auth) return unauthorized();

  try {
    const data = await req.json();

    const itemList = data.items
      .map((i: any) => `• ${i.name}${i.size ? ` (Size: ${i.size})` : ""} × ${i.quantity}`)
      .join("\n");

    const message = `
🛒 *NEW ORDER RECEIVED*

🆔 Order ID: ${data.orderId}
👤 Customer: ${data.customerName}
📧 Email: ${data.email}
📞 Phone: ${data.phone}

📍 *Shipping Address*
${data.address.street}
${data.address.city} - ${data.address.postal}

🧾 *Items*
${itemList}

💰 *Total:* ₹${data.total}
`;

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Telegram notification error:", err);
    return NextResponse.json({ error: "Failed to send Telegram message" }, { status: 500 });
  }
}
