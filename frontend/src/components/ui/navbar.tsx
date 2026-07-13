"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bus,
  Home,
  Map,
  BarChart3,
  ShieldCheck,
  FileText,
  BookOpen,
  Activity,
  Menu,
  X,
  FlaskConical,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Início", icon: Home },
  { href: "/network", label: "Rede", icon: Activity },
  { href: "/routes", label: "Rotas", icon: Bus },
  { href: "/headway", label: "Headway", icon: BarChart3 },
  { href: "/quality", label: "Qualidade", icon: ShieldCheck },
  { href: "/brief", label: "Relatório", icon: FileText },
  { href: "/case-study", label: "Case", icon: FlaskConical },
  { href: "/methodology", label: "Metodologia", icon: BookOpen },
  { href: "/pipeline", label: "Pipeline", icon: Map },
];


export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-slate-900"
          onClick={() => setOpen(false)}
        >
          <Bus className="h-5 w-5 text-blue-600" aria-hidden />
          ViaStat
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div
          id="primary-nav"
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 right-0 top-full flex-col gap-1 border-b border-slate-200 bg-white p-3 shadow-sm md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
