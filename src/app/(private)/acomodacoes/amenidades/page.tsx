"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import {
  listAmenities,
  deleteAmenity,
  type AmenityDTO,
} from "@/services/acomodacoes";
import { getActivePousadaId } from "@/lib/tenants";
import AcomodacoesMenu from "@/components/acomodacoes/AcomodacoesMenu";
import toast from "react-hot-toast";

export default function AmenidadesListPage() {
  const [pousadaId, setPousadaId] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");

  React.useEffect(() => setPousadaId(getActivePousadaId()), []);

  const amenitiesQ = useQuery<AmenityDTO[]>({
    queryKey: ["amenities", pousadaId],
    queryFn: () => listAmenities(pousadaId ?? ""),
    enabled: !!pousadaId,
    refetchOnWindowFocus: false,
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteAmenity(id),
    onSuccess: () => {
      toast.success("Comodidade excluída.");
      amenitiesQ.refetch();
    },
    onError: () => toast.error("Falha ao excluir."),
  });

  const items = (amenitiesQ.data ?? []).filter((a) =>
    a.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">Comodidades</h1>
        <AcomodacoesMenu />
      </div>

      <div className="surface-2 flex items-end justify-between gap-3">
        <div className="max-w-sm">
          <Field label="Buscar">
            <Input
              placeholder="Ex.: Ar-condicionado"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Field>
        </div>
        <Link href={"/acomodacoes/amenidades/nova" as Route}>
          <Button>Nova comodidade</Button>
        </Link>
      </div>

      <div className="surface">
        {amenitiesQ.isLoading ? (
          <div className="p-6 text-sm opacity-70">Carregando…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm opacity-70">Nenhuma comodidade.</div>
        ) : (
          <ul className="divide-y divide-gray-100/70 dark:divide-white/10">
            {items.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"
              >
                <div className="font-medium">{a.name}</div>
                <div className="flex gap-2">
                  <Link href={`/acomodacoes/amenidades/${a.id}` as Route}>
                    <Button variant="outline" size="sm">Editar</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Excluir "${a.name}"?`)) del.mutate(a.id);
                    }}
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