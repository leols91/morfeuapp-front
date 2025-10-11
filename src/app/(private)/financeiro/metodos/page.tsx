"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { Th, Td, fmtDateTime } from "@/components/financeiro/utils";
import ModalBase from "@/components/ui/ModalBase";
import { Edit, Trash2 } from "lucide-react";
import {
  listPaymentMethods,
  deletePaymentMethod,
  type PaymentMethodDTO,
} from "@/services/financeiro";
import { PaymentMethodFormModal } from "@/components/financeiro/PaymentMethodFormModal";

export default function PaymentMethodsPage() {
  const [q, setQ] = React.useState("");
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<PaymentMethodDTO | null>(null);
  const [deleting, setDeleting] = React.useState<PaymentMethodDTO | null>(null);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["payment-methods", q],
    queryFn: () => listPaymentMethods({ q }),
  });

  const rows = (data ?? []) as PaymentMethodDTO[];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Métodos de pagamento</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
        >
          Novo método
        </Button>
      </div>

      {/* Filtro */}
      <div className="surface-2">
        <form
          className="grid grid-cols-12 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            refetch();
          }}
        >
          <div className="col-span-12 md:col-span-8">
            <Field label="Buscar por código ou descrição">
              <Input
                placeholder="Ex.: PIX, CARTAO_CREDITO, Dinheiro…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Field>
          </div>
          <div className="col-span-12 md:col-span-4 flex justify-end">
            <Button type="submit" variant="outline" className="mr-2" disabled={isFetching}>
              {isFetching ? "Filtrando…" : "Aplicar"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setQ("");
                refetch();
              }}
            >
              Limpar
            </Button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="surface">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Código</Th>
                <Th>Descrição</Th>
                <Th>Criação</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {rows.map((m) => (
                <tr key={m.code} className="hover:bg-black/5 dark:hover:bg:white/5">
                  <Td className="font-medium">{m.code}</Td>
                  <Td className="truncate max-w-[380px]">{m.description}</Td>
                  <Td>{m.createdAt ? fmtDateTime(m.createdAt) : "—"}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Editar método"
                        aria-label="Editar método"
                        onClick={() => { setEditing(m); setOpenForm(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Excluir método"
                        aria-label="Excluir método"
                        onClick={() => setDeleting(m)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <Td colSpan={4} className="text-center py-8 opacity-70">
                    Nenhum método cadastrado
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {openForm && (
        <PaymentMethodFormModal
          open={openForm}
          method={editing ?? undefined}
          onClose={() => setOpenForm(false)}
          onSaved={() => {
            setOpenForm(false);
            setEditing(null);
            refetch();
          }}
        />
      )}

      {/* Confirmar exclusão */}
      {deleting && (
        <ModalBase open={!!deleting} onClose={() => setDeleting(null)}>
          <ModalBase.Card maxWidth="max-w-md">
            <ModalBase.Header>
              <h3 className="text-lg font-semibold">Excluir método</h3>
              <p className="text-xs opacity-70 mt-0.5">
                {deleting.code} • {deleting.description}
              </p>
            </ModalBase.Header>
            <ModalBase.Body>
              <p className="text-sm">
                Tem certeza que deseja excluir este método de pagamento? Esta ação não poderá ser desfeita.
              </p>
            </ModalBase.Body>
            <ModalBase.Footer className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleting(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  try {
                    await deletePaymentMethod(deleting.code);
                    toast.success("Método excluído!");
                    setDeleting(null);
                    refetch();
                  } catch (e: any) {
                    toast.error(
                      e?.response?.data?.message ?? e?.message ?? "Falha ao excluir método."
                    );
                  }
                }}
              >
                Excluir
              </Button>
            </ModalBase.Footer>
          </ModalBase.Card>
        </ModalBase>
      )}
    </div>
  );
}