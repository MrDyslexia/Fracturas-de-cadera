"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, Download, Search, Home } from "lucide-react";
import { InvestigatorProvider } from "@/contexts/InvestigatorContext";

const nav = [
  { href: "/investigador", icon: Home, label: "Inicio" },
  { href: "/investigador#explorar", icon: Search, label: "Explorar registros" },
  { href: "/investigador#descargar", icon: Download, label: "Descargar" },
];

export default function InvestigadorLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <InvestigatorProvider>
      <div className="force-light min-h-[100vh] bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
        <aside className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6" />
              <div>
                <p className="text-sm font-semibold leading-tight">Portal Investigador</p>
                <p className="text-xs text-slate-500 leading-tight">
                  Navegar y descargar registros anonimizados
                </p>
              </div>
            </div>

            <nav className="flex gap-1">
              {nav.map((n) => {
                const Icon = n.icon;
                const active = usePathname() === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={[
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                      active ? "bg-slate-900 text-white" : "hover:bg-slate-100",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </InvestigatorProvider>
  );
}
