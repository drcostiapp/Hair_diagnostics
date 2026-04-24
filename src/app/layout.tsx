import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dr. Costi Experience Simulator",
  description:
    "Private training simulator for Dr. Costi House of Beauty staff — the She Doesn't Wait Private Consultation experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory text-anchor">{children}</body>
    </html>
  );
}
