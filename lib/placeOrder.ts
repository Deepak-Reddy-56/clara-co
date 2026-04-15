import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function placeOrder(cart: any[], user: any, address: any) {
  try {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const docRef = await addDoc(collection(db, "orders"), {
      items: cart,
      total,
      userId: user.uid,
      userName: user.displayName,
      addressId: address.id,
      shippingDetails: address,
      createdAt: serverTimestamp(),
      status: "PENDING",
    });

    return { success: true, orderId: docRef.id }; // 🔥 IMPORTANT
  } catch (error) {
    console.error("Order failed:", error);
    return { success: false };
  }
}