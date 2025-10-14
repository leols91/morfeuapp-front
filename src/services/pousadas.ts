// novo arquivo
import { api } from "@/lib/api";

export type PousadaLite = {
  id: string;
  legalName: string;
  tradeName: string;
  phone?: string | null;
  // opcional (se o backend já retornar)
  isDefault?: boolean;
};

export async function listMyPousadas(): Promise<PousadaLite[]> {
  const { data } = await api.get("/pousadas");
  // aceite tanto {data:[]} quanto []
  const rows = (data?.data ?? data ?? []) as any[];
  // normaliza nominalmente
  return rows.map((p) => ({
    id: p.id,
    legalName: p.legalName ?? p.name ?? "",
    tradeName: p.tradeName ?? p.nickname ?? p.legalName ?? "",
    phone: p.phone ?? null,
    isDefault: p.isDefault ?? p.usuarioPousada?.isDefault ?? false,
  }));
}