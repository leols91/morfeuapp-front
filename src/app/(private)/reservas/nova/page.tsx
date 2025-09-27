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

  const acomQ = useQuery({ queryKey: ["acomodacoes"], queryFn: listAcomodacoes });
  const canaisQ = useQuery({ queryKey: ["canais"], queryFn: listSalesChannels });

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

  // sincroniza seleção do autocomplete com o form
  const hospedeId = form.watch("hospedeId");
  useMemo(() => {
    if (hospede && hospede.id !== hospedeId) form.setValue("hospedeId", hospede.id, { shouldValidate: true });
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nova reserva</h1>
      </div>

      <form
        onSubmit={form.handleSubmit((v) => criar.mutate(v))}
        className="space-y-4"
      >
        {/* Hospede + Período (toolbar) */}
        <div className="surface-2">
          <div className="flex flex-wrap items-start gap-3">
            <div className="w-full">
              <label className="text-xs opacity-70 block">Hóspede</label>
              <HospedeSearch value={hospede} onChange={setHospede} />
              {form.formState.errors.hospedeId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.hospedeId.message}</p>
              )}
            </div>

            <div className="w-full md:w-auto">
              <label className="text-xs opacity-70 block">Check-in</label>
              <input
                type="date"
                className="mt-1 h-9 w-full md:w-44 rounded-2xl border-subtle bg-transparent px-3"
                {...form.register("checkIn")}
              />
              {form.formState.errors.checkIn && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.checkIn.message}</p>
              )}
            </div>

            <div className="w-full md:w-auto">
              <label className="text-xs opacity-70 block">Check-out</label>
              <input
                type="date"
                className="mt-1 h-9 w-full md:w-44 rounded-2xl border-subtle bg-transparent px-3"
                {...form.register("checkOut")}
              />
              {form.formState.errors.checkOut && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.checkOut.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Acomodação + Canal */}
        <div className="surface-2">
          <div className="flex flex-wrap items-start gap-3">
            <div className="w-full md:w-[28rem]">
              <label className="text-xs opacity-70 block">Acomodação (quarto/cama)</label>
              <select
                className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                {...form.register("alvo")}
              >
                <option value="">Selecione…</option>
                {acomQ.data?.map((a) => (
                  <option key={a.id} value={`${a.kind}:${a.id}`}>{a.label}</option>
                ))}
              </select>
              {form.formState.errors.alvo && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.alvo.message}</p>
              )}
            </div>

            <div className="w-full md:w-60">
              <label className="text-xs opacity-70 block">Canal</label>
              <select
                className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                {...form.register("canalId")}
              >
                <option value="">Direta</option>
                {canaisQ.data?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label className="text-xs opacity-70 block">Observações</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-2xl border-subtle bg-transparent px-3 py-2"
                placeholder="Informações importantes, solicitações, etc."
                {...form.register("observacoes")}
              />
            </div>
          </div>
        </div>

        {/* Resumo + Ações */}
        <div className="surface-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm opacity-70">Resumo</div>
            <div className="rounded-xl border-subtle border px-3 py-1 text-sm">
              Hóspede: <b>{hospede?.nome ?? "—"}</b>
            </div>
            <div className="rounded-xl border-subtle border px-3 py-1 text-sm">
              Período: <b>{form.watch("checkIn") || "--"} → {form.watch("checkOut") || "--"}</b>
            </div>
            <div className="rounded-xl border-subtle border px-3 py-1 text-sm">
              Acomodação: <b>{labelAcomodacao(acomQ.data, form.watch("alvo"))}</b>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={criar.isPending || !hospede}
              >
                {criar.isPending ? "Salvando…" : "Criar reserva"}
              </Button>
            </div>
          </div>

          {criar.isError && (
            <p className="text-sm text-red-500 mt-3">
              {(criar.error as any)?.response?.data?.message ?? "Falha ao criar reserva. Verifique os dados."}
            </p>
          )}
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