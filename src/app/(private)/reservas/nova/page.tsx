"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { HospedeSearch } from "@/components/reservas/HospedeSearch";
import { createReserva, listAcomodacoes, listSalesChannels } from "@/services/reservas";
import type { AcomodacaoOption, HospedeDTO } from "@/types/reserva";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";
import { SearchField } from "@/components/ui/form/SearchField";

import { schema, PAYMENT_METHODS, type NovaReservaFormData } from "@/features/reservas/nova/schema";
import {
  diffNights,
  findAcomodacaoByAlvo,
  getNightlyRate,
  nextDayISO,
} from "@/features/reservas/nova/helpers";
import { Summary } from "@/features/reservas/nova/components/Summary";
import { PaidControls } from "@/features/reservas/nova/components/PaidControls";

export default function NovaReservaPage() {
  const router = useRouter();
  const [hospede, setHospede] = useState<HospedeDTO | null>(null);

  const acomQ   = useQuery({ queryKey: ["acomodacoes"],  queryFn: listAcomodacoes });
  const canaisQ = useQuery({ queryKey: ["canais"],       queryFn: listSalesChannels });

  const form = useForm<NovaReservaFormData>({
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

  // sincroniza o autocomplete (hóspede) no form
  const hospedeId = form.watch("hospedeId");
  useMemo(() => {
    if (hospede && hospede.id !== hospedeId) {
      form.setValue("hospedeId", hospede.id, { shouldValidate: true });
    }
  }, [hospede, hospedeId, form]);

  // watches para resumo/lógica
  const control       = form.control;
  const checkIn       = useWatch({ control, name: "checkIn" });
  const checkOut      = useWatch({ control, name: "checkOut" });
  const alvo          = useWatch({ control, name: "alvo" });
  const fullyPaid     = useWatch({ control, name: "fullyPaid" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  // se voltar para "Não", zera forma de pagamento
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
    mutationFn: async (values: NovaReservaFormData) => {
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nova reserva</h1>
      </div>

      <form onSubmit={form.handleSubmit((v) => criar.mutate(v))} className="space-y-4">
        {/* Bloco 1: Hóspede + Período */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 min-w-0">
              <SearchField
                label="Hóspede"
                error={form.formState.errors.hospedeId?.message}
                className="w-full"
              >
                <HospedeSearch value={hospede} onChange={setHospede} />
              </SearchField>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-3 min-w-0">
              <Field label="Check-in" error={form.formState.errors.checkIn?.message} className="w-full">
                <Input type="date" {...form.register("checkIn")} />
              </Field>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-3 min-w-0">
              <Field label="Check-out" error={form.formState.errors.checkOut?.message} className="w-full">
                <Input type="date" min={nextDayISO(checkIn)} {...form.register("checkOut")} />
              </Field>
            </div>
          </div>
        </div>

        {/* Bloco 2: Acomodação + Canal + Pagamento + Observações */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
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

            <div className="col-span-12 md:col-span-5 lg:col-span-4 min-w-0">
              <PaidControls
                fullyPaid={!!fullyPaid}
                paymentMethod={paymentMethod}
                paymentError={form.formState.errors.paymentMethod?.message}
                onChangePaid={(v) =>
                  form.setValue("fullyPaid", v, { shouldValidate: true, shouldDirty: true })
                }
                onChangeMethod={(v) =>
                  form.setValue("paymentMethod", v, { shouldValidate: true, shouldDirty: true })
                }
              />
            </div>

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

        {/* Bloco 3: Resumo + Ações */}
        <div className="surface-2">
          <Summary
            hospedeNome={hospede?.nome}
            checkIn={checkIn}
            checkOut={checkOut}
            alvo={alvo}
            acomList={acomQ.data as AcomodacaoOption[] | undefined}
            nights={nights}
            rate={typeof rate === "number" ? rate : null}
            total={typeof total === "number" ? total : null}
          />

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={criar.isPending || !hospede}>
              {criar.isPending ? "Salvando…" : "Criar reserva"}
            </Button>
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