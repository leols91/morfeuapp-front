"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";

const schema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  doc: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  // extras (opcionais)
  nacionalidade: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  nascimento: z.string().optional(), // "YYYY-MM-DD"
  notas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (payload: FormData) => Promise<void>;
};

export function CreateHospedeModal({ open, onClose, onCreated }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      doc: "",
      email: "",
      telefone: "",
      nacionalidade: "",
      cidade: "",
      uf: "",
      cep: "",
      endereco: "",
      nascimento: "",
      notas: "",
    },
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState<string | null>(null);
  const [showMore, setShowMore] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    // ESC fecha
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(values: FormData) {
    setError(null);
    setSaving(true);
    try {
      await onCreated({
        ...values,
        // normaliza strings vazias para undefined onde fizer sentido
        email: values.email || undefined,
        doc: values.doc || undefined,
        telefone: values.telefone || undefined,
        nacionalidade: values.nacionalidade || undefined,
        cidade: values.cidade || undefined,
        uf: values.uf || undefined,
        cep: values.cep || undefined,
        endereco: values.endereco || undefined,
        nascimento: values.nascimento || undefined,
        notas: values.notas || undefined,
      });
      onClose();
      form.reset();
      setShowMore(false);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao cadastrar hóspede.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-2xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Cadastrar hóspede</h3>
          <p className="text-sm opacity-70">Preencha os dados essenciais. Você pode completar depois.</p>
        </ModalBase.Header>

        {/* body com rolagem quando necessário */}
        <ModalBase.Body className="max-h-[70vh] overflow-y-auto">
          <form id="form-create-hospede" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Essenciais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nome" error={form.formState.errors.nome?.message}>
                <Input {...form.register("nome")} placeholder="Nome completo" />
              </Field>

              <Field label="Documento (opcional)">
                <Input {...form.register("doc")} placeholder="RG/CPF/Passaporte" />
              </Field>

              <Field label="Telefone (opcional)">
                <Input {...form.register("telefone")} placeholder="(DDD) 99999-9999" />
              </Field>

              <Field label="E-mail (opcional)" error={form.formState.errors.email?.message}>
                <Input type="email" {...form.register("email")} placeholder="ex.: maria@email.com" />
              </Field>
            </div>

            {/* Toggle “Mais campos” */}
            <button
              type="button"
              onClick={() => setShowMore((s) => !s)}
              className="text-sm underline opacity-80 hover:opacity-100"
            >
              {showMore ? "Ocultar campos adicionais" : "Mostrar campos adicionais"}
            </button>

            {showMore && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Nacionalidade (opcional)">
                  <Input {...form.register("nacionalidade")} placeholder="ex.: Brasileira" />
                </Field>

                <Field label="Nascimento (opcional)">
                  <Input type="date" {...form.register("nascimento")} />
                </Field>

                <Field label="CEP (opcional)">
                  <Input {...form.register("cep")} placeholder="00000-000" />
                </Field>

                <Field label="UF (opcional)">
                  <Input {...form.register("uf")} placeholder="ex.: SP" />
                </Field>

                <Field label="Cidade (opcional)" className="md:col-span-2">
                  <Input {...form.register("cidade")} placeholder="ex.: São Paulo" />
                </Field>

                <Field label="Endereço (opcional)" className="md:col-span-2">
                  <Input {...form.register("endereco")} placeholder="Rua, número, complemento" />
                </Field>

                <Field label="Notas (opcional)" className="md:col-span-2">
                  <Textarea rows={3} {...form.register("notas")} placeholder="Observações gerais…" />
                </Field>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </ModalBase.Body>

        <ModalBase.Footer className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button form="form-create-hospede" type="submit" disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}