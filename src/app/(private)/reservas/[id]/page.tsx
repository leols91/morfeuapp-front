// src/app/(private)/reservas/[id]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDateTime, toBR } from "@/lib/format";
import {
  getReservaById,
  postCheckIn,
  postCheckOut,
  cancelReserva,
  updateReservaDates,
  changeAcomodacao,
  addCharge,
  updateFolioEntry,
  deleteFolioEntry,
  listAcomodacoes,
  listProducts,
  listServices,
} from "@/services/reservas";
import type { FolioEntry } from "@/types/reserva";
import { ReservaHeader } from "@/components/reservas/ReservaHeader";
import { ReservaActions } from "@/components/reservas/ReservaActions";
import { FolioPayments, FolioSummary } from "@/components/reservas/FolioSummary";
import { CheckInOutModal } from "@/components/reservas/CheckInOutModal";
import { CancelReservaModal } from "@/components/reservas/CancelReservaModal";
import React from "react";
import toast from "react-hot-toast";
import { EditDatesModal } from "@/components/reservas/EditDatesModal";
import { ChangeAcomodacaoModal } from "@/components/reservas/ChangeAcomodacaoModal";
import { AddChargeModal } from "@/components/reservas/AddChargeModal";
import { EditFolioEntryModal } from "@/components/reservas/EditFolioEntryModal";
import { ViewFolioEntryModal } from "@/components/reservas/ViewFolioEntryModal";

import { ReservaToolbar } from "@/components/reservas/ReservaToolbar";
import { FolioEntriesTable } from "@/components/reservas/FolioEntriesTable";
import { ReservaRightColumn } from "@/components/reservas/ReservaRightColumn";
import { GuestProfileModal } from "@/components/reservas/GuestProfileModal";

