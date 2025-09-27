"use client";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { TenantSwitcher } from "./TenantSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, logout } = useAuth();
  return (
    <header className="flex h-16 items-center justify-between border-b px-4 md:px-6 border-subtle bg-white dark:bg-[#0F172A]">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenMenu}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border-subtle"
          aria-label="Abrir menu"
          title="Abrir menu"
        >
          ☰
        </button>
        <div className="hidden md:block">
          <TenantSwitcher />
        </div>
        <div className="md:hidden font-semibold ml-1">MorfeuApp</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <TenantSwitcher />
        </div>
        <ThemeToggle />
        <Button variant="outline" onClick={logout} className="hidden sm:inline-flex">Sair</Button>
      </div>
    </header>
  );
}