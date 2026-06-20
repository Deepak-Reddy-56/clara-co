export type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category: string;
  sections?: (
    | "new-arrivals"
    | "top-selling"
    | "casual"
    | "formal"
    | "party"
    | "gym"
    | string
  )[];
  discount?: number;   // % discount
  inStock?: boolean;   // stock status
  sizeRange?: string;
  outOfStockSizes?: string;
};

/**
 * Parses sizeRange (e.g., "32-42" or "S, M, L, XL") and outOfStockSizes (e.g., "40" or "S, XL")
 * Returns an array of objects: { size: string, isAvailable: boolean }
 */
export function parseSizes(sizeRange?: string, outOfStockSizes?: string): { size: string; isAvailable: boolean }[] {
  if (!sizeRange || !sizeRange.trim()) return [];
  
  let sizes: string[] = [];
  
  // Check if it's a range like "32-42" or "32 - 42"
  const rangeMatch = sizeRange.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    if (!isNaN(start) && !isNaN(end) && start <= end) {
      for (let i = start; i <= end; i++) {
        sizes.push(String(i));
      }
    }
  } else {
    // Comma-separated list (e.g., "S, M, L, XL" or "32, 34, 36")
    sizes = sizeRange.split(",").map(s => s.trim()).filter(Boolean);
  }
  
  // Parse out of stock sizes
  const outOfStockList = outOfStockSizes
    ? outOfStockSizes.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];
    
  return sizes.map(size => {
    const isAvailable = !outOfStockList.includes(size.toLowerCase());
    return { size, isAvailable };
  });
}



export const products: Product[] = [
  {
    id: 1,
    name: "Casual Cotton T-shirt",
    price: 120,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000",
    category: "clothes",
    sections: ["new-arrivals", "casual"],
  },
  {
    id: 2,
    name: "Slim Fit Blazer",
    price: 240,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000",
    category: "clothes",
    sections: ["top-selling", "formal"],
  },
  {
    id: 3,
    name: "Party Printed Shirt",
    price: 180,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000",
    category: "clothes",
    sections: ["party"],
  },
  {
    id: 4,
    name: "Classic Aviator Goggles",
    price: 180,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000",
    category: "goggles",
    sections: ["top-selling"],
  },
  {
    id: 5,
    name: "Luxury Oud Perfume",
    price: 999,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=1000",
    category: "perfumes",
    sections: ["top-selling"],
  },
];
