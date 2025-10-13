"use client";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input, Checkbox } from "@/components/ui/form/Field";
import { getPousadaConfigObject, upsertPousadaConfigs, KEYS } from "@/services/settings";
import toast from "react-hot-toast";

const CHANNELS = [
  {
    keyEnabled: KEYS.channel_enabled_booking,
    keyPercent: KEYS.channel_commission_booking,
    label: "Booking.com",
  },
  {
    keyEnabled: KEYS.channel_enabled_airbnb,
    keyPercent: KEYS.channel_commission_airbnb,
    label: "Airbnb",
  },
  {
    keyEnabled: KEYS.channel_enabled_expedia,
    keyPercent: KEYS.channel_commission_expedia,
    label: "Expedia",
  },
] as const;

export function SalesChannelsTab() {
  const { data, refetch } = useQuery({
    queryKey: ["settings", "pousada", "channels"],
    queryFn: getPousadaConfigObject,
  });

  const [state, setState] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    CHANNELS.forEach((c) => {
      next[c.keyEnabled] = data[c.keyEnabled] ?? "false";
      next[c.keyPercent] = data[c.keyPercent] ?? "0";
    });
    setState(next);
  }, [data]);

  const salvar = useMutation({
    mutationFn: async () => upsertPousadaConfigs(state),
    onSuccess: () => { toast.success("Canais salvos!"); refetch(); },
    onError: () => toast.error("Falha ao salvar."),
  });

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
      {CHANNELS.map((c) => {
        const enabled = (state[c.keyEnabled] ?? "false") === "true";
        return (
          <div key={c.keyEnabled} className="surface-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{c.label}</div>
              <Checkbox
                label="Ativar canal"
                checked={enabled}
                onChange={(e) =>
                  setState((p) => ({ ...p, [c.keyEnabled]: e.target.checked ? "true" : "false" }))
                }
              />
            </div>

            {enabled && (
              <div className="grid grid-cols-12 gap-3 mt-3">
                <div className="col-span-12 md:col-span-4">
                  <Field label="Comissão (%)">
                    <Input
                      inputMode="decimal"
                      value={state[c.keyPercent] ?? "0"}
                      onChange={(e) =>
                        setState((p) => ({ ...p, [c.keyPercent]: e.target.value }))
                      }
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-end">
        <Button type="submit" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}