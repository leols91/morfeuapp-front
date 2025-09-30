// src/app/(private)/reservas/nova/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { HospedeSearch } from "@/components/reservas/HospedeSearch";
import { createReserva, listAcomodacoes, listSalesChannels } from "@/services/reservas";
import type { AcomodacaoOption, HospedeDTO } from "@/types/reserva";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";

// componentes padronizados
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";
import { SearchField } from "@/components/ui/form/SearchField";
import { toBR } from "@/lib/format";

// métodos de pagamento
const PAYMENT_METHODS = ["Pix", "Dinheiro", "Cartão", "Booking", "Airbnb"] as const;

// schema
const schema = z
  .object({
    hospedeId: z.string().min(1, "Selecione um hóspede"),
    checkIn: z.string().min(10, "Informe a data").regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: z.string().min(10, "Informe a data").regex(/^\d{4}-\d{2}-\d{2}$/),
    alvo: z.string().min(1, "Selecione a acomodação"),
    canalId: z.string().optional().nullable(),
    observacoes: z.string().optional().nullable(),
    fullyPaid: z.boolean().default(false),
    paymentMethod: z.string().optional(), // condicional
  })
  // check-out deve ser estritamente maior
  .refine((v) => v.checkIn < v.checkOut, {
    path: ["checkOut"],
    message: "Check-out deve ser após o check-in (dia seguinte ou posterior).",
  })
  // se paga, precisa informar forma
  .refine((v) => !v.fullyPaid || !!v.paymentMethod, {
    path: ["paymentMethod"],
    message: "Informe a forma de pagamento",
  });

// use o TIPO DE ENTRADA
type FormData = z.input<typeof schema>;

// helpers
function parseISODateOnly(s?: string) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function diffNights(inStr?: string, outStr?: string) {
  const a = parseISODateOnly(inStr);
  const b = parseISODateOnly(outStr);
  if (!a || !b) return 0;
  const MS = 24 * 60 * 60 * 1000;
  const diff = Math.round((b.getTime() - a.getTime()) / MS);
  return Math.max(0, diff);
}
function getNightlyRate(opt?: AcomodacaoOption | undefined) {
  if (!opt) return null;
  const any = opt as any;
  return any.price ?? any.dailyRate ?? any.diaria ?? any.valorDiaria ?? null;
}
function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function findAcomodacaoByAlvo(list: AcomodacaoOption[] | undefined, alvo?: string) {
  if (!list || !alvo) return undefined;
  const [, id] = (alvo || "").split(":");
  return list.find((a) => a.id === id);
}
function labelAcomodacao(list?: AcomodacaoOption[], alvo?: string) {
  const found = findAcomodacaoByAlvo(list, alvo);
  return found?.label ?? "—";
}
// evita "Invalid Date" no resumo
function safeToBR(s?: string) {
  return s && s.length >= 10 ? toBR(s) : "--";
}
// min do checkout = dia seguinte ao checkin
function nextDayISO(s?: string) {
  if (!s || s.length < 10) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d + 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

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
      fullyPaid: false,
      paymentMethod: "",
    },
  });

  // mantém hospedeId sincronizado com o autocomplete
  const hospedeId = form.watch("hospedeId");
  useMemo(() => {
    if (hospede && hospede.id !== hospedeId) {
      form.setValue("hospedeId", hospede.id, { shouldValidate: true });
    }
  }, [hospede, hospedeId, form]);

  // useWatch para o resumo e lógica condicional
  const control       = form.control;
  const checkIn       = useWatch({ control, name: "checkIn" });
  const checkOut      = useWatch({ control, name: "checkOut" });
  const alvo          = useWatch({ control, name: "alvo" });
  const fullyPaid     = useWatch({ control, name: "fullyPaid" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  // reset “forma de pagamento” quando voltar para "Não"
  useEffect(() => {
    if (!fullyPaid && paymentMethod) {
      form.setValue("paymentMethod", "", { shouldValidate: true, shouldDirty: true });
    }
  }, [fullyPaid, paymentMethod, form]);

  // cálculo do valor previsto
  const nights = diffNights(checkIn, checkOut);
  const acom   = findAcomodacaoByAlvo(acomQ.data, alvo);
  const rate   = getNightlyRate(acom);
  const total  = nights > 0 && typeof rate === "number" ? nights * rate : null;

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
        prepaid: !!values.fullyPaid,
        prepaidMethod: values.fullyPaid ? (values.paymentMethod || null) : null,
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
            <div className="col-span-12 lg:col-span-6 min-w-0">
              <SearchField
                label="Hóspede"
                error={form.formState.errors.hospedeId?.message}
                className="w-full"
              >
                <HospedeSearch value={hospede} onChange={setHospede} />
              </SearchField>
            </div>

            {/* Check-in */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 min-w-0">
              <Field label="Check-in" error={form.formState.errors.checkIn?.message} className="w-full">
                <Input type="date" {...form.register("checkIn")} />
              </Field>
            </div>

            {/* Check-out (min = dia seguinte ao check-in) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 min-w-0">
              <Field label="Check-out" error={form.formState.errors.checkOut?.message} className="w-full">
                <Input
                  type="date"
                  min={nextDayISO(checkIn)}
                  {...form.register("checkOut")}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ====== Bloco 2: Acomodação + Canal + Paga? + Observações ====== */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            {/* Acomodação */}
            <div className="col-span-12 md:col-span-7 lg:col-span-5 min-w-0">
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

            {/* Reserva paga (Select) + Forma de pagamento */}
            <div className="col-span-12 md:col-span-5 lg:col-span-4 min-w-0">
              <div className="grid grid-cols-12 gap-3 items-start">
                {/* Reserva paga (select com Não/Sim) */}
                <div className="col-span-12 sm:col-span-5">
                  <Field label="Reserva paga" className="w-full">
                    <Select
                      value={fullyPaid ? "yes" : "no"}
                      onChange={(e) => {
                        const v = e.target.value === "yes";
                        form.setValue("fullyPaid", v, { shouldValidate: true, shouldDirty: true });
                        if (!v) {
                          form.setValue("paymentMethod", "", { shouldValidate: true, shouldDirty: true });
                        }
                      }}
                    >
                      <option value="no">Não</option>
                      <option value="yes">Sim</option>
                    </Select>
                  </Field>
                </div>

                {/* Forma de pagamento (habilita apenas quando Sim) */}
                <div className="col-span-12 sm:col-span-7">
                  <Field
                    label="Forma de pagamento"
                    error={form.formState.errors.paymentMethod?.message}
                  >
                    <Select
                      disabled={!fullyPaid}
                      value={paymentMethod || ""}
                      onChange={(e) =>
                        form.setValue("paymentMethod", e.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    >
                      <option value="">Selecione…</option>
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </div>
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
                Período: <b>{safeToBR(checkIn)} → {safeToBR(checkOut)}</b>
              </div>
              <div className="rounded-xl border-subtle border px-3 py-1 text-sm">
                Acomodação: <b>{labelAcomodacao(acomQ.data, alvo)}</b>
              </div>
              {total !== null ? (
                <div className="rounded-xl border-subtle border px-3 py-1 text-sm">
                  Valor previsto: <b>{formatBRL(total)}</b>
                  {typeof rate === "number" ? (
                    <span className="opacity-70"> ({nights} {nights === 1 ? "noite" : "noites"} × {formatBRL(rate)})</span>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border-subtle border px-3 py-1 text-sm opacity-70">
                  Valor previsto: <b>—</b>
                </div>
              )}
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