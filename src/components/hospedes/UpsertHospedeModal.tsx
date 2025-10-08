"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import ModalBase from "@/components/ui/ModalBase";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";
import { Button } from "@/components/ui/Button";
import type { HospedeDTO, UpsertHospedePayload } from "@/services/hospedes";
import { createHospede, updateHospede } from "@/services/hospedes";

type Mode = "create" | "edit";

const schema = z.object({
  fullName: z.string().min(1, "Informe o nome completo"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  documentType: z.string().optional(),
  documentId: z.string().optional(),
  birthDate: z.string().optional(), // ISO yyyy-mm-dd
  blacklisted: z.boolean().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  mode: Mode;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  hospede?: HospedeDTO;
};

export function UpsertHospedeModal({ mode, open, onClose, onSuccess, hospede }: Props) {
  const isEdit = mode === "edit";

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      documentType: "",
      documentId: "",
      birthDate: "",
      blacklisted: false,
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    if (isEdit && hospede) {
      form.reset({
        fullName: hospede.fullName ?? "",
        email: hospede.email ?? "",
        phone: hospede.phone ?? "",
        documentType: hospede.documentType ?? "",
        documentId: hospede.documentId ?? "",
        birthDate: (hospede.birthDate ?? "").slice(0, 10),
        blacklisted: !!hospede.blacklisted,
        notes: hospede.notes ?? "",
      });
    } else {
      form.reset({
        fullName: "",
        email: "",
        phone: "",
        documentType: "",
        documentId: "",
        birthDate: "",
        blacklisted: false,
        notes: "",
      });
    }
  }, [open, isEdit, hospede, form]);

  async function submit(v: FormData) {
    try {
      const payload: UpsertHospedePayload = {
        fullName: v.fullName,
        email: v.email ? v.email : null,
        phone: v.phone || null,
        documentType: v.documentType || null,
        documentId: v.documentId || null,
        birthDate: v.birthDate || null,
        blacklisted: !!v.blacklisted,
        notes: v.notes || null,
      };

      if (isEdit && hospede) {
        await updateHospede(hospede.id, payload);
        toast.success("Hóspede atualizado com sucesso!");
      } else {
        await createHospede(payload);
        toast.success("Hóspede criado com sucesso!");
      }

      onClose();
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Falha ao salvar o hóspede.");
    }
  }

  if (!open) return null;

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">
            {isEdit ? "Editar hóspede" : "Novo hóspede"}
          </h3>
          {isEdit && hospede && <p className="text-xs opacity-70 mt-0.5">ID: {hospede.id}</p>}
        </ModalBase.Header>

        <ModalBase.Body>
          <form id="form-hospede" onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-8">
                <Field label="Nome completo" error={form.formState.errors.fullName?.message}>
                  <Input {...form.register("fullName")} placeholder="Ex.: Maria da Silva" />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Documento (tipo)">
                  <Select {...form.register("documentType")}>
                    <option value="">Selecione…</option>
                    <option value="CPF">CPF</option>
                    <option value="RG">RG</option>
                    <option value="PASSAPORTE">Passaporte</option>
                  </Select>
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Documento (número)">
                  <Input {...form.register("documentId")} placeholder="Ex.: 123.456.789-00" />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="E-mail" error={form.formState.errors.email?.message}>
                  <Input type="email" {...form.register("email")} placeholder="exemplo@dominio.com" />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Telefone">
                  <Input {...form.register("phone")} placeholder="(00) 90000-0000" />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Nascimento">
                  <Input type="date" {...form.register("birthDate")} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Field label="Blacklist">
                  <Select {...form.register("blacklisted")}>
                    <option value="false">Não</option>
                    <option value="true">Sim</option>
                  </Select>
                </Field>
              </div>
              <div className="col-span-12">
                <Field label="Observações">
                  <Textarea rows={3} {...form.register("notes")} placeholder="Anotações internas…" />
                </Field>
              </div>
            </div>
          </form>
        </ModalBase.Body>

        <ModalBase.Footer className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="form-hospede" type="submit">
            {isEdit ? "Salvar" : "Criar hóspede"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}