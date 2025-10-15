"use client";

import * as React from "react";
import { useFormContext, FieldErrors } from "react-hook-form";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";
import { Button } from "@/components/ui/Button";
import ModalBase from "@/components/ui/ModalBase";
import type { StatusOpt, RoomType } from "./types";
import { getActivePousadaId } from "@/lib/tenants";
import {
  listAmenities,
  createAmenity,
  addAmenityToRoomType,
  type AmenityDTO,
} from "@/services/acomodacoes";
import toast from "react-hot-toast";

type QuartoFormProps = {
  pousadaId: string | null;
  roomTypesQ: {
    data?: (RoomType & { amenities?: { amenity: AmenityDTO }[] })[];
    isLoading: boolean;
    isError: boolean;
    refetch?: () => void; // ← opcional, se o caller passar de react-query
  };
  roomStatusesQ: { data?: StatusOpt[]; isLoading: boolean; isError: boolean };
  hkStatusesQ: { data?: StatusOpt[]; isLoading: boolean; isError: boolean };
  loadingOpts?: boolean;
  mode: "create" | "edit";
  refetchRoomTypes?: () => void; // ← opcional também
};

/** Campos que este form manipula (para tipar o RHF) */
type QuartoFormFields = {
  roomTypeId: string;
  code: string;
  roomName?: string;
  floor?: string;
  description?: string;
  roomStatusCode: string;
  housekeepingStatusCode: string;
  amenities?: string;
  baseOccupancy?: number;
  maxOccupancy?: number;
};

