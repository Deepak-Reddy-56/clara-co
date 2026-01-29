export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: "clothes" | "phones" | "footwear";
  sections?: (
    | "new-arrivals"
    | "top-selling"
    | "casual"
    | "formal"
    | "party"
    | "gym"
  )[];
  discount?: number;   // % discount
  inStock?: boolean;   // stock status
};


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
    name: "Nike Air Max",
    price: 180,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000",
    category: "footwear",
    sections: ["gym", "top-selling"],
  },
  {
    id: 5,
    name: "iPhone 14 Pro",
    price: 999,
    image: "https://images.unsplash.com/photo-1664478546381-20a9d1b8d5d3?q=80&w=1000",
    category: "phones",
    sections: ["top-selling"],
  },
];
