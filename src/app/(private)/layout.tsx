"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!user) return <div className="p-8">Redirecionando...</div>;

  return (
    <div className="min-h-screen bg-app">
      {/* Desktop: exatamente como no 2º zip */}
      <div className="hidden md:grid grid-cols-[16rem_1fr] min-h-screen">
        <Sidebar />
        <main className="flex min-h-screen flex-col">
          <Topbar />
          <div className="container-page">{children}</div>
        </main>
      </div>

      {/* Mobile: topbar + drawer, conteúdo abaixo */}
      <div className="md:hidden min-h-screen">
        <Topbar onOpenMenu={() => setOpen(true)} />
        <MobileDrawer open={open} onClose={() => setOpen(false)}>
          <Sidebar />
        </MobileDrawer>
        <div className="container-page">{children}</div>
      </div>
    </div>
  );
}