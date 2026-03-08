import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Vitalis | Health Command Center",
  description: "Premium personal health operating system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="container mx-auto max-w-7xl p-6">
              {children}
            </div>
          </main>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur border-t border-border px-4 py-1.5 text-[10px] text-muted-foreground text-center z-50">
          This tool is for personal wellness tracking only and does not provide medical advice. Always consult a qualified healthcare provider for medical decisions.
        </div>
      </body>
    </html>
  );
}
