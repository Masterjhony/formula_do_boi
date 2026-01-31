import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fórmula do Boi | Comercialização de Nelore PO",
  description: "O melhor da genética Nelore.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Fórmula do Boi | Comercialização de Nelore PO",
    description: "O melhor da genética Nelore.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fórmula do Boi | Comercialização de Nelore PO",
    description: "O melhor da genética Nelore.",
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
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
