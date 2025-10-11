"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { Th, Td, fmtDateTime } from "@/components/financeiro/utils";
import { SupplierFormModal } from "@/components/financeiro/SupplierFormModal";
import ModalBase from "@/components/ui/ModalBase";
import { Edit, Trash2 } from "lucide-react";
import {
  listSuppliers,
  deleteSupplier,
  type SupplierDTO,
} from "@/services/estoque";
import toast from "react-hot-toast";

export default function FornecedoresPage() {
  const [q, setQ] = React.useState("");
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<SupplierDTO | null>(null);
  const [deleting, setDeleting] = React.useState<SupplierDTO | null>(null);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["suppliers", q],
    queryFn: () => listSuppliers({ q }),
  });

  const rows = (data ?? []) as SupplierDTO[];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Fornecedores</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
        >
          Novo fornecedor
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
            <Field label="Buscar por nome, documento, telefone ou e-mail">
              <Input
                placeholder="Ex.: Mercado, 00.000.000/0000-00, (11) 9..., email@..."
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
                <Th>Nome/Razão</Th>
                <Th>Documento</Th>
                <Th>Telefone</Th>
                <Th>E-mail</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td className="font-medium">{s.legalName}</Td>
                  <Td className="truncate max-w-[180px]">{s.documentId ?? "—"}</Td>
                  <Td className="truncate max-w-[160px]">{s.phone ?? "—"}</Td>
                  <Td className="truncate max-w-[220px]">{s.email ?? "—"}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Editar fornecedor"
                        aria-label="Editar fornecedor"
                        onClick={() => { setEditing(s); setOpenForm(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Excluir fornecedor"
                        aria-label="Excluir fornecedor"
                        onClick={() => setDeleting(s)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-center py-8 opacity-70">
                    Nenhum fornecedor encontrado
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form (Criar/Editar) */}
      {openForm && (
        <SupplierFormModal
          open={openForm}
          supplier={editing ?? undefined}
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
              <h3 className="text-lg font-semibold">Excluir fornecedor</h3>
              <p className="text-xs opacity-70 mt-0.5">
                {deleting.legalName}
                {deleting.documentId ? ` • ${deleting.documentId}` : ""}
              </p>
            </ModalBase.Header>
            <ModalBase.Body>
              <p className="text-sm">
                Tem certeza que deseja excluir este fornecedor? Esta ação não poderá ser desfeita.
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
                    await deleteSupplier(deleting.id);
                    toast.success("Fornecedor excluído!");
                    setDeleting(null);
                    refetch();
                  } catch (e: any) {
                    toast.error(
                      e?.response?.data?.message ?? e?.message ?? "Falha ao excluir fornecedor."
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