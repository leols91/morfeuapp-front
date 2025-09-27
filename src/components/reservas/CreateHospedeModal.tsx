"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { createHospede } from "@/services/reservas";
import type { HospedeDTO } from "@/types/reserva";
import Link from "next/link";
import type { Route } from "next";

const schema = z.object({
  // ESSENCIAIS
  nome: z.string().min(3, "Informe o nome"),
  documento: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),

  // OPCIONAIS (colapsados por padrão)
  dataNascimento: z.string().optional(),
  nacionalidade: z.string().optional(),
  enderecoLogradouro: z.string().optional(),
  enderecoNumero: z.string().optional(),
  enderecoComplemento: z.string().optional(),
  enderecoBairro: z.string().optional(),
  enderecoCidade: z.string().optional(),
  enderecoEstado: z.string().optional(),
  enderecoCep: z.string().optional(),
  observacoes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (h: HospedeDTO) => void;
};

export function CreateHospedeModal({ open, onClose, onCreated }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showMore, setShowMore] = React.useState(false);

  if (!open) return null;

  async function onSubmit(values: FormData) {
    setError(null);
    setSaving(true);
    try {
      // Para o backend: envie apenas o que fizer sentido (aqui, exemplo simples)
      const h = await createHospede({
        nome: values.nome,
        documento: values.documento || undefined,
        email: values.email || undefined,
        telefone: values.telefone || undefined,
        // os campos extras podem ir num endpoint de update posterior, se preferir
      });
      onCreated(h);
      onClose();
      form.reset();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao cadastrar hóspede.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />

      {/* modal */}
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft">
          {/* header */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">Cadastrar hóspede</h3>
            <p className="text-sm opacity-70">Preencha os dados essenciais. Você pode completar depois.</p>
          </div>

          {/* body (scroll) */}
          <div className="max-h-[70vh] overflow-y-auto px-4 py-4 md:px-6 md:py-6">
            <form
              id="form-create-hospede"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Essenciais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs opacity-70 block">Nome</label>
                  <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("nome")} />
                  {form.formState.errors.nome && <p className="text-xs text-red-500 mt-1">{form.formState.errors.nome.message}</p>}
                </div>

                <div>
                  <label className="text-xs opacity-70 block">Documento</label>
                  <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("documento")} />
                </div>
                <div>
                  <label className="text-xs opacity-70 block">Telefone</label>
                  <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("telefone")} />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs opacity-70 block">E-mail</label>
                  <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("email")} />
                  {form.formState.errors.email && <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>}
                </div>
              </div>

              {/* Toggle “Mais campos” */}
              <button
                type="button"
                className="text-sm underline opacity-80 hover:opacity-100"
                onClick={() => setShowMore((v) => !v)}
              >
                {showMore ? "Ocultar campos avançados" : "Mais campos (opcional)"}
              </button>

              {/* Avançados (colapsados por padrão) */}
              {showMore && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs opacity-70 block">Data de nascimento</label>
                      <input type="date" className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("dataNascimento")} />
                    </div>
                    <div>
                      <label className="text-xs opacity-70 block">Nacionalidade</label>
                      <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("nacionalidade")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs opacity-70 block">Logradouro</label>
                      <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("enderecoLogradouro")} />
                    </div>
                    <div>
                      <label className="text-xs opacity-70 block">Número</label>
                      <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("enderecoNumero")} />
                    </div>
                    <div>
                      <label className="text-xs opacity-70 block">Complemento</label>
                      <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("enderecoComplemento")} />
                    </div>
                    <div>
                      <label className="text-xs opacity-70 block">Bairro</label>
                      <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("enderecoBairro")} />
                    </div>
                    <div>
                      <label className="text-xs opacity-70 block">Cidade</label>
                      <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("enderecoCidade")} />
                    </div>
                    <div>
                      <label className="text-xs opacity-70 block">Estado</label>
                      <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("enderecoEstado")} />
                    </div>
                    <div>
                      <label className="text-xs opacity-70 block">CEP</label>
                      <input className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3" {...form.register("enderecoCep")} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs opacity-70 block">Observações</label>
                    <textarea rows={3} className="mt-1 w-full rounded-2xl border-subtle bg-transparent px-3 py-2" {...form.register("observacoes")} />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* footer fixo */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-subtle flex items-center justify-between">
            <Link
              href={"/hospedes/novo?return=/reservas/nova" as Route}
              className="text-sm underline opacity-80 hover:opacity-100"
            >
              Cadastro completo →
            </Link>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button form="form-create-hospede" type="submit" disabled={saving}>
                {saving ? "Salvando…" : "Salvar e usar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}