export default function ReservaDetalhePage() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reserva", params.id],
    queryFn: () => getReservaById(params.id),
  });

  // estados de modais
  const [openCI, setOpenCI] = React.useState<false | "checkin" | "checkout">(false);
  const [openCancel, setOpenCancel] = React.useState(false);
  const [openEditDates, setOpenEditDates] = React.useState(false);
  const [openChangeAcom, setOpenChangeAcom] = React.useState(false);
  const [openAddCharge, setOpenAddCharge] = React.useState(false);
  const [openEditEntry, setOpenEditEntry] = React.useState(false);
  const [openViewEntry, setOpenViewEntry] = React.useState(false);
  const [entryEditing, setEntryEditing] = React.useState<FolioEntry | null>(null);
  const [entryViewing, setEntryViewing] = React.useState<FolioEntry | null>(null);
  const [openGuest, setOpenGuest] = React.useState(false);

  const acomQ = useQuery({ queryKey: ["acomodacoes"], queryFn: listAcomodacoes });
  const prodQ = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const svcQ  = useQuery({ queryKey: ["services"],  queryFn: listServices  });

  const mCheckIn = useMutation({
    mutationFn: (body: Parameters<typeof postCheckIn>[1]) => postCheckIn(params.id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reserva", params.id] }); toast.success("Check-in realizado com sucesso!"); },
    onError: () => toast.error("Falha ao realizar check-in."),
  });
  const mCheckOut = useMutation({
    mutationFn: (body: Parameters<typeof postCheckOut>[1]) => postCheckOut(params.id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reserva", params.id] }); toast.success("Check-out realizado com sucesso!"); },
    onError: () => toast.error("Falha ao realizar check-out."),
  });
  const mCancel = useMutation({
    mutationFn: (body: Parameters<typeof cancelReserva>[1]) => cancelReserva(params.id, body!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reserva", params.id] }); toast.success("Reserva cancelada."); },
    onError: () => toast.error("Falha ao cancelar reserva."),
  });
  const mUpdateDates = useMutation({
    mutationFn: (checkOut: string) => updateReservaDates(params.id, { checkOut }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reserva", params.id] }); toast.success("Data de saída atualizada."); },
    onError: () => toast.error("Falha ao atualizar data."),
  });
  const mChangeAcom = useMutation({
    mutationFn: (body: Parameters<typeof changeAcomodacao>[1]) => changeAcomodacao(params.id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reserva", params.id] }); toast.success("Acomodação alterada."); },
    onError: () => toast.error("Falha ao trocar acomodação."),
  });
  const mAddCharge = useMutation({
    mutationFn: (payload: Parameters<typeof addCharge>[1]) => addCharge(params.id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reserva", params.id] }); toast.success("Lançamento criado."); },
    onError: () => toast.error("Falha ao lançar."),
  });
  const mUpdEntry = useMutation({
    mutationFn: (payload: { id: string; description?: string; amount?: number }) => updateFolioEntry(params.id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reserva", params.id] }); toast.success("Lançamento atualizado."); },
    onError: () => toast.error("Falha ao atualizar lançamento."),
  });
  const mDelEntry = useMutation({
    mutationFn: (entryId: string) => deleteFolioEntry(params.id, entryId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reserva", params.id] }); toast.success("Lançamento excluído."); },
    onError: () => toast.error("Falha ao excluir lançamento."),
  });

  if (isLoading) return <div className="surface">Carregando reserva…</div>;
  if (isError || !data) return <div className="surface">Erro ao carregar a reserva.</div>;

  const periodo = `${toBR(data.inicio)} — ${toBR(data.fim)}`;

  return (
    <div className="space-y-4">
      <ReservaHeader
        hospede={data.hospedeNome}
        inicio={data.inicio}
        fim={data.fim}
        acomodacao={data.acomodacao}
        status={data.status}
        saldo={data.folio.saldo}
      />

      <ReservaActions
        status={data.status}
        onOpenCheckIn={() => setOpenCI("checkin")}
        onOpenCheckOut={() => setOpenCI("checkout")}
        onOpenCancel={() => setOpenCancel(true)}
      />

      <ReservaToolbar
        onOpenEditDates={() => setOpenEditDates(true)}
        onOpenChangeAcom={() => setOpenChangeAcom(true)}
        onOpenAddCharge={() => setOpenAddCharge(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <FolioSummary saldo={data.folio.saldo} />

          <FolioEntriesTable
            entries={data.folio.entries}
            onView={(e) => { setEntryViewing(e); setOpenViewEntry(true); }}
            onEdit={(e) => { setEntryEditing(e); setOpenEditEntry(true); }}
            onDelete={(id) => mDelEntry.mutate(id)}
          />

          <FolioPayments payments={data.folio.payments} />
        </div>

        {/* coluna da direita */}
        <div className="space-y-4">
          <ReservaRightColumn
            hospedeNome={data.hospedeNome}
            contatoHospede={data.contatoHospede}
            canal={data.canal}
            acomodacao={data.acomodacao}
            criadoEm={data.criadoEm}
            atualizadoEm={data.atualizadoEm}
            id={data.id}
            onOpenGuestProfile={() => setOpenGuest(true)}
          />
        </div>
      </div>

      {/* ===== Modais ===== */}
      <CheckInOutModal
        open={!!openCI}
        mode={openCI === "checkout" ? "checkout" : "checkin"}
        onClose={() => setOpenCI(false)}
        onConfirm={async (payload) => { if (openCI === "checkout") await mCheckOut.mutateAsync(payload); else await mCheckIn.mutateAsync(payload); }}
        hospede={data.hospedeNome}
        periodo={periodo}
        acomodacao={data.acomodacao}
      />
      <CancelReservaModal
        open={openCancel}
        onClose={() => setOpenCancel(false)}
        onConfirm={async (p) => { await mCancel.mutateAsync(p); }}
        hospede={data.hospedeNome}
        periodo={periodo}
        acomodacao={data.acomodacao}
      />
      <EditDatesModal
        open={openEditDates}
        onClose={() => setOpenEditDates(false)}
        currentCheckOut={data.fim}
        minDate={data.inicio.slice(0, 10)}
        onConfirm={async (d) => { await mUpdateDates.mutateAsync(d); }}
      />
      <ChangeAcomodacaoModal
        open={openChangeAcom}
        onClose={() => setOpenChangeAcom(false)}
        options={acomQ.data ?? []}
        currentLabel={data.acomodacao}
        onConfirm={async (payload) => { await mChangeAcom.mutateAsync(payload); }}
      />
      <AddChargeModal
        open={openAddCharge}
        onClose={() => setOpenAddCharge(false)}
        products={prodQ.data ?? []}
        services={svcQ.data ?? []}
        onConfirm={async (payload) => { await mAddCharge.mutateAsync(payload); }}
      />
      <EditFolioEntryModal
        open={openEditEntry}
        onClose={() => setOpenEditEntry(false)}
        entry={entryEditing}
        onConfirm={async (p) => { await mUpdEntry.mutateAsync(p); }}
        onDelete={async (id) => { await mDelEntry.mutateAsync(id); }}
      />
      <ViewFolioEntryModal
        open={openViewEntry}
        onClose={() => setOpenViewEntry(false)}
        entry={entryViewing}
      />

      <GuestProfileModal
        open={openGuest}
        onClose={() => setOpenGuest(false)}
        hospede={{
          nome: data.hospedeNome,
          telefone: data.contatoHospede?.telefone ?? null,
          email: data.contatoHospede?.email ?? null,
          doc: data.contatoHospede?.doc ?? null,
        }}
        reservaResumo={{
          periodo,
          acomodacao: data.acomodacao,
          status: data.status,
          saldo: data.folio.saldo,
          idReserva: data.id,
          criadoEm: data.criadoEm,
          atualizadoEm: data.atualizadoEm ?? null,
        }}
      />
    </div>
  );
}