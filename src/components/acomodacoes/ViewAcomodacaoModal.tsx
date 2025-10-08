"use client";
import * as React from "react";
import ModalBase from "@/components/ui/ModalBase";
import type { AcomodacaoDTO } from "@/types/acomodacao";
import { Button } from "@/components/ui/Button";

export function ViewAcomodacaoModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: AcomodacaoDTO | null;
}) {
  if (!open || !item) return null;

  const money = (v?: number | null) =>
    (typeof v === "number" ? v : 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const typeLabel = item.type === "room" ? "Quarto privado" : "Cama/Dormitório";

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-2xl">
        {/* Header */}
        <ModalBase.Header>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-subtle/60 bg-black/5 px-2.5 py-0.5 text-xs opacity-80 dark:bg-white/5">
                  {typeLabel}
                </span>
                <StatusBadge status={item.status} />
                {item.externalCode ? (
                  <span className="inline-flex items-center rounded-full border border-subtle/60 bg-black/5 px-2.5 py-0.5 text-xs opacity-80 dark:bg-white/5">
                    Código: {item.externalCode}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] opacity-60">ID: {item.id}</p>
            </div>
          </div>
        </ModalBase.Header>

        {/* Body */}
        <ModalBase.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Box label="Capacidade" mono>
              {item.capacity ?? "—"}
            </Box>
            <Box label="Preço base" mono>
              {money(item.basePrice)}
            </Box>

            <Box label="Tipo">{typeLabel}</Box>
            <Box label="Status">
              <StatusBadge status={item.status} />
            </Box>

            <div className="md:col-span-2">
              <div className="text-xs opacity-70">Amenidades</div>
              {item.amenities?.length ? (
                <div className="mt-1 flex flex-wrap gap-2">
                  {item.amenities.map((a, i) => (
                    <span
                      key={`${a}-${i}`}
                      className="inline-flex items-center rounded-full border border-subtle/60 bg-black/5 px-2.5 py-0.5 text-xs dark:bg-white/5"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-1">—</div>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="text-xs opacity-70">Descrição</div>
              <div className="mt-1 leading-relaxed">{item.description || "—"}</div>
            </div>
          </div>
        </ModalBase.Body>

        {/* Footer */}
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}

function Box({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-xs opacity-70">{label}</div>
      <div className={["mt-1", mono ? "tabular-nums" : ""].join(" ")}>{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: AcomodacaoDTO["status"] }) {
  const map: Record<AcomodacaoDTO["status"], string> = {
    available:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    occupied:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    maintenance:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  };
  const label =
    status === "available" ? "Disponível" : status === "occupied" ? "Ocupado" : "Manutenção";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-[0_1px_0_0_rgba(0,0,0,0.03)]",
        map[status],
      ].join(" ")}
    >
      {label}
    </span>
  );
}