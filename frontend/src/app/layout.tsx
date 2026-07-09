import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: "ViaStat — Mobilidade Auditada",
  description:
    "Plataforma analítica para auditar a regularidade, qualidade e confiabilidade de dados de transporte público a partir de pings GPS ruidosos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
          ViaStat — Mobilidade Auditada · Dados sintéticos demonstrativos
        </footer>
      </body>
    </html>
  );
}
