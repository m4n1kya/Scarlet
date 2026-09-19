import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SCARLET | Wildfire Detection",
  description: "AI-Powered Wildfire Detection & Monitoring Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-900 text-white min-h-screen flex flex-col`}>
        <Navigation />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </body>
    </html>
  );
}
