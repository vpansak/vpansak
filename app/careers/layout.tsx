import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers at VPANSAK | Join Our Team",
  description:
    "Explore career opportunities at VPANSAK and submit your candidate profile for roles across technology, design, operations, marketing, and customer experience.",
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
