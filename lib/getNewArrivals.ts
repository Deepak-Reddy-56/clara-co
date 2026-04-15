import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getNewArrivals() {
  const q = query(
    collection(db, "products"),
    orderBy("createdAt", "desc"),
    limit(6)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}