"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";
import { getHospede, updateHospede } from "@/services/hospedes";

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
  documentType: z.string().optional().or(z.literal("")),
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

export default function EditarHospedePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const q = useQuery({
    queryKey: ["hospede", id],
    queryFn: () => getHospede(id),
    enabled: !!id,
  });

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

  // Preenche quando carregar
  React.useEffect(() => {
    if (!q.data) return;

    // q.data.address pode chegar como Json | null | undefined
    const a = (q.data as any).address ?? null;

    form.reset({
      fullName: q.data.fullName ?? "",
      email: q.data.email ?? "",
      phone: q.data.phone ?? "",
      documentType: q.data.documentType ?? "",
      documentId: q.data.documentId ?? "",
      birthDate: q.data.birthDate ?? "",
      notes: q.data.notes ?? "",
      status: q.data.blacklisted ? "blacklisted" : "ok",
      address: {
        street: a?.street ?? "",
        number: a?.number ?? "",
        complement: a?.complement ?? "",
        district: a?.district ?? "",
        city: a?.city ?? "",
        state: a?.state ?? "",
        zip: a?.zip ?? "",
        country: a?.country ?? "",
      },
    });
  }, [q.data, form]);

  const salvar = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse(raw);
      return await updateHospede(id, {
        fullName: v.fullName,
        email: v.email || null,
        phone: v.phone || null,
        documentType: v.documentType || null,
        documentId: v.documentId || null,
        birthDate: v.birthDate || null,
        notes: v.notes || null,
        blacklisted: v.status === "blacklisted",
        address: buildAddress(v.address),
      });
    },
    onSuccess: () => {
      toast.success("Hóspede atualizado!");
      router.replace("/hospedes");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Falha ao salvar."),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar hóspede</h1>
      </div>

      {q.isLoading ? (
        <div className="surface-2 p-6 text-sm opacity-70">Carregando dados…</div>
      ) : (
        <form onSubmit={form.handleSubmit((v) => salvar.mutate(v))} className="space-y-4">
          {/* Dados pessoais */}
          <div className="surface-2">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Field label="Nome completo" error={form.formState.errors.fullName?.message}>
                  <Input {...form.register("fullName")} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field label="E-mail" error={form.formState.errors.email?.message}>
                  <Input type="email" {...form.register("email")} />
                </Field>
              </div>

              <div className="col-span-12 md:col-span-4">
                <Field label="Telefone">
                  <Input {...form.register("phone")} />
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
                  <Input {...form.register("documentId")} />
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
                  <Input {...form.register("address.street")} />
                </Field>
              </div>
              <div className="col-span-6 md:col-span-3 lg:col-span-2">
                <Field label="Número">
                  <Input {...form.register("address.number")} />
                </Field>
              </div>
              <div className="col-span-6 md:col-span-3 lg:col-span-4">
                <Field label="Complemento">
                  <Input {...form.register("address.complement")} />
                </Field>
              </div>

              <div className="col-span-12 md:col-span-4">
                <Field label="Bairro">
                  <Input {...form.register("address.district")} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Cidade">
                  <Input {...form.register("address.city")} />
                </Field>
              </div>
              <div className="col-span-6 md:col-span-2">
                <Field label="UF">
                  <Input maxLength={2} {...form.register("address.state")} />
                </Field>
              </div>
              <div className="col-span-6 md:col-span-2">
                <Field label="CEP">
                  <Input {...form.register("address.zip")} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="País">
                  <Input {...form.register("address.country")} />
                </Field>
              </div>
            </div>
          </div>

          {/* Observações + Ações */}
          <div className="surface-2">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Field label="Observações">
                  <Textarea rows={3} {...form.register("notes")} />
                </Field>
              </div>
            </div>
          </div>

          <div className="surface-2">
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}