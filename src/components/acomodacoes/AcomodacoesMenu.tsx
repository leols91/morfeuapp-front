"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";

type Item = { label: string; href: string; badge?: string };
type Section = { title?: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    items: [
      { label: "Acomodações", href: "/acomodacoes" },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { label: "Tipos de quarto", href: "/acomodacoes/tipos" },
      { label: "Comodidades", href: "/acomodacoes/amenidades" },
    ],
  },
];

// helper para “opt-out” de typed routes quando a rota ainda não estiver no type
function toRoute(href: string): Route {
  return href as unknown as Route;
}

export default function AcomodacoesMenu() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div ref={ref} className="relative ml-4">
      <Button
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="h-9 px-3"
      >
        Menu
        <svg
          className="ml-2 h-4 w-4 opacity-70"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute z-50 mt-2 w-72 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-[#0F172A] shadow-soft p-2"
        >
          {SECTIONS.map((sec, idx) => (
            <div
              key={idx}
              className={cn(
                idx > 0 && "pt-2 mt-2 border-t border-gray-100 dark:border-white/10"
              )}
            >
              {sec.title ? (
                <div className="px-2 pb-1 text-[11px] uppercase tracking-wide opacity-60">
                  {sec.title}
                </div>
              ) : null}
              <ul className="space-y-1">
                {sec.items.map((it) => {
                  const active = pathname === it.href;
                  return (
                    <li key={it.href}>
                      <Link
                        href={toRoute(it.href)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5",
                          active && "bg-black/5 dark:bg-white/5"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <span className="truncate">{it.label}</span>
                        {it.badge ? (
                          <span className="ml-2 inline-flex items-center rounded-full border border-gray-200/70 dark:border-white/10 px-2 text-[11px] opacity-70">
                            {it.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}