"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/form/Field";
import { createHospede } from "@/services/hospedes";

const addressSchema = z.object({
  street: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
  district: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zip: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

const schema = z.object({
  fullName: z.string().min(1, "Informe o nome completo"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  documentType: z.string().optional().or(z.literal("")),   // cpf/rg/passport/…
  documentId: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.enum(["ok", "blacklisted"]).default("ok"),
  address: addressSchema,
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

function buildAddress(addr: FormOutput["address"]) {
  const a = {
    street: addr.street?.trim(),
    number: addr.number?.trim(),
    complement: addr.complement?.trim(),
    district: addr.district?.trim(),
    city: addr.city?.trim(),
    state: addr.state?.trim(),
    zip: addr.zip?.trim(),
    country: addr.country?.trim(),
  };
  const hasAny = Object.values(a).some((v) => !!v);
  return hasAny ? a : null;
}

export default function NovoHospedePage() {
  const router = useRouter();

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      documentType: "",
      documentId: "",
      birthDate: "",
      notes: "",
      status: "ok",
      address: {
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      },
    },
  });

  const criar = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse(raw);
      return await createHospede({
        fullName: v.fullName,
        email: v.email || null,
        phone: v.phone || null,
        documentType: v.documentType || null,
        documentId: v.documentId || null,
        birthDate: v.birthDate || null,
        notes: v.notes || null,
        blacklisted: v.status === "blacklisted",
        address: buildAddress(v.address), // <- JSON ou null
      });
    },
    onSuccess: () => {
      toast.success("Hóspede criado com sucesso!");
      router.replace("/hospedes");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Falha ao criar hóspede.");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Novo hóspede</h1>
      </div>

      <form onSubmit={form.handleSubmit((v) => criar.mutate(v))} className="space-y-4">
        {/* Dados pessoais */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <Field label="Nome completo" error={form.formState.errors.fullName?.message}>
                <Input {...form.register("fullName")} placeholder="Ex.: Ana Souza" />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Field label="E-mail" error={form.formState.errors.email?.message}>
                <Input type="email" placeholder="ana@ex.com" {...form.register("email")} />
              </Field>
            </div>

            <div className="col-span-12 md:col-span-4">
              <Field label="Telefone">
                <Input placeholder="(11) 98888-0001" {...form.register("phone")} />
              </Field>
            </div>

            <div className="col-span-12 md:col-span-4">
              <Field label="Tipo de documento">
                <Select {...form.register("documentType")}>
                  <option value="">Selecione…</option>
                  <option value="cpf">CPF</option>
                  <option value="rg">RG</option>
                  <option value="passport">Passaporte</option>
                  <option value="other">Outro</option>
                </Select>
              </Field>
            </div>

            <div className="col-span-12 md:col-span-4">
              <Field label="Documento">
                <Input placeholder="CPF / RG / Passaporte" {...form.register("documentId")} />
              </Field>
            </div>

            <div className="col-span-12 md:col-span-4">
              <Field label="Nascimento">
                <Input type="date" {...form.register("birthDate")} />
              </Field>
            </div>

            <div className="col-span-12 md:col-span-4">
              <Field label="Status">
                <Select {...form.register("status")}>
                  <option value="ok">Sem restrição</option>
                  <option value="blacklisted">Blacklist</option>
                </Select>
              </Field>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6">
              <Field label="Rua / Logradouro">
                <Input placeholder="Av. Paulista" {...form.register("address.street")} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3 lg:col-span-2">
              <Field label="Número">
                <Input placeholder="123" {...form.register("address.number")} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3 lg:col-span-4">
              <Field label="Complemento">
                <Input placeholder="Apto 12, Bloco B" {...form.register("address.complement")} />
              </Field>
            </div>

            <div className="col-span-12 md:col-span-4">
              <Field label="Bairro">
                <Input placeholder="Bela Vista" {...form.register("address.district")} />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-4">
              <Field label="Cidade">
                <Input placeholder="São Paulo" {...form.register("address.city")} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-2">
              <Field label="UF">
                <Input placeholder="SP" maxLength={2} {...form.register("address.state")} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-2">
              <Field label="CEP">
                <Input placeholder="00000-000" {...form.register("address.zip")} />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-4">
              <Field label="País">
                <Input placeholder="Brasil" {...form.register("address.country")} />
              </Field>
            </div>
          </div>
        </div>

        {/* Observações + Ações */}
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <Field label="Observações">
                <Textarea rows={3} placeholder="Notas internas…" {...form.register("notes")} />
              </Field>
            </div>
          </div>
        </div>

        <div className="surface-2">
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criar.isPending}>
              {criar.isPending ? "Salvando…" : "Criar hóspede"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}