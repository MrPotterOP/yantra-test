import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import "../globals.css";

export const metadata = {
  title: "Yantra - Contact Us",
  description: "Contact Yantra for inquiries, feedback, or any questions related to our products or any other related matters. We're here to help you bring your vision to life. Reach out to us with your questions, suggestions, or just to say hello.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
