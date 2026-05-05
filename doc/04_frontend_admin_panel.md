# Frontend Admin Panel (Especificação UI/UX)

Seguindo padrões Elite de engenharia de frontend, o painel de administração para os donos dos estabelecimentos (Tenants) e Superadmins deve ser rápido, seguro e ter uma experiência de usuário (UX) impecável ("Pixel-perfect").

## 1. Stack Tecnológica

*   **Framework:** Next.js 15 (App Router). Uso extensivo de *React Server Components* (RSC) para carregar os dados diretamente do Supabase sem expor lógicas no client-side.
*   **Estilização:** TailwindCSS v4.
*   **Componentes:** shadcn/ui + Radix Primitives (Foco severo em acessibilidade - A11y).
*   **Validação de Dados:** Zod.
*   **Fetching/Mutations (Client-side):** SWR ou TanStack Query (React Query) para lógicas complexas de formulários.

## 2. Estrutura de Rotas (Next.js)

```text
app/
├── (auth)/             # Telas não logadas
│   ├── login/
│   └── reset-password/
├── (tenant)/           # Dashboard da empresa (RLS ativo)
│   ├── dashboard/      # Métricas e próximos agendamentos
│   ├── agenda/         # Visão de calendário (React Big Calendar ou FullCalendar)
│   ├── funcionarios/   # CRUD + Integração OAuth com Google
│   ├── servicos/       # Definição de catálogo e durações
│   └── configuracoes/  # Horários de expediente (Grade) e Bot
└── (superadmin)/       # Gestão do SaaS
    ├── empresas/       # Gerenciar contas e assinaturas
    └── faturamento/
```

## 3. Integração com Autenticação e Supabase

Utilizaremos o pacote `@supabase/ssr` para lidar com cookies e sessões tanto no Server (RSC, Middleware, Server Actions) quanto no Client.

O **Middleware** do Next.js interceptará todas as requisições para `/(tenant)` e garantirá que:
1. O usuário está logado.
2. O usuário pertence à empresa que está tentando acessar (injetando os dados na sessão).

## 4. UX e Guias Visuais (@frontend-design)

*   **Estado Vazio (Empty States):** Telas como "Funcionários" devem exibir um Call-to-Action proeminente "Adicionar primeiro funcionário" juntamente com uma ilustração minimalista caso a tabela esteja vazia.
*   **Formatação Rigorosa:** Todos os campos de valor/moeda na tabela `servicos` devem utilizar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
*   **Feedback Assíncrono:** Todas as ações críticas (ex: Cancelar um agendamento pelo painel) devem incluir um `<Dialog>` de confirmação e exibir botões em estado de *loading* (spinners) para prevenir submissão dupla. Toasts (sonner/toast) para sucesso ou falha.
*   **Visual Validator:** Consistência de bordas (ex: `rounded-md` universal), espaçamentos harmônicos (sistema múltiplo de 4px, `gap-4`, `p-6`) e uso da paleta de cores primária para ações principais, deixando ações destrutivas estritamente para o tom *Destructive (Red)*.
