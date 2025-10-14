"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";
import {
  UF_CODES,
  isValidCPF,
  isValidCEP,
  isValidPhoneBR,
  digitsOnly,
  normalizeUF,
  maskCPF,
  maskCEP,
  maskPhoneSmart,
  lettersOnly,
} from "@/lib/validation/br";
import { Info } from "lucide-react";

export const hospedeSchema = z
  .object({
    fullName: z.string().trim().min(1, "Informe o nome completo"),
    email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
    phone: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || isValidPhoneBR(v), { message: "Telefone inválido (use DDD + número)" }),
    documentType: z.enum(["", "cpf", "rg", "passport", "other"]).default(""),
    documentId: z.string().optional().or(z.literal("")),
    birthDate: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
    status: z.enum(["ok", "blacklisted"]).default("ok"),
    address: z.object({
      street: z.string().trim().optional().or(z.literal("")),
      number: z.string().trim().regex(/^\d*$/, "Use apenas números").optional().or(z.literal("")),
      complement: z.string().trim().optional().or(z.literal("")),
      district: z.string().trim().optional().or(z.literal("")),
      city: z.string().trim().optional().or(z.literal("")),
      state: z
        .preprocess((v) => normalizeUF(String(v ?? "")), z.union([z.literal(""), z.enum(UF_CODES)]))
        .optional()
        .or(z.literal("")),
      zip: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine((v) => !v || isValidCEP(v), { message: "CEP inválido (use 8 dígitos)" }),
      country: z.string().trim().optional().or(z.literal("")),
    }),
  })
  .refine(
    (data) => {
      if (data.documentType === "cpf") {
        return !!data.documentId && isValidCPF(data.documentId);
      }
      return true;
    },
    { path: ["documentId"], message: "CPF inválido" }
  );

export type HospedeFormInput = z.input<typeof hospedeSchema>;
export type HospedeFormOutput = z.infer<typeof hospedeSchema>;

type Props = {
  initialData?: Partial<HospedeFormInput>;
  isSubmitting?: boolean;
  onSubmit: (data: HospedeFormOutput) => void;
  onCancel?: () => void;
};

export function HospedeForm({ initialData, isSubmitting, onSubmit, onCancel }: Props) {
  const form = useForm<HospedeFormInput>({
    resolver: zodResolver(hospedeSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: initialData ?? {
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

  React.useEffect(() => {
    if (!form.getValues("status")) {
      form.setValue("status", "ok");
    }
  }, [form]);

  const { register, setValue, handleSubmit, watch, formState } = form;
  const { errors } = formState;
  const docType = watch("documentType");

  // === máscaras em tempo real ===
  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhoneSmart(e.target.value);
    setValue("phone", masked, { shouldValidate: true });
  };
  const onCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    setValue("documentId", masked, { shouldValidate: true });
  };
  const onZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value);
    setValue("address.zip", masked, { shouldValidate: true });
  };
  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const only = digitsOnly(e.target.value).slice(0, 8);
    setValue("address.number", only, { shouldValidate: true });
  };
  const onLetters = (path: keyof HospedeFormInput["address"]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const clean = lettersOnly(e.target.value);
      setValue(`address.${path}` as any, clean, { shouldValidate: true });
    };

  // ⛑️ Wrapper garante que o submit chama seu onSubmit com HospedeFormOutput
  const onSubmitWrapped = React.useCallback(
    (data: HospedeFormInput) => {
      const parsed = hospedeSchema.parse(data); // aplica defaults => Output
      onSubmit(parsed);
    },
    [onSubmit]
  );

  return (
    <form onSubmit={handleSubmit(onSubmitWrapped)} className="space-y-4">
      {/* Dados pessoais */}
      <div className="surface-2">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <Field label="Nome completo" error={errors.fullName?.message}>
              <Input {...register("fullName")} placeholder="Ex.: Ana Souza" />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-6">
            <Field label="E-mail" error={errors.email?.message}>
              <Input type="email" placeholder="ana@ex.com" {...register("email")} />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-4">
            <Field
              label={
                <div className="flex items-center gap-1">
                  Telefone
                  <div className="group relative cursor-help">
                    <Info size={14} className="opacity-60 group-hover:opacity-100 transition" />
                    <span className="absolute left-1/2 bottom-full mb-1 hidden group-hover:block -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[11px] text-white shadow-md">
                      Para número internacional, comece com +
                    </span>
                  </div>
                </div>
              }
              
              error={errors.phone?.message}
            >
              <Input
                placeholder="(11) 98888-0001"
                inputMode="tel"
                {...register("phone")}
                onChange={onPhoneChange}
              />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-4">
            <Field label="Tipo de documento">
              <Select {...register("documentType")}>
                <option value="">Selecione…</option>
                <option value="cpf">CPF</option>
                <option value="rg">RG</option>
                <option value="passport">Passaporte</option>
                <option value="other">Outro</option>
              </Select>
            </Field>
          </div>

          <div className="col-span-12 md:col-span-4">
            <Field
              label="Documento"
              
              error={errors.documentId?.message}
            >
              <Input
                placeholder={docType === "cpf" ? "000.000.000-00" : "RG / Passaporte / Outro"}
                {...register("documentId")}
                onChange={docType === "cpf" ? onCPFChange : undefined}
                inputMode={docType === "cpf" ? "numeric" : "text"}
              />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-4">
            <Field label="Nascimento">
              <Input type="date" {...register("birthDate")} />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-4">
            <Field label="Status">
              <Select {...register("status")}>
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
            <Field label="Rua / Logradouro" error={errors.address?.street?.message as string | undefined}>
              <Input placeholder="Av. Paulista" {...register("address.street")} />
            </Field>
          </div>

          <div className="col-span-6 md:col-span-3 lg:col-span-2">
            <Field label="Número" error={errors.address?.number?.message as string | undefined}>
              <Input
                placeholder="123"
                inputMode="numeric"
                {...register("address.number")}
                onChange={onNumberChange}
              />
            </Field>
          </div>

          <div className="col-span-6 md:col-span-3 lg:col-span-4">
            <Field label="Complemento">
              <Input placeholder="Apto 12, Bloco B" {...register("address.complement")} />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-4">
            <Field label="Bairro">
              <Input placeholder="Bela Vista" {...register("address.district")} onChange={onLetters("district")} />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-4">
            <Field label="Cidade">
              <Input placeholder="São Paulo" {...register("address.city")} onChange={onLetters("city")} />
            </Field>
          </div>

          <div className="col-span-6 md:col-span-2">
            <Field label="UF (opcional)">
              <Select {...register("address.state")}>
                <option value="">—</option>
                {UF_CODES.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="col-span-6 md:col-span-2">
            <Field label="CEP" error={errors.address?.zip?.message as string | undefined}>
              <Input
                placeholder="00000-000"
                inputMode="numeric"
                {...register("address.zip")}
                onChange={onZipChange}
              />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-4">
            <Field label="País">
              <Input placeholder="Brasil" {...register("address.country")} onChange={onLetters("country")} />
            </Field>
          </div>
        </div>
      </div>

      {/* Observações + Ações */}
      <div className="surface-2">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <Field label="Observações">
              <Textarea rows={3} placeholder="Notas internas…" {...register("notes")} />
            </Field>
          </div>
        </div>
      </div>

      <div className="surface-2 flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}