import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import "../globals.css";

export const metadata = {
  title: "Yantra - Terms of Sale",
  description: "Explore Yantra's Terms of Sales page for detailed information on our window products, purchase policies, warranties, and customer support. Clear, concise, and customer-focused guidelines ensure a smooth buying experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
