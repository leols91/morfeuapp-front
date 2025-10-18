"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import type { AcomodacaoDTO } from "@/types/acomodacao";
import { getQuarto } from "@/services/acomodacoes";
import {
  CheckCircle,
  BedDouble,
  AlertTriangle,
  Sparkles,      // ← substitui Broom
  CircleCheck,
  TriangleAlert,
} from "lucide-react";

/* ===== Mapas de tradução ===== */
const ROOM_STATUS_LABEL: Record<string, string> = {
  available: "Disponível",
  occupied: "Ocupado",
  maintenance: "Em manutenção",
};
const HK_STATUS_LABEL: Record<string, string> = {
  clean: "Limpo",
  dirty: "Sujo",
  inspected: "Inspecionado",
  ooo: "Fora de operação",
};

/* ===== Ícones ===== */
// use React.ReactNode ao invés de JSX.Element
const RoomStatusIcon: Record<string, React.ReactNode> = {
  available: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  occupied: <BedDouble className="w-4 h-4 text-blue-500" />,
  maintenance: <AlertTriangle className="w-4 h-4 text-amber-500" />,
};
const HkStatusIcon: Record<string, React.ReactNode> = {
  clean: <Sparkles className="w-4 h-4 text-emerald-500" />,
  dirty: <TriangleAlert className="w-4 h-4 text-rose-500" />,
  inspected: <CircleCheck className="w-4 h-4 text-blue-500" />,
  ooo: <AlertTriangle className="w-4 h-4 text-amber-500" />,
};

/* ===== UI Helpers ===== */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/10 px-3 py-1 text-xs">
      {children}
    </span>
  );
}
function Badge({ status }: { status: AcomodacaoDTO["status"] }) {
  const map: Record<AcomodacaoDTO["status"], string> = {
    available:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    occupied:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    maintenance:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-[0_1px_0_0_rgba(0,0,0,0.03)]",
        map[status] ??
          "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30"
      )}
    >
      {RoomStatusIcon[status] ?? null}
      {ROOM_STATUS_LABEL[status] ?? status}
    </span>
  );
}
function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-3 py-2">
      <div className="col-span-12 md:col-span-4 text-xs opacity-70">{label}</div>
      <div className="col-span-12 md:col-span-8 text-sm">
        {value ?? <span className="opacity-60">—</span>}
      </div>
    </div>
  );
}
function typeLabel(mode?: string) {
  if (mode === "shared") return "Cama/Dormitório";
  if (mode === "private") return "Quarto privado";
  return mode ?? "—";
}

/* ===== Tabs (sem Capacidade) ===== */
type TabKey = "geral" | "comodidades" | "descricao";
const TABS: { key: TabKey; label: string }[] = [
  { key: "geral", label: "Geral" },
  { key: "comodidades", label: "Comodidades" },
  { key: "descricao", label: "Descrição" },
];

export function ViewAcomodacaoModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: AcomodacaoDTO | null;
}) {
  const quartoId = item?.id ?? "";
  const [active, setActive] = React.useState<TabKey>("geral");

  React.useEffect(() => {
    if (open) setActive("geral");
  }, [open]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quarto", quartoId, open],
    queryFn: () => getQuarto(quartoId),
    enabled: open && !!quartoId,
    refetchOnWindowFocus: false,
  });

  const q = data;

  // Derivações
  const roomTypeName = q?.roomType?.name ?? "—";
  const occupancyMode = q?.roomType?.occupancyMode;
  const typeText = typeLabel(occupancyMode);

  const basePadrao = q?.roomType?.baseOccupancy;
  const maxPadrao = q?.roomType?.maxOccupancy;
  const baseOverride = q?.baseOccupancy ?? undefined;
  const maxOverride = q?.maxOccupancy ?? undefined;
  const efetivaBase = baseOverride ?? basePadrao;
  const efetivaMax = maxOverride ?? maxPadrao;

  const herdadas =
    (q?.roomType?.amenities ?? [])
      .map((a) => a?.amenity?.name)
      .filter(Boolean) as string[];
  const especificas =
    (q?.amenities ?? [])
      .map((a) => a?.amenity?.name)
      .filter(Boolean) as string[];

  return (
    <ModalBase open={open} onClose={onClose}>
      <div className="w-[min(92vw,820px)] rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200/70 dark:border-white/10 shadow-soft">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-gray-200/70 dark:border-white/10">
          <div className="min-w-0">
            <div className="text-xs opacity-70">{typeText}</div>
            <h3 className="text-base font-semibold truncate">
              {q?.code ?? item?.name ?? "Acomodação"}
            </h3>
          </div>
          {item?.status && <Badge status={item.status} />}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 border-b border-gray-200/70 dark:border-white/10">
          <div className="flex gap-1 overflow-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                className={cn(
                  "px-3 py-2 text-sm rounded-t-lg border-b-2 -mb-[1px]",
                  active === t.key
                    ? "border-blue-500 font-semibold"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {isLoading && <div className="text-sm opacity-70">Carregando detalhes…</div>}
          {isError && (
            <div className="text-sm text-rose-600">
              Não foi possível carregar os detalhes desta acomodação.
            </div>
          )}

          {!isLoading && !isError && q && (
            <div className="max-h-[65vh] overflow-auto pr-1">
              {active === "geral" && (
                <div className="space-y-2">
                  <div className="surface-2">
                    <div className="text-sm font-semibold mb-1">Identificação</div>
                    <Row label="Nome" value={q.name || "—"} />
                    <Row label="Tipo de quarto" value={roomTypeName} />
                    <Row label="Código / Número" value={q.code} />
                    <Row label="Andar" value={q.floor || "—"} />
                  </div>

                  <div className="surface-2">
                    <div className="text-sm font-semibold mb-1">Status</div>
                    <Row
                      label="Status do quarto"
                      value={
                        <span className="inline-flex items-center gap-2">
                          {RoomStatusIcon[q.roomStatusCode] ?? null}
                          {ROOM_STATUS_LABEL[q.roomStatusCode] ?? q.roomStatusCode}
                        </span>
                      }
                    />
                    <Row
                      label="Governança"
                      value={
                        <span className="inline-flex items-center gap-2">
                          {HkStatusIcon[q.housekeepingStatusCode] ?? null}
                          {HK_STATUS_LABEL[q.housekeepingStatusCode] ?? q.housekeepingStatusCode}
                        </span>
                      }
                    />
                  </div>

                  <div className="surface-2">
                    <div className="text-sm font-semibold mb-1">Capacidade efetiva</div>
                    <Row label="Base" value={efetivaBase ?? "—"} />
                    <Row label="Máxima" value={efetivaMax ?? "—"} />
                  </div>
                </div>
              )}

              {active === "comodidades" && (
                <div className="space-y-2">
                  <div className="surface-2">
                    <div className="text-sm font-semibold mb-2">Herdadas do tipo</div>
                    {herdadas.length === 0 ? (
                      <div className="text-sm opacity-70">—</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {herdadas.map((n, i) => (
                          <Chip key={`${n}-${i}`}>{n}</Chip>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="surface-2">
                    <div className="text-sm font-semibold mb-2">Específicas do quarto</div>
                    {especificas.length === 0 ? (
                      <div className="text-sm opacity-70">—</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {especificas.map((n, i) => (
                          <Chip key={`${n}-${i}`}>{n}</Chip>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {active === "descricao" && (
                <div className="space-y-2">
                  <div className="surface-2">
                    <div className="text-sm font-semibold mb-1">Descrição</div>
                    <div className="text-sm whitespace-pre-wrap">
                      {q.description?.trim() || <span className="opacity-70">—</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button type="button" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}