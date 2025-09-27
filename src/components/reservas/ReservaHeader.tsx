// src/components/reservas/ReservaHeader.tsx
"use client";
import { StatusBadge } from "./StatusBadge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ReservaHeader(props: {
  hospede: string;
  inicio: string;
  fim: string;
  acomodacao: string;
  status: import("@/types/reserva").ReservaStatus;
  saldo: number;
}) {
  return (
    <div className="surface">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{props.hospede}</h1>
          <div className="text-sm opacity-80 mt-1">
            {format(parseISO(props.inicio), "dd/MM/yyyy", { locale: ptBR })} — {format(parseISO(props.fim), "dd/MM/yyyy", { locale: ptBR })} · {props.acomodacao}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={props.status} />
          <div className="rounded-xl px-3 py-1 border-subtle border text-sm">
            Saldo: <span className="font-semibold">{formatBRL(props.saldo)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}