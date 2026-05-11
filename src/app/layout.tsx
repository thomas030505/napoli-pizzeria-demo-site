import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://napolipizzeria.lettbestilt.no";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Napoli Pizzeria — Vedfyrt napolitansk pizza i Vestfold siden 1987",
    template: "%s · Napoli Pizzeria",
  },
  description:
    "Ekte napolitansk pizza fra vedfyrt steinovn — 72 timers heving, San Marzano-tomater og oppskrifter i arv siden 1987. Tre avdelinger i Vestfold: Tønsberg, Nøtterøy og Sandefjord. Bestill på nett.",
  openGraph: {
    type: "website",
    locale: "nb_NO",
    siteName: "Napoli Pizzeria",
    url: SITE_URL,
    title: "Napoli Pizzeria — Vedfyrt napolitansk pizza i Vestfold",
    description:
      "Vedfyrt steinovn, 72 timers heving, oppskrifter fra Napoli siden 1987. Tre avdelinger i Vestfold.",
  },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: "#faf6ee",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nb-NO" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
