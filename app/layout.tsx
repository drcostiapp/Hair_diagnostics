import "@/styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "DR. COSTI EXPERIENCE SIMULATOR",
  description: "Luxury behavior-conditioning training simulator"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
