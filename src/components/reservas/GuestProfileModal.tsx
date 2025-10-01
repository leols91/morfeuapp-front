// src/components/reservas/GuestProfileModal.tsx
"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";

type Hospede = {
  nome: string;
  telefone: string | null;
  email: string | null;
  doc: string | null;
};

type ReservaResumo = {
  periodo: string;
  acomodacao: string;
  status: string;
  saldo: number;
  idReserva: string;
  criadoEm: string;
  atualizadoEm: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  hospede: Hospede;
  reservaResumo: ReservaResumo;
};

export function GuestProfileModal({ open, onClose, hospede, reservaResumo }: Props) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const money = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDateHM = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString("pt-BR");
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${date}, ${time}`;
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "confirmed":   return "Confirmada";
      case "pending":     return "Pendente";
      case "checked_in":  return "Hospedado";
      case "checked_out": return "Finalizada";
      case "cancelled":
      case "canceled":    return "Cancelada";
      case "no_show":     return "No-show";
      default:            return s;
    }
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <>
      {/* Overlay único com blur — cobre 100% sem falha no topo */}
      <div
        className="fixed inset-0 z-[10000]"
        role="dialog"
        aria-modal="true"
        onClick={onClose} // clique fora fecha
      >
        <div className="absolute inset-0 bg-black/50 supports-[backdrop-filter]:bg-black/30 supports-[backdrop-filter]:backdrop-blur-[2px]" />
        <div className="relative min-h-full grid place-items-center p-4 overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          <div
            onClick={stop}
            className="w-full max-w-4xl rounded-2xl border border-subtle bg-white dark:bg-[#0F172A] shadow-soft"
          >
            {/* Cabeçalho */}
            <div className="px-6 py-5 border-b border-subtle">
              <h3 className="text-2xl font-semibold">Ficha do hóspede</h3>
              <p className="text-sm opacity-70 mt-1">{hospede.nome}</p>
            </div>

            {/* Corpo */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados do hóspede */}
                <section className="rounded-2xl border border-subtle p-5">
                  <h4 className="text-lg font-semibold mb-4">Dados do hóspede</h4>
                  <Dl>
                    <Dt>Nome</Dt><Dd>{hospede.nome}</Dd>
                    <Dt>Telefone</Dt><Dd>{hospede.telefone ?? "—"}</Dd>
                    <Dt>E-mail</Dt><Dd>{hospede.email ?? "—"}</Dd>
                    <Dt>Documento</Dt><Dd>{hospede.doc ?? "—"}</Dd>
                  </Dl>
                </section>

                {/* Reserva atual */}
                <section className="rounded-2xl border border-subtle p-5">
                  <h4 className="text-lg font-semibold mb-4">Reserva atual</h4>
                  <Dl>
                    <Dt>Período</Dt><Dd>{reservaResumo.periodo}</Dd>
                    <Dt>Acomodação</Dt><Dd>{reservaResumo.acomodacao}</Dd>
                    <Dt>Status</Dt><Dd>{statusLabel(reservaResumo.status)}</Dd>
                    <Dt>Saldo</Dt><Dd className="tabular-nums">{money(reservaResumo.saldo)}</Dd>
                    <Dt>ID Reserva</Dt><Dd>{reservaResumo.idReserva}</Dd>
                    <Dt>Criada em</Dt><Dd>{formatDateHM(reservaResumo.criadoEm)}</Dd>
                    {reservaResumo.atualizadoEm && (
                      <>
                        <Dt>Atualizada em</Dt>
                        <Dd>{formatDateHM(reservaResumo.atualizadoEm)}</Dd>
                      </>
                    )}
                  </Dl>
                </section>
              </div>
            </div>

            {/* Rodapé */}
            <div className="px-6 py-4 border-t border-subtle flex justify-end">
              <button
                type="button"
                className="rounded-2xl border border-subtle px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                onClick={onClose}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Helpers visuais */
function Dl({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-[140px_1fr] gap-y-3 items-baseline">{children}</dl>;
}
function Dt({ children }: { children: React.ReactNode }) {
  return <dt className="text-sm opacity-70">{children}</dt>;
}
function Dd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <dd className={["text-sm", className].filter(Boolean).join(" ")}>{children}</dd>;
}