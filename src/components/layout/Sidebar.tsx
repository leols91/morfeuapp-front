"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { cn } from "@/components/ui/cn";

const items: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reservas", label: "Reservas" },
  { href: "/acomodacoes", label: "Acomodações" },
  { href: "/hospedes", label: "Hóspedes" },
  { href: "/estoque", label: "Estoque" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/configuracoes", label: "Configurações" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-full w-64 border-r p-4 border-subtle bg-white dark:bg-[#0F172A]">
      <div className="text-2xl font-bold mb-6">MorfeuApp</div>
      <nav className="space-y-1">
        {items.map((it) => {
          const active = pathname.startsWith(`${it.href}`);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "block rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5",
                active && "bg-brand-50 text-brand-800 dark:bg-white/5 dark:text-white"
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}