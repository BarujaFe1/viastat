"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, Home, Map, BarChart3, ShieldCheck, FileText, BookOpen, Activity } from "lucide-react";

const navLinks = [
  { href: "/", label: "Início", icon: Home },
  { href: "/network", label: "Rede", icon: Activity },
  { href: "/routes", label: "Rotas", icon: Bus },
  { href: "/headway", label: "Headway", icon: BarChart3 },
  { href: "/quality", label: "Qualidade", icon: ShieldCheck },
  { href: "/brief", label: "Relatório", icon: FileText },
  { href: "/methodology", label: "Metodologia", icon: BookOpen },
  { href: "/pipeline", label: "Pipeline", icon: Map },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Bus className="h-5 w-5 text-blue-600" />
          ViaStat
        </Link>
        <div className="flex gap-1 overflow-x-auto text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