export function QuartoForm({
  pousadaId,
  roomTypesQ,
  roomStatusesQ,
  hkStatusesQ,
  refetchRoomTypes,
}: QuartoFormProps) {
  const form = useFormContext<QuartoFormFields>();

  const err = <K extends keyof QuartoFormFields>(k: K): string | undefined => {
    const e = (form.formState.errors as FieldErrors<QuartoFormFields>)[k];
    return (e as any)?.message as string | undefined;
  };

  // tipo selecionado — p/ placeholders + amenities
  const selectedRoomType = React.useMemo(() => {
    const idSel = form.getValues("roomTypeId");
    return (roomTypesQ.data ?? []).find((t) => t.id === idSel);
  }, [roomTypesQ.data, form.watch("roomTypeId")]);

  // ======= Amenities Modal state =======
  const [amenityModal, setAmenityModal] = React.useState(false);
  const [amenities, setAmenities] = React.useState<AmenityDTO[]>([]);
  const [loadingAm, setLoadingAm] = React.useState(false);
  const [pousada, setPousada] = React.useState<string | null>(pousadaId);

  React.useEffect(() => {
    if (!pousada) setPousada(getActivePousadaId());
  }, [pousada]);

  async function openAmenityModal() {
    setAmenityModal(true);
    if (!pousada) return;
    setLoadingAm(true);
    try {
      const list = await listAmenities(pousada);
      setAmenities(list ?? []);
    } catch {
      toast.error("Falha ao carregar comodidades.");
    } finally {
      setLoadingAm(false);
    }
  }

  async function handleAddAmenity(params: { existingAmenityId?: string; newAmenityName?: string }) {
    try {
      const rtId = selectedRoomType?.id;
      if (!rtId) {
        toast.error("Selecione um tipo de quarto antes.");
        return;
      }
      let amenityId = params.existingAmenityId;

      // cria nova se necessário
      if (!amenityId) {
        const name = (params.newAmenityName ?? "").trim();
        if (!pousada || !name) {
          toast.error("Informe o nome da nova comodidade.");
          return;
        }
        const created = await createAmenity(pousada, name);
        amenityId = created?.id ?? created; // backend pode devolver data{id}
      }

      if (!amenityId) throw new Error("ID de comodidade ausente.");

      await addAmenityToRoomType(rtId, amenityId);
      toast.success("Comodidade vinculada ao tipo.");

      // refetch roomTypes (atualiza a lista visual)
      refetchRoomTypes?.();
      roomTypesQ.refetch?.();

      setAmenityModal(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Falha ao vincular comodidade.");
    }
  }

  // helper para chips de amenities do tipo
  const chips = (selectedRoomType?.amenities ?? []).map((ra) => ra.amenity);

  // ======= UI =======
  return (
    <>
      {/* BLOCO 1 - dados básicos */}
      <div className="surface-2">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3">
            <Field label="Tipo de quarto" error={err("roomTypeId")}>
              <Select
                {...form.register("roomTypeId")}
                disabled={!pousadaId || roomTypesQ.isLoading || roomTypesQ.isError}
              >
                <option value="">
                  {!pousadaId
                    ? "Selecione uma pousada…"
                    : roomTypesQ.isLoading
                    ? "Carregando…"
                    : "Selecione…"}
                </option>
                {roomTypesQ.data?.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="col-span-12 md:col-span-2">
            <Field label="Código / Número" error={err("code")}>
              <Input placeholder="Ex.: 101, 202B" {...form.register("code")} />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-5">
            <Field label="Nome do quarto (opcional)">
              <Input
                placeholder="Ex.: Suíte Master, Standard Vista Mar"
                {...form.register("roomName")}
              />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-2">
            <Field label="Andar (opcional)">
              <Input placeholder="Ex.: Térreo, 1, 2, 3…" {...form.register("floor")} />
            </Field>
          </div>
        </div>
      </div>

      {/* BLOCO 2 – Capacidade */}
      <div className="surface-2">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3">
            <Field label="Capacidade base (override)">
              <Input
                type="number"
                min={1}
                placeholder={
                  selectedRoomType?.baseOccupancy
                    ? `Padrão: ${selectedRoomType.baseOccupancy}`
                    : "Deixe em branco para padrão"
                }
                {...form.register("baseOccupancy", { valueAsNumber: true })}
              />
              <div className="text-[11px] opacity-70 mt-1">
                Se vazio, usa o padrão do tipo de quarto.
              </div>
            </Field>
          </div>

          <div className="col-span-12 md:col-span-3">
            <Field label="Capacidade máxima (override)">
              <Input
                type="number"
                min={1}
                placeholder={
                  selectedRoomType?.maxOccupancy
                    ? `Padrão: ${selectedRoomType.maxOccupancy}`
                    : "Deixe em branco para padrão"
                }
                {...form.register("maxOccupancy", { valueAsNumber: true })}
              />
              <div className="text-[11px] opacity-70 mt-1">
                Se vazio, usa o padrão do tipo de quarto.
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* BLOCO 3 – Status */}
      <div className="surface-2">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <Field label="Status do quarto" error={err("roomStatusCode")}>
              <Select
                {...form.register("roomStatusCode")}
                disabled={roomStatusesQ.isLoading || roomStatusesQ.isError}
              >
                <option value="">
                  {roomStatusesQ.isLoading ? "Carregando…" : "Selecione…"}
                </option>
                {roomStatusesQ.data?.map((rs) => (
                  <option key={rs.code} value={rs.code}>
                    {rs.description}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <Field label="Status de governança" error={err("housekeepingStatusCode")}>
              <Select
                {...form.register("housekeepingStatusCode")}
                disabled={hkStatusesQ.isLoading || hkStatusesQ.isError}
              >
                <option value="">
                  {hkStatusesQ.isLoading ? "Carregando…" : "Selecione…"}
                </option>
                {hkStatusesQ.data?.map((hs) => (
                  <option key={hs.code} value={hs.code}>
                    {hs.description}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </div>

      {/* BLOCO 4 – Comodidades do TIPO selecionado */}
      <div className="surface-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Comodidades do tipo de quarto</div>
            <div className="text-[12px] opacity-70">
              As comodidades são cadastradas por pousada e vinculadas ao tipo.
            </div>
          </div>
          <Button
            type="button"
            onClick={openAmenityModal}
            disabled={!selectedRoomType}
          >
            Adicionar comodidade
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {chips.length === 0 ? (
            <div className="text-sm opacity-70">Nenhuma comodidade vinculada a este tipo.</div>
          ) : (
            chips.map((am) => (
              <span
                key={am.id}
                className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/10 px-3 py-1 text-xs"
              >
                {am.name}
              </span>
            ))
          )}
        </div>
      </div>

      {/* BLOCO 5 – Descrição / Amenidades (texto livre) */}
      <div className="surface-2">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7">
            <Field label="Descrição (opcional)">
              <Textarea
                rows={3}
                placeholder="Informações adicionais (vista, observações, etc.)"
                {...form.register("description")}
              />
            </Field>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <Field label="Amenidades (texto livre)">
              <Input
                placeholder="Ar-condicionado, Wi-Fi, TV, Cofre…"
                {...form.register("amenities")}
              />
              <div className="text-[11px] opacity-70 mt-1">
                Campo apenas informativo (não vincula à API).
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* ===== Modal: Adicionar Comodidade ===== */}
      {amenityModal && (
        <ModalBase open={amenityModal} onClose={() => setAmenityModal(false)}>
          <div className="w-[min(92vw,520px)] rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200/70 dark:border-white/10 shadow-soft">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200/70 dark:border-white/10">
              <h3 className="text-sm font-semibold">Adicionar comodidade</h3>
              <button
                type="button"
                onClick={() => setAmenityModal(false)}
                className="rounded-lg px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <AmenityModalContent
              loading={loadingAm}
              amenities={amenities}
              onCreateOrAttach={handleAddAmenity}
              onClose={() => setAmenityModal(false)}
            />
          </div>
        </ModalBase>
      )}
    </>
  );
}

/** Conteúdo do modal (criar OU anexar existente) */
function AmenityModalContent({
  loading,
  amenities,
  onCreateOrAttach,
  onClose,
}: {
  loading: boolean;
  amenities: AmenityDTO[];
  onCreateOrAttach: (p: { existingAmenityId?: string; newAmenityName?: string }) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = React.useState<"existing" | "new">("existing");
  const [existingId, setExistingId] = React.useState("");
  const [newName, setNewName] = React.useState("");

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`px-3 py-1 rounded-full text-sm border ${mode === "existing" ? "bg-black/5 dark:bg-white/10" : ""}`}
        >
          Usar existente
        </button>
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`px-3 py-1 rounded-full text-sm border ${mode === "new" ? "bg-black/5 dark:bg-white/10" : ""}`}
        >
          Criar nova
        </button>
      </div>

      {mode === "existing" ? (
        <Field label="Comodidade existente">
          <select
            value={existingId}
            onChange={(e) => setExistingId(e.target.value)}
            className="w-full rounded-xl border border-gray-200/70 dark:border-white/10 px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
            disabled={loading}
          >
            <option value="">{loading ? "Carregando…" : "Selecione…"}</option>
            {amenities.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </Field>
      ) : (
        <Field label="Nome da nova comodidade">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex.: Cofre"
            className="w-full rounded-xl border border-gray-200/70 dark:border-white/10 px-3 py-2 text-sm bg-white dark:bg-[#0F172A]"
            disabled={loading}
          />
        </Field>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button
          type="button"
          onClick={() =>
            onCreateOrAttach(
              mode === "existing"
                ? { existingAmenityId: existingId || undefined }
                : { newAmenityName: newName || undefined }
            )
          }
          disabled={loading || (mode === "existing" ? !existingId : !newName.trim())}
        >
          {mode === "existing" ? "Vincular" : "Criar e vincular"}
        </Button>
      </div>
    </div>
  );
}