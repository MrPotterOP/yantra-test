import { Inter, Cormorant_Garamond } from "next/font/google";

import "./globals.css";

import GoogleAnalytics from "@/components/GoogleAn";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-cormorant",
});

export const metadata = {
  title: "Yantra - WINDOWS DOORS SKYLIGHTS BALUSTRADES",
  description:
    "Discover Yantra's custom home solutions, including doors, windows, balustrades, retractable & fixed glass roofs, and pergolas. We offer lifetime warranties, annual maintenance contracts, and a Pan India presence. Visit us to enhance your living spaces with innovative designs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cormorant.variable}`}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}

// export default function RootLayout({ children }) {
//   return (
//     <>
//       <Script id="gtm" strategy="afterInteractive">
//         {`
//           (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
//           new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
//           j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
//           'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
//           })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTAG_ID}');
//         `}
//       </Script>
//           {children}

//           <noscript
//                 dangerouslySetInnerHTML={{
//                 __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTAG_ID}" height="0" width="0" style="display: none; visibility: hidden;" />`,
//                 }}
//             />
//     </>
//   );
// }
