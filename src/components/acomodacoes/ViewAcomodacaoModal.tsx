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
  const money = (v?: number | null) => (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Detalhes da acomodação</h3>
          <p className="text-xs opacity-70 mt-0.5">ID: {item.id}</p>
        </ModalBase.Header>

        <ModalBase.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Box label="Nome">{item.name}</Box>
            <Box label="Tipo">{item.type === "room" ? "Quarto privado" : "Cama/Dormitório"}</Box>
            <Box label="Capacidade" mono>{item.capacity ?? "—"}</Box>
            <Box label="Preço base" mono>{money(item.basePrice)}</Box>
            <Box label="Status">
              {item.status === "available" ? "Disponível" : item.status === "occupied" ? "Ocupado" : "Manutenção"}
            </Box>
            <Box label="Código externo">{item.externalCode ?? "—"}</Box>

            <div className="md:col-span-2">
              <div className="text-xs opacity-70">Amenidades</div>
              <div className="mt-1">{item.amenities?.length ? item.amenities.join(", ") : "—"}</div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs opacity-70">Descrição</div>
              <div className="mt-1">{item.description || "—"}</div>
            </div>
          </div>
        </ModalBase.Body>

        <ModalBase.Footer className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
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