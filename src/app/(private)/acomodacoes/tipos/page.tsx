"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { listRoomTypes, deleteRoomType } from "@/services/acomodacoes";
import type { RoomTypeDTO } from "@/services/acomodacoes";
import { getActivePousadaId } from "@/lib/tenants";
import toast from "react-hot-toast";

export default function RoomTypesListPage() {
  const qc = useQueryClient();
  const [pousadaId, setPousadaId] = React.useState<string | null>(null);
  React.useEffect(() => setPousadaId(getActivePousadaId()), []);

  const rtQ = useQuery<RoomTypeDTO[]>({
    queryKey: ["roomTypes", pousadaId],
    queryFn: () => listRoomTypes(pousadaId ?? undefined),
    enabled: !!pousadaId,
    refetchOnWindowFocus: false,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await deleteRoomType(id);
    },
    onSuccess: () => {
      toast.success("Tipo de quarto removido.");
      qc.invalidateQueries({ queryKey: ["roomTypes"] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Falha ao remover tipo.");
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tipos de quarto</h1>
        <Link href={"/acomodacoes/tipos/novo" as Route}>
          <Button>Novo tipo</Button>
        </Link>
      </div>

      <div className="surface">
        {rtQ.isLoading ? (
          <div className="p-6 text-sm opacity-70">Carregando…</div>
        ) : (rtQ.data?.length ?? 0) === 0 ? (
          <div className="p-6 text-sm opacity-70">Nenhum tipo cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase opacity-70">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Modo</th>
                  <th className="text-left p-3">Capacidade (base / máx.)</th>
                  <th className="text-right p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rtQ.data?.map((rt) => (
                  <tr key={rt.id} className="border-t border-subtle">
                    <td className="p-3">{rt.name}</td>
                    <td className="p-3">
                      {rt.occupancyMode === "shared" ? "Compartilhado" : "Privado"}
                    </td>
                    <td className="p-3">
                      {rt.baseOccupancy} / {rt.maxOccupancy}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/acomodacoes/tipos/${rt.id}/editar` as Route}>
                          <Button size="sm" variant="outline">Editar</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Remover "${rt.name}"?`)) del.mutate(rt.id);
                          }}
                          disabled={del.isPending}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}