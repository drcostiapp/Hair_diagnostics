import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dr. Costi Experience Simulator",
  description:
    "A private training environment for the Dr. Costi House of Beauty team.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory text-anchor">{children}</body>
    </html>
  );
}
