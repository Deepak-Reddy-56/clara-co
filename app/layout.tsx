import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Clara&Co",
  description: "Modern eCommerce Store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-800">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
