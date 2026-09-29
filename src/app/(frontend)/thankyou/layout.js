import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import "../globals.css";

export const metadata = {
  title: "Thank You! - Team Yantra"
};

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTAG_ID} />
//       <body className={inter.className}>{children}
//         <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTAG_ID}`}
//           height="0" width="0" style={{ display: "none", visibility: "hidden" }}></iframe>
//         </noscript>
//       </body>
//     </html>
//   );
// }


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
          {children}
      </body>
    </html>
  );
}
