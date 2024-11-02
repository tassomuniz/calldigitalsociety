import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digital Society",
  description: "Make outbound calls using Vapi AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={montserrat.className}>
        <nav className="border-b">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <Link href="/" className="text-2xl">
              <span className="font-light">digital</span>
              <span className="font-bold">society</span>
            </Link>
            <Link 
              href="/history" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Histórico
            </Link>
          </div>
        </nav>
        <main className="flex-1">
          {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
