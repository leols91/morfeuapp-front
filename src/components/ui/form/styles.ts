export const colors = {
  // borda base: cinza claro no light, cinza translúcido no dark
  border: "border-black/15 dark:border-white/10",

  // hover: roxo no claro, roxo com transparência no dark (AJUSTE DE SUTILEZA APLICADO AQUI)
  borderHover: "hover:border-purple-400/80 dark:hover:border-purple-400/40",

  // foco: roxo + glow suave
  ring: "focus-within:border-purple-500 focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.22)]",

  bg: "bg-white dark:bg-[#0F172A]",
  label: "text-xs opacity-70",
  help: "text-[11px] opacity-70 mt-1",
  error: "text-[12px] text-red-500 mt-1",
  divider: "border-black/10 dark:border-white/10",
};

export const fieldWrap =
  "group mt-1 rounded-xl border transition-all duration-200 ease-out " +
  colors.border + " " + colors.borderHover + " " + colors.ring;

export const inputBase =
  "h-10 w-full rounded-xl bg-transparent px-3 outline-none border-0 ring-0 text-[15px]";

export const selectBase =
  "h-10 w-full rounded-xl bg-transparent px-3 pr-9 outline-none border-0 ring-0 appearance-none text-[15px]";

export const textareaBase =
  "w-full rounded-xl bg-transparent px-3 py-2 outline-none border-0 ring-0 text-[15px]";

export const sectionWrap =
  "surface-2 rounded-2xl transition-colors";