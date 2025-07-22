import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./components/layout/ClientLayout";

// Arabic font - Cairo with Arabic subset
const cairoFont = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900']
});

// English font - Inter with Latin subset  
const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: "ساهم إنفست | منصة الاستثمار الرقمية",
  description: "منصة ساهم إنفست للاستثمار في الصفقات التجارية الموثوقة والآمنة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairoFont.variable} ${interFont.variable} antialiased`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
