import type { Metadata } from "next";
import Script from "next/script";

export const dynamic = "force-dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fantasy Club",
  description: "Fantasy Football para o seu clube",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1985448689634167"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Navbar />
        <main className="min-h-[calc(100vh-140px)] px-4 pb-20 sm:px-6 sm:pb-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
