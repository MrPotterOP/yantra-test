'use client'
 
import Script from 'next/script'
import { GA_TRACKING_ID } from './libs/gtag'

export default function GtagScript() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname + window.location.search,
            });
          `,
        }}
      />
    </>
  )
}
// export default function GtagScript() {
//   return (
//     <>
//       <Script
//         strategy="afterInteractive"
//         src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
//       />
//       <Script
//         id="gtag-init"
//         strategy="afterInteractive"
//         dangerouslySetInnerHTML={{
//           __html: `
//             window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());
//             gtag('config', '${GA_TRACKING_ID}', {
//               page_path: window.location.pathname,
//             });
//           `,
//         }}
//       />
//     </>
//   )
// }