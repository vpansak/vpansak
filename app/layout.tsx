import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./storefront.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VPANSAK Shopping | Smart Shopping Made Easy",
  description: "Shop electronics, fashion, home, beauty and everyday essentials with secure payments, easy order tracking and trusted support.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/vpansak-logo.png",
    shortcut: "/vpansak-logo.png",
    apple: "/vpansak-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
