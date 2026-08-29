import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
    <html lang="en" className="festive-theme-active">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased festive-theme-active`}>
        {children}
      </body>
    </html>
  );
}
