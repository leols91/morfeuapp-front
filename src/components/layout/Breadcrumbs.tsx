// src/components/layout/Breadcrumbs.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { cn } from "@/components/ui/cn";

const TITLE_MAP: Record<string, string> = {
  financeiro: "Financeiro",
  contas: "Contas",
  lancamentos: "Lançamentos",
  "contas-a-pagar": "Contas a pagar",
  "contas-a-receber": "Contas a receber",
  fornecedores: "Fornecedores",
  categorias: "Categorias",
  metodos: "Métodos de pagamento",
};

function labelFor(segment: string) {
  if (TITLE_MAP[segment]) return TITLE_MAP[segment];
  const pretty = segment.replace(/-/g, " ");
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, idx) => {
    const href = ("/" + segments.slice(0, idx + 1).join("/")) as Route;
    const label = labelFor(seg);
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-gray-600 dark:text-gray-300", className)}>
      <ol className="flex items-center gap-1">
        <li>
          <Link
            href={"/" as Route}
            className="rounded-lg px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5"
          >
            Início
          </Link>
        </li>
        {crumbs.map((c) => (
          <React.Fragment key={c.href}>
            <li aria-hidden className="px-1 opacity-50">/</li>
            <li>
              {c.isLast ? (
                <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 font-medium">
                  {c.label}
                </span>
              ) : (
                <Link
                  href={c.href}
                  className="rounded-lg px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {c.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}