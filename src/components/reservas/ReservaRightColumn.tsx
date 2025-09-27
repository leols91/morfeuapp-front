// src/components/reservas/ReservaRightColumn.tsx
"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  hospedeNome: string;
  contatoHospede?: { telefone?: string; email?: string; doc?: string } | null;
  canal?: string | null;
  acomodacao: string;
  criadoEm: string;
  atualizadoEm?: string | null;
  id: string;
  onOpenGuestProfile?: () => void;
};

export function ReservaRightColumn({
  hospedeNome,
  contatoHospede,
  canal,
  acomodacao,
  criadoEm,
  atualizadoEm,
  id,
  onOpenGuestProfile,
}: Props) {
  const fmt = (iso: string) => new Date(iso).toLocaleString("pt-BR");

  return (
    <div className="space-y-4">{/* <- garante espaçamento consistente entre os cards */}
      <div className="surface-2">
        <h3 className="font-semibold mb-2">Hóspede</h3>
        <div className="text-sm">
          <div><span className="opacity-70">Nome:</span> {hospedeNome}</div>
          {contatoHospede?.telefone && (
            <div><span className="opacity-70">Telefone:</span> {contatoHospede.telefone}</div>
          )}
          {contatoHospede?.email && (
            <div><span className="opacity-70">E-mail:</span> {contatoHospede.email}</div>
          )}
          {contatoHospede?.doc && (
            <div><span className="opacity-70">Doc.:</span> {contatoHospede.doc}</div>
          )}
        </div>
        <div className="mt-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenGuestProfile?.()} // <- chama com segurança
          >
            Ver ficha do hóspede
          </Button>
        </div>
      </div>

      <div className="surface-2">
        <h3 className="font-semibold mb-2">Informações</h3>
        <div className="text-sm space-y-1">
          <div><span className="opacity-70">Canal:</span> {canal ?? "—"}</div>
          <div><span className="opacity-70">Acomodação:</span> {acomodacao}</div>
          <div><span className="opacity-70">Criada em:</span> {fmt(criadoEm)}</div>
          {atualizadoEm && (
            <div><span className="opacity-70">Atualizada em:</span> {fmt(atualizadoEm)}</div>
          )}
          <div><span className="opacity-70">ID:</span> {id}</div>
        </div>
      </div>
    </div>
  );
}