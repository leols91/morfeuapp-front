export function getActivePousadaId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("mrf.pousada");
}

export function setActivePousadaId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("mrf.pousada", id);
}

export type PousadaOption = { id: string; name: string };
