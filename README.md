# MorfeuApp Front — Starter

Starter Next.js (App Router) + Tailwind + TanStack Query + Axios + RHF + Zod, com layout privado, login e infraestrutura de autenticação/tenancy.

## Requisitos
- Node 18+
- pnpm (recomendado) ou npm/yarn

## Instalação
```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Configurar backend base URL
Edite `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333/api
```

## Login
A rota de login chama `POST /auth/login` e depois `GET /users/me` para popular o contexto.
O token é salvo em `localStorage` como `mrf.token` (fácil de migrar depois para sessão httpOnly via rotas de API do Next).

## Tenancy (pousada)
- O `pousadaId` ativo é salvo como `mrf.pousada` no `localStorage`.
- O `axios` injeta `X-Pousada-Id` em cada request autenticado.

## Estrutura
- `src/app/(public)/login` — página de login
- `src/app/(private)/layout.tsx` — layout protegido
- `src/app/(private)/dashboard` — dashboard inicial
- `src/components/layout` — `Sidebar`, `Topbar`, `TenantSwitcher`
- `src/components/ui` — `Button`, `Input`, `Card` (estilo shadcn-like)
- `src/lib/api.ts` — axios com interceptors
- `src/lib/auth.tsx` — contexto de auth
- `src/lib/tenants.ts` — helpers de tenancy

## Próximos passos
- Implementar páginas de **Reservas** (lista/criação/detalhe), **Folio** (lançamentos/pagamentos).
- Substituir `localStorage` por sessão httpOnly (proxy em `/app/api/*`). 
- Adicionar componentes shadcn/ui via CLI se desejar: `npx shadcn@latest init` e `npx shadcn@latest add button input card ...`
