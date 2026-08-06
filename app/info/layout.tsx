import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About VPANSAK | Shopping, Sellers, Payments, Support and Policies",
  description:
    "Learn about VPANSAK Shopping, its customer services, verified seller program, secure payment options, delivery process, return and refund system, support centre and future vision.",
  alternates: {
    canonical: "https://vpansak.vercel.app/info",
  },
  openGraph: {
    title: "About VPANSAK | Shopping, Sellers, Payments, Support and Policies",
    description:
      "Learn about VPANSAK Shopping, its customer services, verified seller program, secure payment options, delivery process, return and refund system, support centre and future vision.",
    url: "https://vpansak.vercel.app/info",
    siteName: "VPANSAK Shopping",
    images: [
      {
        url: "https://vpansak.vercel.app/vpansak-logo-dark.jpeg",
        width: 1200,
        height: 630,
        alt: "VPANSAK Shopping",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About VPANSAK",
    description: "Official company information for VPANSAK Shopping.",
    images: ["https://vpansak.vercel.app/vpansak-logo-dark.jpeg"],
  },
};

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
