import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luna by Noise | Health Intelligence Ring",
  description:
    "Luna Ring — Your personal health intelligence companion. Blood work analysis, wearable insights, and weekly AI health summaries.",
  keywords: "smart ring, health intelligence, blood work, wearable, Luna, Noise",
  openGraph: {
    title: "Luna by Noise | Health Intelligence Ring",
    description: "Your personal health intelligence companion.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-luna-dark text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
