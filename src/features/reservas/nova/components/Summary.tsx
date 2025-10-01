"use client";
import * as React from "react";
import type { AcomodacaoOption } from "@/types/reserva";
import { safeToBR, labelAcomodacao, formatBRL } from "../helpers";

type Props = {
  hospedeNome?: string | null;
  checkIn?: string;
  checkOut?: string;
  alvo?: string;
  acomList?: AcomodacaoOption[];
  nights: number;
  rate?: number | null;
  total?: number | null;
};

export function Summary({
  hospedeNome,
  checkIn,
  checkOut,
  alvo,
  acomList,
  nights,
  rate,
  total,
}: Props) {
  return (
    <div className="grid grid-cols-12 gap-4 items-center">
      <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-wrap gap-2">
        <Chip>Hóspede: <b>{hospedeNome ?? "—"}</b></Chip>
        <Chip>Período: <b>{safeToBR(checkIn)} → {safeToBR(checkOut)}</b></Chip>
        <Chip>Acomodação: <b>{labelAcomodacao(acomList, alvo)}</b></Chip>

        {typeof total === "number" ? (
          <Chip>
            Valor previsto: <b>{formatBRL(total)}</b>
            {typeof rate === "number" && nights > 0 && (
              <span className="opacity-70"> ({nights} {nights === 1 ? "noite" : "noites"} × {formatBRL(rate)})</span>
            )}
          </Chip>
        ) : (
          <Chip className="opacity-70">Valor previsto: <b>—</b></Chip>
        )}
      </div>
    </div>
  );
}

function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border-subtle border px-3 py-1 text-sm ${className}`}>
      {children}
    </div>
  );
}