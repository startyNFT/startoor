import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Startoor — a curated marketplace for AI-built apps",
    template: "%s · Startoor",
  },
  description:
    "A curated, hand-picked marketplace where vibe coders ship AI-built apps, templates, and tools. Buy once. Use forever.",
  openGraph: {
    title: "Startoor",
    description:
      "A curated marketplace for AI-built apps, templates, and tools. Buy once. Use forever.",
    type: "website",
    siteName: "Startoor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Startoor — a curated marketplace for AI-built apps",
    description:
      "A curated marketplace for AI-built apps, templates, and tools. Buy once. Use forever.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="relative min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-ink)",
              color: "var(--color-bone)",
              border: "none",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
