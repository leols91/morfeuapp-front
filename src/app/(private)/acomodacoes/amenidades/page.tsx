"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { getActivePousadaId } from "@/lib/tenants";
import {
  listAmenities,
  deleteAmenity,
  type AmenityDTO,
} from "@/services/acomodacoes";
import toast from "react-hot-toast";

export default function AmenidadesPage() {
  const qc = useQueryClient();
  const pousadaId = getActivePousadaId();

  const [q, setQ] = React.useState("");

  const amenidadesQ = useQuery<AmenityDTO[]>({
    queryKey: ["amenities", pousadaId],
    queryFn: async () => {
      if (!pousadaId) return [];
      const list = await listAmenities(pousadaId);
      return list;
    },
    enabled: !!pousadaId,
    refetchOnWindowFocus: false,
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      await deleteAmenity(id);
    },
    onSuccess: () => {
      toast.success("Comodidade excluída.");
      qc.invalidateQueries({ queryKey: ["amenities", pousadaId] });
    },
    onError: () => toast.error("Falha ao excluir comodidade."),
  });

  const filtered = React.useMemo(() => {
    const items = amenidadesQ.data ?? [];
    if (!q) return items;
    const s = q.toLowerCase();
    return items.filter((a) => a.name.toLowerCase().includes(s));
  }, [amenidadesQ.data, q]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Comodidades</h1>
        <Link href={"/acomodacoes/amenidades/nova" as Route}>
          <Button>Nova comodidade</Button>
        </Link>
      </div>

      <div className="surface-2">
        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-12 md:col-span-4">
            <Field label="Buscar">
              <Input
                placeholder="Nome…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="surface">
        {amenidadesQ.isLoading ? (
          <div className="p-6 text-sm opacity-70">Carregando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm opacity-70">Nenhuma comodidade encontrada.</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {filtered.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"
              >
                <div className="text-sm">{a.name}</div>
                <div className="flex items-center gap-2">
                  <Link href={`/acomodacoes/amenidades/${a.id}/editar` as Route}>
                    <Button size="sm" variant="outline">Editar</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => excluir.mutate(a.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}