import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getProductsBySection(section: string) {
  const q = query(
    collection(db, "products"),
    where("sections", "array-contains", section)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
  const data = doc.data();

  return {
    id: doc.id,
    name: data.name,
    price: data.price,
    image: data.image,
    category: data.category,
    sections: data.sections,
    inStock: data.inStock,

    // ✅ FIX: convert timestamp → string
    createdAt: data.createdAt?.toDate?.().toISOString?.() || null,
  };
});
}