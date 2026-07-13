import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ViaStat — Mobilidade Auditada",
  description:
    "Lab analítico para auditar regularidade, qualidade e confiabilidade de pings GPS ruidosos de transporte público — com incerteza explícita.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
          ViaStat — Mobilidade Auditada · Lab only · dados sintéticos (seed 42)
        </footer>
      </body>
    </html>
  );
}
