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
  addAmenityToRoom,
  removeAmenityFromRoom,
  getQuarto,
  type AmenityDTO,
  type QuartoDTO,
} from "@/services/acomodacoes";
import toast from "react-hot-toast";

type QuartoFormProps = {
  pousadaId: string | null;
  roomTypesQ: {
    data?: (RoomType & { amenities?: { amenity: AmenityDTO }[] })[];
    isLoading: boolean;
    isError: boolean;
    refetch?: () => void;
  };
  roomStatusesQ: { data?: StatusOpt[]; isLoading: boolean; isError: boolean };
  hkStatusesQ: { data?: StatusOpt[]; isLoading: boolean; isError: boolean };
  loadingOpts?: boolean;
  mode: "create" | "edit";
  /** Necessário para gerenciar amenities override do QUARTO (edit mode) */
  quartoId?: string;

  /** CREATE mode: o parent usa para receber a lista staged */
  onStagedAmenitiesChange?: (ids: string[]) => void;
};

type QuartoFormFields = {
  roomTypeId: string;
  code: string;
  roomName?: string;
  floor?: string;
  description?: string;
  roomStatusCode: string;
  housekeepingStatusCode: string;
  baseOccupancy?: number;
  maxOccupancy?: number;
};

export function QuartoForm({
  pousadaId,
  roomTypesQ,
  roomStatusesQ,
  hkStatusesQ,
  mode,
  quartoId,
  onStagedAmenitiesChange,
}: QuartoFormProps) {
  const form = useFormContext<QuartoFormFields>();
  const err = <K extends keyof QuartoFormFields>(k: K): string | undefined => {
    const e = (form.formState.errors as FieldErrors<QuartoFormFields>)[k];
    return (e as any)?.message as string | undefined;
  };

  // Tipo selecionado
  const selectedRoomType = React.useMemo(() => {
    const idSel = form.getValues("roomTypeId");
    return (roomTypesQ.data ?? []).find((t) => t.id === idSel);
  }, [roomTypesQ.data, form.watch("roomTypeId")]);

  const baseOverride = form.watch("baseOccupancy");
  const maxOverride = form.watch("maxOccupancy");
  const effectiveBase = baseOverride || selectedRoomType?.baseOccupancy || undefined;
  const effectiveMax = maxOverride || selectedRoomType?.maxOccupancy || undefined;

  // ----- AMENITIES QUARTO (edit) & STAGED (create) -----
  const [roomAmenities, setRoomAmenities] = React.useState<AmenityDTO[]>([]); // edit mode (carregado da API)
  const [stagedAmenities, setStagedAmenities] = React.useState<AmenityDTO[]>([]); // create mode (local)
  const canManageRoomAmenities = mode === "edit" && !!quartoId;

  async function refetchRoomAmenities() {
    if (!quartoId) return;
    try {
      const q: QuartoDTO = await getQuarto(quartoId);
      const overrides = (q.amenities ?? []).map((x) => x.amenity);
      setRoomAmenities(overrides);
    } catch {
      /* silencia */
    }
  }

  React.useEffect(() => {
    if (canManageRoomAmenities) refetchRoomAmenities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageRoomAmenities, quartoId]);

  React.useEffect(() => {
    // sobe ids staged para o parent (create flow)
    onStagedAmenitiesChange?.(stagedAmenities.map((a) => a.id));
  }, [stagedAmenities, onStagedAmenitiesChange]);

  // ----- MODAL: listar/criar amenity e anexar (edit) ou "staging" (create) -----
  const [amenityModal, setAmenityModal] = React.useState(false);
  const [amenities, setAmenities] = React.useState<AmenityDTO[]>([]);
  const [loadingAm, setLoadingAm] = React.useState(false);
  const [pousada, setPousada] = React.useState<string | null>(pousadaId);

  React.useEffect(() => {
    if (!pousada) setPousada(getActivePousadaId());
  }, [pousada]);

  async function openAmenityModal() {
    // agora abre tanto em create quanto em edit
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
      // 1) Garante amenityId (cria se for nova)
      let amenityId = params.existingAmenityId;
      if (!amenityId) {
        const name = (params.newAmenityName ?? "").trim();
        if (!pousada || !name) {
          toast.error("Informe o nome da nova comodidade.");
          return;
        }
        const created = await createAmenity(pousada, name);
        amenityId = created?.id ?? created;
      }
      if (!amenityId) throw new Error("ID de comodidade ausente.");

      // 2) Se EDIT: anexa direto na API do quarto
      if (mode === "edit" && quartoId) {
        await addAmenityToRoom(quartoId, amenityId);
        toast.success("Comodidade adicionada ao quarto.");
        await refetchRoomAmenities();
      } else {
        // 3) Se CREATE: apenas "staging" local (já mostra na UI)
        const chosen = (amenities.find((a) => a.id === amenityId) ??
          { id: amenityId, name: params.newAmenityName?.trim() ?? "Amenity" }) as AmenityDTO;

        setStagedAmenities((prev) => {
          if (prev.some((x) => x.id === chosen.id)) return prev; // evita duplicata
          return [...prev, chosen];
        });
        toast.success("Comodidade adicionada (será vinculada ao salvar).");
      }

      setAmenityModal(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Falha ao adicionar comodidade.");
    }
  }

  async function handleRemoveRoomAmenity(amenityId: string) {
    if (mode === "edit" && quartoId) {
      try {
        await removeAmenityFromRoom(quartoId, amenityId);
        toast.success("Comodidade removida do quarto.");
        await refetchRoomAmenities();
      } catch (e: any) {
        toast.error(e?.response?.data?.message ?? "Falha ao remover comodidade.");
      }
    } else {
      // remover do staging (create mode)
      setStagedAmenities((prev) => prev.filter((a) => a.id !== amenityId));
    }
  }

  // Herdadas do tipo
  const inherited = (selectedRoomType?.amenities ?? []).map((ra) => ra.amenity);

  // ===================== UI =====================
  return (
    <>
      {/* IDENTIFICAÇÃO */}
      <div className="surface-2">
        <div className="text-sm font-semibold mb-1">Identificação</div>
        <div className="grid grid-cols-12 gap-4 mt-3">
          <div className="col-span-12 md:col-span-4">
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

          <div className="col-span-6 md:col-span-2">
            <Field label="Código / Número" error={err("code")}>
              <Input placeholder="Ex.: 101" {...form.register("code")} />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-4">
            <Field label="Nome (opcional)">
              <Input placeholder="Ex.: Suíte Master" {...form.register("roomName")} />
            </Field>
          </div>

          <div className="col-span-6 md:col-span-2">
            <Field label="Andar (opcional)">
              <Input placeholder="Ex.: Térreo, 1, 2…" {...form.register("floor")} />
            </Field>
          </div>
        </div>
      </div>

      {/* CAPACIDADE */}
      <div className="surface-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold mb-1">Capacidade</div>
            <div className="text-[12px] opacity-70 -mt-1">
              Deixe em branco para usar o padrão do tipo selecionado.
            </div>
          </div>
          <CapacityBadge
            typeBase={selectedRoomType?.baseOccupancy}
            typeMax={selectedRoomType?.maxOccupancy}
          />
        </div>

        <div className="grid grid-cols-12 gap-4 mt-3">
          <div className="col-span-6 md:col-span-3">
            <Field label="Base (override)">
              <Input
                type="number"
                min={1}
                placeholder={
                  selectedRoomType?.baseOccupancy ? `Padrão: ${selectedRoomType.baseOccupancy}` : "—"
                }
                {...form.register("baseOccupancy", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <div className="col-span-6 md:col-span-3">
            <Field label="Máxima (override)">
              <Input
                type="number"
                min={1}
                placeholder={
                  selectedRoomType?.maxOccupancy ? `Padrão: ${selectedRoomType.maxOccupancy}` : "—"
                }
                {...form.register("maxOccupancy", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-6 flex items-end">
            <EffectiveCapacity base={effectiveBase} max={effectiveMax} />
          </div>
        </div>
      </div>

      {/* STATUS */}
      <div className="surface-2">
        <div className="text-sm font-semibold mb-1">Status</div>
        <div className="grid grid-cols-12 gap-4 mt-3">
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
            <Field label="Governança" error={err("housekeepingStatusCode")}>
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

      {/* COMODIDADES */}
      <div className="surface-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold mb-1">Comodidades</div>
            <div className="text-[12px] opacity-70 -mt-1">
              Herdadas do tipo + específicas deste quarto.
            </div>
          </div>

          <Button type="button" onClick={openAmenityModal}>
            Adicionar
          </Button>
        </div>

        {/* Herdadas */}
        <div className="mt-3">
          <div className="text-xs opacity-70 mb-1">Herdadas do tipo</div>
          <div className="flex flex-wrap gap-2">
            {inherited.length === 0 ? (
              <span className="text-sm opacity-70">Nenhuma vinculada ao tipo.</span>
            ) : (
              inherited.map((am) => <Chip key={am.id} label={am.name} />)
            )}
          </div>
        </div>

        {/* Específicas */}
        <div className="mt-4">
          <div className="text-xs opacity-70 mb-1">
            {mode === "edit" ? "Específicas do quarto" : "Selecionadas para este quarto (rascunho)"}
          </div>
          <div className="flex flex-wrap gap-2">
            {(mode === "edit" ? roomAmenities : stagedAmenities).length === 0 ? (
              <span className="text-sm opacity-70">
                {mode === "edit" ? "Nenhuma ainda." : "Nenhuma selecionada."}
              </span>
            ) : (
              (mode === "edit" ? roomAmenities : stagedAmenities).map((am) => (
                <Chip
                  key={am.id}
                  label={am.name}
                  onRemove={() => handleRemoveRoomAmenity(am.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* DESCRIÇÃO */}
      <div className="surface-2">
        <Field label="Descrição (opcional)">
          <Textarea
            rows={3}
            placeholder="Informações adicionais (vista, observações, etc.)"
            {...form.register("description")}
          />
        </Field>
      </div>

      {/* MODAL */}
      {amenityModal && (
        <ModalBase open={amenityModal} onClose={() => setAmenityModal(false)}>
          <div className="w-[min(92vw,520px)] rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200/70 dark:border-white/10 shadow-soft">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200/70 dark:border-white/10">
              <h3 className="text-sm font-semibold">
                {mode === "edit" ? "Adicionar comodidade ao quarto" : "Selecionar comodidade para este quarto"}
              </h3>
              <button
                type="button"
                onClick={() => setAmenityModal(false)}
                className="rounded-lg px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

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

/* ---------- UI helpers ---------- */
function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 px-3 py-1 text-xs">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-full px-1.5 py-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Remover"
          title="Remover"
        >
          ✕
        </button>
      )}
    </span>
  );
}

function CapacityBadge({ typeBase, typeMax }: { typeBase?: number; typeMax?: number }) {
  if (!typeBase && !typeMax) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/70 dark:border-white/10 px-3 py-1 text-[11px]">
      <span className="opacity-70">Padrão do tipo</span>
      {typeof typeBase === "number" ? <span>Base: {typeBase}</span> : null}
      <span className="opacity-40">•</span>
      {typeof typeMax === "number" ? <span>Máx.: {typeMax}</span> : null}
    </div>
  );
}

function EffectiveCapacity({ base, max }: { base?: number; max?: number }) {
  if (!base && !max) return null;
  return (
    <div className="rounded-xl border border-gray-200/70 dark:border-white/10 px-3 py-2 text-xs">
      <div className="opacity-70">Capacidade efetiva</div>
      <div className="mt-0.5 font-medium">
        {typeof base === "number" ? `Base ${base}` : "—"} <span className="opacity-40">•</span>{" "}
        {typeof max === "number" ? `Máx. ${max}` : "—"}
      </div>
    </div>
  );
}

/** Conteúdo do modal */
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
      <div className="flex gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] p-1">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`flex-1 px-3 py-1 rounded-lg text-sm ${
            mode === "existing" ? "bg-white dark:bg-[#0F172A] shadow-soft" : "opacity-70"
          }`}
        >
          Usar existente
        </button>
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`flex-1 px-3 py-1 rounded-lg text-sm ${
            mode === "new" ? "bg-white dark:bg-[#0F172A] shadow-soft" : "opacity-70"
          }`}
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
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
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
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
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
          Adicionar
        </Button>
      </div>
    </div>
  );
}