import fs from "fs";
import path from "path";
import { Product } from "./products";

const filePath = path.join(process.cwd(), "data", "products.json");

export function readProducts(): Product[] {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function writeProducts(products: Product[]) {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
}
