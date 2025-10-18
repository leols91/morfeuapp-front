"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  createQuarto,
  addAmenityToRoom,
} from "@/services/acomodacoes";
import { getActivePousadaId } from "@/lib/tenants";

/** Validação */
const schema = z.object({
  roomTypeId: z.string().min(1, "Selecione o tipo de quarto"),
  code: z.string().min(1, "Informe o código/número do quarto"),
  roomName: z.string().optional(),
  floor: z.string().optional(),
  description: z.string().optional(),
  roomStatusCode: z.string().min(1, "Selecione o status do quarto"),
  housekeepingStatusCode: z.string().min(1, "Selecione o status de governança"),
  amenities: z.string().optional(),
  baseOccupancy: z.union([z.number().int().positive().min(1), z.nan(), z.undefined()]).optional(),
  maxOccupancy: z.union([z.number().int().positive().min(1), z.nan(), z.undefined()]).optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export default function NovaAcomodacaoPage() {
  const router = useRouter();

  const [pousadaId, setPousadaId] = React.useState<string | null>(null);
  React.useEffect(() => setPousadaId(getActivePousadaId()), []);

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

  // IDs de amenities “staged” (antes de existir o quarto)
  const [stagedAmenities, setStagedAmenities] = React.useState<string[]>([]);

  const criar = useMutation({
    mutationFn: async (raw: FormInput) => {
      if (!pousadaId) throw new Error("Nenhuma pousada selecionada.");

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

      const ok = (roomTypesQ.data ?? []).some((t) => t.id === v.roomTypeId);
      if (!ok) throw new Error("O tipo selecionado não pertence à pousada ativa.");

      // 1) cria o quarto
      const res = await createQuarto(pousadaId, {
        roomTypeId: v.roomTypeId,
        code: v.code,
        name: (v.roomName || "").trim() || null,
        floor: v.floor || null,
        description: v.description || null,
        baseOccupancy: v.baseOccupancy ?? null,
        maxOccupancy: v.maxOccupancy ?? null,
        roomStatusCode: v.roomStatusCode,
        housekeepingStatusCode: v.housekeepingStatusCode,
      });

      const newId = res?.id;
      if (newId && stagedAmenities.length > 0) {
        // 2) vincula amenities staged ao novo quarto
        for (const amId of stagedAmenities) {
          try {
            await addAmenityToRoom(newId, amId);
          } catch (e: any) {
            toast.error(
              e?.response?.data?.message ??
                `Falha ao vincular a comodidade (${amId}). Você pode tentar novamente na edição.`
            );
          }
        }
      }

      return res;
    },
    onSuccess: () => {
      toast.success("Quarto criado com sucesso!");
      router.replace("/acomodacoes");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Falha ao criar o quarto.");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Novo quarto</h1>
      </div>

      {!pousadaId && (
        <div className="surface-2 p-4 text-sm opacity-80">
          Selecione uma pousada para cadastrar um quarto.
        </div>
      )}

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((v) => criar.mutate(v))} className="space-y-4">
          <QuartoForm
            pousadaId={pousadaId}
            roomTypesQ={roomTypesQ}
            roomStatusesQ={roomStatusesQ}
            hkStatusesQ={hkStatusesQ}
            mode="create"
            onStagedAmenitiesChange={setStagedAmenities}
          />

          <div className="surface-2">
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criar.isPending || !pousadaId}>
                {criar.isPending ? "Salvando…" : "Criar quarto"}
              </Button>
            </div>
            {!pousadaId && (
              <div className="px-3 pb-3 text-[12px] text-amber-600">
                Selecione uma pousada para habilitar a criação de quartos.
              </div>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}