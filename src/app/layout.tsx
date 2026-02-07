import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://app.formuladoboi.com'),
  title: "Fórmula do Boi | Comercialização de Nelore PO",
  description: "Plataforma especializada na compra e venda de genética Nelore PO: matrizes, touros, sêmen e embriões.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Fórmula do Boi | Comercialização de Nelore PO",
    description: "Plataforma especializada na compra e venda de genética Nelore PO: matrizes, touros, sêmen e embriões.",
    type: "website",
    locale: "pt_BR",
    images: ['/FORMULA DO BOI_LOGO-01.png'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fórmula do Boi | Comercialização de Nelore PO",
    description: "Plataforma especializada na compra e venda de genética Nelore PO: matrizes, touros, sêmen e embriões.",
    images: ['/FORMULA DO BOI_LOGO-01.png'],
  },
};

export const viewport = {
  themeColor: "#F4B400",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K5285LW7"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K5285LW7');`,
          }}
        />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
