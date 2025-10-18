"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { QuartoForm } from "@/components/acomodacoes/QuartoForm";
import type { RoomType, StatusOpt } from "@/components/acomodacoes/types";

import {
  listRoomTypes,
  listRoomStatuses,
  listHousekeepingStatuses,
  getQuarto,
  updateQuarto,
} from "@/services/acomodacoes";
import { getActivePousadaId } from "@/lib/tenants";

/** =====================
 *  Validação (Quarto)
 * ===================== */
const schema = z.object({
  roomTypeId: z.string().min(1, "Selecione o tipo de quarto"),
  code: z.string().min(1, "Informe o código/número do quarto"),
  roomName: z.string().optional(),        // apenas UI
  floor: z.string().optional(),
  description: z.string().optional(),
  roomStatusCode: z.string().min(1, "Selecione o status do quarto"),
  housekeepingStatusCode: z.string().min(1, "Selecione o status de governança"),
  amenities: z.string().optional(),       // apenas UI

  // overrides (opcionais): se vazio => usa padrão do RoomType
  baseOccupancy: z.union([z.number().int().positive().min(1), z.nan(), z.undefined()]).optional(),
  maxOccupancy: z.union([z.number().int().positive().min(1), z.nan(), z.undefined()]).optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export default function EditarAcomodacaoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  // 🏨 Pousada ativa (para escopar room types)
  const [pousadaId, setPousadaId] = React.useState<string | null>(null);
  React.useEffect(() => {
    setPousadaId(getActivePousadaId());
  }, []);

  const roomTypesQ = useQuery<RoomType[]>({
    queryKey: ["roomTypes", pousadaId],
    queryFn: () => listRoomTypes(pousadaId ?? undefined),
    enabled: !!pousadaId,
    refetchOnWindowFocus: false,
  });

  const roomStatusesQ = useQuery<StatusOpt[]>({
    queryKey: ["roomStatuses"],
    queryFn: listRoomStatuses,
    refetchOnWindowFocus: false,
  });

  const hkStatusesQ = useQuery<StatusOpt[]>({
    queryKey: ["housekeepingStatuses"],
    queryFn: listHousekeepingStatuses,
    refetchOnWindowFocus: false,
  });

  const quartoQ = useQuery({
    queryKey: ["quarto", id],
    queryFn: () => getQuarto(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomTypeId: "",
      code: "",
      roomName: "",
      floor: "",
      description: "",
      roomStatusCode: "",
      housekeepingStatusCode: "",
      amenities: "",
      baseOccupancy: undefined,
      maxOccupancy: undefined,
    },
  });

  // Preenche o formulário quando carregar o quarto
  React.useEffect(() => {
    const q = quartoQ.data;
    if (!q) return;
    form.reset({
      roomTypeId: q.roomTypeId ?? "",
      code: q.code ?? "",
      roomName: q.name ?? "",
      floor: q.floor ?? "",
      description: q.description ?? "",
      roomStatusCode: q.roomStatusCode ?? "",
      housekeepingStatusCode: q.housekeepingStatusCode ?? "",
      amenities: "",
      baseOccupancy: q.baseOccupancy ?? undefined,
      maxOccupancy: q.maxOccupancy ?? undefined,
    });
  }, [quartoQ.data, form]);

  const salvar = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse({
        ...raw,
        baseOccupancy:
          raw.baseOccupancy === undefined || Number.isNaN(raw.baseOccupancy)
            ? undefined
            : raw.baseOccupancy,
        maxOccupancy:
          raw.maxOccupancy === undefined || Number.isNaN(raw.maxOccupancy)
            ? undefined
            : raw.maxOccupancy,
      });

      return await updateQuarto(id, {
        roomTypeId: v.roomTypeId,
        code: v.code,
        name: v.roomName || null,                 // ← envia o nome amigável
        floor: v.floor ? v.floor : null,
        description: v.description ? v.description : null,
        roomStatusCode: v.roomStatusCode,
        housekeepingStatusCode: v.housekeepingStatusCode,
        baseOccupancy: v.baseOccupancy ?? null,
        maxOccupancy: v.maxOccupancy ?? null,
      });
    },
    onSuccess: () => {
      toast.success("Quarto atualizado com sucesso!");
      router.replace("/acomodacoes");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Falha ao atualizar o quarto.");
    },
  });

  const loading =
    roomTypesQ.isLoading ||
    roomStatusesQ.isLoading ||
    hkStatusesQ.isLoading ||
    quartoQ.isLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar quarto</h1>
      </div>

      {/* Loading inicial do quarto */}
      {quartoQ.isLoading ? (
        <div className="surface-2 p-6 text-sm opacity-70">Carregando dados…</div>
      ) : quartoQ.isError ? (
        <div className="surface-2 p-6 text-sm text-red-500">
          Falha ao carregar dados do quarto.
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit((v) => salvar.mutate(v))} className="space-y-4">
            <QuartoForm
              pousadaId={pousadaId}
              roomTypesQ={roomTypesQ}
              roomStatusesQ={roomStatusesQ}
              hkStatusesQ={hkStatusesQ}
              mode="edit"
              quartoId={id}                 // ← necessário para gerenciar comodidades no edit
            />

            {/* Ações */}
            <div className="surface-2">
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvar.isPending || loading}>
                  {salvar.isPending ? "Salvando…" : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
}