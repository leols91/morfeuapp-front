// src/app/(private)/reservas/nova/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { HospedeSearch } from "@/components/reservas/HospedeSearch";
import { listAcomodacoes, listSalesChannels, createReserva } from "@/services/reservas";
import type { AcomodacaoOption, HospedeDTO } from "@/types/reserva";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";

// 🔧 nossos componentes padronizados de form
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";

const schema = z.object({
  hospedeId: z.string().min(1, "Selecione um hóspede"),
  checkIn: z.string().min(10, "Informe a data").regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().min(10, "Informe a data").regex(/^\d{4}-\d{2}-\d{2}$/),
  alvo: z.string().min(1, "Selecione a acomodação"), // "room:room_101" | "bed:bed_A2"
  canalId: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
}).refine((v) => v.checkIn <= v.checkOut, {
  path: ["checkOut"],
  message: "Check-out deve ser após o check-in",
});

type FormData = z.infer<typeof schema>;

export default function NovaReservaPage() {
  const router = useRouter();

  const [hospede, setHospede] = useState<HospedeDTO | null>(null);

  const acomQ   = useQuery({ queryKey: ["acomodacoes"],  queryFn: listAcomodacoes });
  const canaisQ = useQuery({ queryKey: ["canais"],       queryFn: listSalesChannels });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      hospedeId: "",
      checkIn: "",
      checkOut: "",
      alvo: "",
      canalId: "",
      observacoes: "",
    },
  });

  // Mantém hospedeId sincronizado com o autocomplete
  const hospedeId = form.watch("hospedeId");
  useMemo(() => {
    if (hospede && hospede.id !== hospedeId) {
      form.setValue("hospedeId", hospede.id, { shouldValidate: true });
    }
  }, [hospede, hospedeId, form]);

  const criar = useMutation({
    mutationFn: async (values: FormData) => {
      const [kind, id] = values.alvo.split(":");
      const payload = {
        hospedeId: values.hospedeId,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        canalId: values.canalId || null,
        roomId: kind === "room" ? id : null,
        bedId: kind === "bed" ? id : null,
        observacoes: values.observacoes || null,
      };
      return await createReserva(payload);
    },
    onSuccess: (res) => router.replace(`/reservas/${res.id}`),
  });

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nova reserva</h1>
      </div>

      <form onSubmit={form.handleSubmit((v) => criar.mutate(v))} className="space-y-4">
        {/* ====== Bloco 1: Hóspede + Período ====== */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            {/* Hóspede */}
            <div className="col-span-12 min-w-0">
              <Field
                label="Hóspede"
                error={form.formState.errors.hospedeId?.message}
                className="w-full"
              >
                <div className="min-w-0">
                  <HospedeSearch value={hospede} onChange={setHospede} />
                </div>
              </Field>
            </div>

            {/* Check-in */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 min-w-0">
              <Field label="Check-in" error={form.formState.errors.checkIn?.message} className="w-full">
                <Input type="date" {...form.register("checkIn")} />
              </Field>
            </div>

            {/* Check-out */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 min-w-0">
              <Field label="Check-out" error={form.formState.errors.checkOut?.message} className="w-full">
                <Input type="date" {...form.register("checkOut")} />
              </Field>
            </div>
          </div>
        </div>

        {/* ====== Bloco 2: Acomodação + Canal + Observações ====== */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            {/* Acomodação */}
            <div className="col-span-12 md:col-span-7 lg:col-span-6 min-w-0">
              <Field
                label="Acomodação (quarto/cama)"
                error={form.formState.errors.alvo?.message}
                className="w-full"
              >
                <Select {...form.register("alvo")}>
                  <option value="">Selecione…</option>
                  {acomQ.data?.map((a) => (
                    <option key={a.id} value={`${a.kind}:${a.id}`}>{a.label}</option>
                  ))}
                </Select>
              </Field>
            </div>

            {/* Canal */}
            <div className="col-span-12 md:col-span-5 lg:col-span-3 min-w-0">
              <Field label="Canal" className="w-full">
                <Select {...form.register("canalId")}>
                  <option value="">Selecione...</option>
                  {canaisQ.data?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
            </div>

            {/* Observações */}
            <div className="col-span-12 min-w-0">
              <Field label="Observações" className="w-full">
                <Textarea
                  rows={3}
                  placeholder="Informações importantes, solicitações, etc."
                  {...form.register("observacoes")}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ====== Bloco 3: Resumo + Ações ====== */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-wrap gap-2">
              <div className="rounded-xl border-subtle border px-3 py-1 text-sm">
                Hóspede: <b>{hospede?.nome ?? "—"}</b>
              </div>
              <div className="rounded-xl border-subtle border px-3 py-1 text-sm">
                Período: <b>{form.watch("checkIn") || "--"} → {form.watch("checkOut") || "--"}</b>
              </div>
              <div className="rounded-xl border-subtle border px-3 py-1 text-sm">
                Acomodação: <b>{labelAcomodacao(acomQ.data, form.watch("alvo"))}</b>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 lg:col-span-3 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criar.isPending || !hospede}>
                {criar.isPending ? "Salvando…" : "Criar reserva"}
              </Button>
            </div>

            {criar.isError && (
              <div className="col-span-12">
                <p className="text-sm text-red-500">
                  {(criar.error as any)?.response?.data?.message ?? "Falha ao criar reserva. Verifique os dados."}
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function labelAcomodacao(list?: AcomodacaoOption[], alvo?: string) {
  if (!list || !alvo) return "—";
  const [, id] = alvo.split(":");
  return list.find(a => a.id === id)?.label ?? "—";
}