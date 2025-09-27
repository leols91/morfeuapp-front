"use client";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReservaById, postCheckIn, postCheckOut, cancelReserva } from "@/services/reservas";
import { ReservaHeader } from "@/components/reservas/ReservaHeader";
import { ReservaActions } from "@/components/reservas/ReservaActions";
import { FolioEntries, FolioPayments, FolioSummary } from "@/components/reservas/FolioSummary";
import { CheckInOutModal } from "@/components/reservas/CheckInOutModal";
import { CancelReservaModal } from "@/components/reservas/CancelReservaModal";
import React from "react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function ReservaDetalhePage() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reserva", params.id],
    queryFn: () => getReservaById(params.id),
  });

  // estado dos modais
  const [openCI, setOpenCI] = React.useState<false | "checkin" | "checkout">(false);
  const [openCancel, setOpenCancel] = React.useState(false);

  const mCheckIn = useMutation({
  mutationFn: (body: Parameters<typeof postCheckIn>[1]) => postCheckIn(params.id, body),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["reserva", params.id] });
    toast.success("Check-in realizado com sucesso!");
  },
  onError: () => toast.error("Falha ao realizar check-in."),
  });

  const mCheckOut = useMutation({
    mutationFn: (body: Parameters<typeof postCheckOut>[1]) => postCheckOut(params.id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reserva", params.id] });
      toast.success("Check-out realizado com sucesso!");
    },
    onError: () => toast.error("Falha ao realizar check-out."),
  });

  const mCancel = useMutation({
    mutationFn: (body: Parameters<typeof cancelReserva>[1]) => cancelReserva(params.id, body!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reserva", params.id] });
      toast.success("Reserva cancelada.");
    },
    onError: () => toast.error("Falha ao cancelar reserva."),
  });

  if (isLoading) return <div className="surface">Carregando reserva…</div>;
  if (isError || !data) return <div className="surface">Erro ao carregar a reserva.</div>;

  const periodo = `${toBR(data.inicio)} — ${toBR(data.fim)}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <ReservaHeader
        hospede={data.hospedeNome}
        inicio={data.inicio}
        fim={data.fim}
        acomodacao={data.acomodacao}
        status={data.status}
        saldo={data.folio.saldo}
      />

      {/* Ações */}
      <ReservaActions
        status={data.status}
        onOpenCheckIn={() => setOpenCI("checkin")}
        onOpenCheckOut={() => setOpenCI("checkout")}
        onOpenCancel={() => setOpenCancel(true)}
      />

      {/* Grid principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <FolioSummary saldo={data.folio.saldo} />
          <FolioEntries entries={data.folio.entries} />
          <FolioPayments payments={data.folio.payments} />
        </div>
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
        {/* Modal Check-in/out */}
          <CheckInOutModal
            open={!!openCI}
            mode={openCI === "checkout" ? "checkout" : "checkin"}
            onClose={() => setOpenCI(false)}
            onConfirm={async (payload) => {
              if (openCI === "checkout") await mCheckOut.mutateAsync(payload);
              else await mCheckIn.mutateAsync(payload);
            }}
            hospede={data.hospedeNome}
            periodo={periodo}
            acomodacao={data.acomodacao}
          />

          {/* Modal Cancelamento */}
          <CancelReservaModal
            open={openCancel}
            onClose={() => setOpenCancel(false)}
            onConfirm={async (p) => { await mCancel.mutateAsync(p); }}
            hospede={data.hospedeNome}
            periodo={periodo}
            acomodacao={data.acomodacao}
          />
        </div>
      </div> 
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR");
}

function toBR(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}