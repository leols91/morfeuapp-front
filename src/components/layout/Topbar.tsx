"use client";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { TenantSwitcher } from "./TenantSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Breadcrumbs } from "./Breadcrumbs";

export function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b px-4 md:px-6 border-subtle bg-white dark:bg-[#0F172A]">
      {/* ESQUERDA: menu + breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenMenu}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border-subtle"
          aria-label="Abrir menu"
          title="Abrir menu"
        >
          ☰
        </button>
        {/* Breadcrumbs (desktop) */}
        <Breadcrumbs className="hidden md:block" />
        {/* Nome curto no mobile para não poluir */}
        <div className="md:hidden font-semibold ml-1 truncate">MorfeuApp</div>
      </div>

      {/* DIREITA: tema + separador + tenant + sair */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* separador vertical */}
        <span
          aria-hidden
          className="mx-1 h-6 w-px bg-gray-200 dark:bg-white/15"
        />
        {/* TenantSwitcher sempre à direita */}
        <div className="min-w-[200px]">
          <TenantSwitcher />
        </div>
        <Button
          variant="outline"
          onClick={logout}
          className="hidden sm:inline-flex"
        >
          Sair
        </Button>
      </div>
    </header>
  );
}