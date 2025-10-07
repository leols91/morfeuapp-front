"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";

import {
  listRoomTypes,
  listRoomStatuses,
  listHousekeepingStatuses,
  createQuarto,
} from "@/services/acomodacoes";

/** =====================
 *  Validação (Quarto)
 * ===================== */
const schema = z.object({
  roomTypeId: z.string().min(1, "Selecione o tipo de quarto"),
  code: z.string().min(1, "Informe o código/número do quarto"),
  roomName: z.string().optional(),
  floor: z.string().optional(),
  description: z.string().optional(),
  roomStatusCode: z.string().min(1, "Selecione o status do quarto"),
  housekeepingStatusCode: z.string().min(1, "Selecione o status de governança"),
  amenities: z.string().optional(), // vírgulas
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

type RoomType = { id: string; name: string };
type StatusOpt = { code: string; description: string };

export default function NovaAcomodacaoPage() {
  const router = useRouter();

  const roomTypesQ = useQuery<RoomType[]>({
    queryKey: ["roomTypes"],
    queryFn: listRoomTypes,
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
    },
  });

  const criar = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse(raw);
      return await createQuarto({
        roomTypeId: v.roomTypeId,
        code: v.code,
        floor: v.floor ? v.floor : null,
        description: v.description ? v.description : null,
        roomStatusCode: v.roomStatusCode,
        housekeepingStatusCode: v.housekeepingStatusCode,
      });
    },
    onSuccess: () => {
      toast.success("Quarto criado com sucesso!");
      router.replace("/acomodacoes");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Falha ao criar o quarto.");
    },
  });

  const loadingOpts =
    roomTypesQ.isLoading || roomStatusesQ.isLoading || hkStatusesQ.isLoading;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Novo quarto</h1>
      </div>

      <form onSubmit={form.handleSubmit((v) => criar.mutate(v))} className="space-y-4">
        {/* Bloco 1: dados essenciais */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            {/* Tipo de quarto — curto */}
            <div className="col-span-12 md:col-span-3 lg:col-span-3">
              <Field label="Tipo de quarto" error={form.formState.errors.roomTypeId?.message}>
                <Select
                  {...form.register("roomTypeId")}
                  disabled={roomTypesQ.isLoading || roomTypesQ.isError}
                >
                  <option value="">{roomTypesQ.isLoading ? "Carregando…" : "Selecione…"}</option>
                  {roomTypesQ.data?.map((rt) => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </Select>
              </Field>
            </div>

            {/* Código / Número — curto */}
            <div className="col-span-12 md:col-span-2 lg:col-span-2">
              <Field label="Código / Número" error={form.formState.errors.code?.message}>
                <Input placeholder="Ex.: 101, 202B" {...form.register("code")} />
              </Field>
            </div>

            {/* Nome do quarto — largo */}
            <div className="col-span-12 md:col-span-5 lg:col-span-5">
              <Field label="Nome do quarto (opcional)">
                <Input
                  placeholder="Ex.: Suíte Master, Standard Vista Mar"
                  {...form.register("roomName")}
                />
              </Field>
            </div>

            {/* Andar — curto */}
            <div className="col-span-12 md:col-span-2 lg:col-span-2">
              <Field label="Andar (opcional)">
                <Input placeholder="Ex.: Térreo, 1, 2, 3…" {...form.register("floor")} />
              </Field>
            </div>
          </div>
        </div>

        {/* Bloco 2: status */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            {/* Status do quarto */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <Field
                label="Status do quarto"
                error={form.formState.errors.roomStatusCode?.message}
              >
                <Select
                  {...form.register("roomStatusCode")}
                  disabled={roomStatusesQ.isLoading || roomStatusesQ.isError}
                >
                  <option value="">
                    {roomStatusesQ.isLoading ? "Carregando…" : "Selecione…"}
                  </option>
                  {roomStatusesQ.data?.map((rs) => (
                    <option key={rs.code} value={rs.code}>{rs.description}</option>
                  ))}
                </Select>
              </Field>
            </div>

            {/* Status de governança */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <Field
                label="Status de governança"
                error={form.formState.errors.housekeepingStatusCode?.message}
              >
                <Select
                  {...form.register("housekeepingStatusCode")}
                  disabled={hkStatusesQ.isLoading || hkStatusesQ.isError}
                >
                  <option value="">
                    {hkStatusesQ.isLoading ? "Carregando…" : "Selecione…"}
                  </option>
                  {hkStatusesQ.data?.map((hs) => (
                    <option key={hs.code} value={hs.code}>{hs.description}</option>
                  ))}
                </Select>
              </Field>
            </div>

            {/* espaçador para equilíbrio em telas grandes */}
            <div className="hidden lg:block lg:col-span-4" />
          </div>
        </div>

        {/* Bloco 3: descrição + amenidades */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-7">
              <Field label="Descrição (opcional)">
                <Textarea
                  rows={3}
                  placeholder="Informações adicionais do quarto (vista, observações, etc.)"
                  {...form.register("description")}
                />
              </Field>
            </div>
            <div className="col-span-12 lg:col-span-5">
              <Field label="Amenidades (separe por vírgulas)">
                <Input
                  placeholder="Ar-condicionado, Wi-Fi, TV, Cofre…"
                  {...form.register("amenities")}
                />
                <div className="text-[11px] opacity-70 mt-1">
                  Ex.: Ar-condicionado, TV, Cofre
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="surface-2">
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criar.isPending || loadingOpts}>
              {criar.isPending ? "Salvando…" : "Criar quarto"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}