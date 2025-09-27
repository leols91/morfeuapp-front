// src/app/(private)/reservas/[id]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReservaById, postCheckIn, postCheckOut, cancelReserva } from "@/services/reservas";
import { ReservaHeader } from "@/components/reservas/ReservaHeader";
import { ReservaActions } from "@/components/reservas/ReservaActions";
import { FolioEntries, FolioPayments, FolioSummary } from "@/components/reservas/FolioSummary";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Route } from "next";

export default function ReservaDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reserva", params.id],
    queryFn: () => getReservaById(params.id),
  });

  const mCheckIn = useMutation({
    mutationFn: () => postCheckIn(params.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reserva", params.id] }),
  });
  const mCheckOut = useMutation({
    mutationFn: () => postCheckOut(params.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reserva", params.id] }),
  });
  const mCancel = useMutation({
    mutationFn: () => cancelReserva(params.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reserva", params.id] }),
  });

  if (isLoading) return <div className="surface">Carregando reserva…</div>;
  if (isError || !data) return <div className="surface">Erro ao carregar a reserva.</div>;

  return (
    <div className="space-y-4">
      {/* Toolbar topo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={"/reservas" as Route} className="text-brand-700 hover:underline dark:text-brand-300">← Voltar</Link>
          <h2 className="text-xl font-semibold">Reserva {data.codigo ? `· ${data.codigo}` : ""}</h2>
        </div>
        <div className="text-sm opacity-70">Criada em {formatDateTime(data.criadoEm)}</div>
      </div>

      {/* Header + ações */}
      <ReservaHeader
        hospede={data.hospedeNome}
        inicio={data.inicio}
        fim={data.fim}
        acomodacao={data.acomodacao}
        status={data.status}
        saldo={data.folio.saldo}
      />

      <ReservaActions
        id={data.id}
        status={data.status}
        onCheckIn={async () => { await mCheckIn.mutateAsync(); }}   // ⬅️ bloco + await
        onCheckOut={async () => { await mCheckOut.mutateAsync(); }} // ⬅️ bloco + await
        onCancel={async () => { await mCancel.mutateAsync(); }}     // ⬅️ bloco + await
      />

      {/* Grade 2 colunas no desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coluna principal */}
        <div className="md:col-span-2 space-y-4">
          <FolioSummary saldo={data.folio.saldo} />
          <FolioEntries entries={data.folio.entries} />
          <FolioPayments payments={data.folio.payments} />
        </div>

        {/* Coluna lateral */}
        <aside className="space-y-4">
          <div className="surface-2">
            <h3 className="font-semibold mb-2">Hóspede</h3>
            <div className="text-sm">
              <div><span className="opacity-70">Nome:</span> {data.hospedeNome}</div>
              {data.contatoHospede?.telefone && <div><span className="opacity-70">Telefone:</span> {data.contatoHospede.telefone}</div>}
              {data.contatoHospede?.email && <div><span className="opacity-70">E-mail:</span> {data.contatoHospede.email}</div>}
              {data.contatoHospede?.doc && <div><span className="opacity-70">Doc.:</span> {data.contatoHospede.doc}</div>}
            </div>
            <div className="mt-3">
              <Button variant="outline" className="w-full">Ver ficha do hóspede</Button>
            </div>
          </div>

          <div className="surface-2">
            <h3 className="font-semibold mb-2">Informações</h3>
            <div className="text-sm space-y-1">
              <div><span className="opacity-70">Canal:</span> {data.canal ?? "—"}</div>
              <div><span className="opacity-70">Acomodação:</span> {data.acomodacao}</div>
              <div><span className="opacity-70">Criada em:</span> {formatDateTime(data.criadoEm)}</div>
              {data.atualizadoEm && <div><span className="opacity-70">Atualizada em:</span> {formatDateTime(data.atualizadoEm)}</div>}
              <div><span className="opacity-70">ID:</span> {data.id}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR");
}