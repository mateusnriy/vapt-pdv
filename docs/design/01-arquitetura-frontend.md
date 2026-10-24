# 01 — Arquitetura do frontend (Web/PWA)

> **Premissas Fundamentais (ADR-08, RNF01, RNF05, RNF11):**
> 1. **Autoridade do Servidor:** Nenhuma regra de negócio crítica reside no cliente. A UI apresenta dados, valida formatos de entrada e despacha comandos para a API Fastify. Estado da comanda, cálculo monetário final e transições são do servidor.
> 2. **Valores Monetários e Estimativas:** Enquanto a comanda estiver `aberta`, valores em tela são exibidos com o rótulo "Estimado" (calculados na UI em centavos inteiros via `Cents`). Ao fechar a conta (`POST /comandas/:id/fechar`), os valores oficiais consolidados pelo backend substituem a prévia.
> 3. **Atualização por Polling:** O frontend atualiza dados operacionais via polling periódico configurado com TanStack Query (`staleTime` curto, sem WebSockets no Módulo 1).
> 4. **Tipagem Estrita Compartilhada:** DTOs e entidades TypeScript (`Usuario`, `Produto`, `Comanda`, `ItemComanda`) refletem fielmente os schemas do Prisma e contratos REST.
> 5. **PWA e Operação Offline na v1:** Abertura sem conexão exibe o shell PWA com dados cacheados e carimbo temporal, exibindo banner "Sem conexão" e desabilitando mutações (sem fila assíncrona de vendas na v1).

## 1. Stack e versões-alvo

| Camada | Escolha | Observação |
|---|---|---|
| Linguagem | TypeScript 5.7+ (`strict: true`) | DTOs e interfaces compartilhadas com o modelo de domínio do backend |
| Build & Dev | Vite 8+ | Hot Module Replacement (HMR) ultrarrápido; build em `frontend/dist/` |
| UI & Core | React 19 | Componentes funcionais com hooks; sem classes; React Server Components não utilizados |
| Roteamento | React Router 6 / Roteamento por Estado de Sessão | Suporte a URLs diretas (`/login`, `/garcom`, `/caixa`, `/kds`, `/gestao`) e despachos por perfil |
| Estado de Servidor | TanStack Query v5 (`@tanstack/react-query`) | Cache resiliente, revalidação em background, deduplicação de requisições e mutações otimistas |
| Estado de Sessão & UI | Zustand v5 (`zustand`) | Stores leves e desacopladas: `useSessionStore` (operador/perfil ativo) e `useComandaStore` (carrinho/mesa ativa) |
| Estilização & Design Tokens | Tailwind CSS 3.4+ integrado a `tokens.css` | Mapeamento 1:1 dos tokens semânticos de `DESIGN.md` via `tailwind.config.js` e variáveis em `index.css`. Proibidas cores fora da paleta |
| Ícones | `lucide-react` + `icon-pix.svg` | Ícones minimalistas em SVG vetorizado (sem emojis, traço 2px); tree-shaking habilitado |
| Tipografia | Plus Jakarta Sans (`woff2` local / Google Fonts) | Fallback `system-ui`; classes utilitárias `tabular-nums` obrigatórias em valores numéricos |
| PWA & Service Worker | `vite-plugin-pwa` (Workbox) | Shell offline, manifest web e instalação como aplicativo móvel para garçons |
| Linter & Qualidade | `oxlint` (Rust-based linter) | Validação estrita de código, JSX e regras de performance |

## 2. Variáveis de ambiente (`frontend/.env.example`)

```
VITE_API_CORE_URL=/api            # proxy same-origin para o Fastify :3000
VITE_API_KDS_URL=/api/kds         # satélite KDS (Módulo 2+)
VITE_API_FID_URL=/api/fid         # satélite Fidelidade (Módulo 2+)
VITE_API_BI_URL=/api/bi           # satélite Analytics/BI (Módulo 2+)
VITE_QTD_MESAS=30
VITE_NOME_ESTABELECIMENTO="VaptPDV Bar"
VITE_SLA_ATENCAO_MIN=10
VITE_SLA_ATRASO_MIN=15
VITE_SLA_RETIRADA_ATENCAO_MIN=3
VITE_SLA_RETIRADA_ATRASO_MIN=6
VITE_POLL_KDS_MS=2000
VITE_POLL_SALAO_MS=5000
VITE_POLL_PRONTO_MS=3000
VITE_POLL_GESTAO_MS=30000
```
Nenhuma credencial no bundle do cliente. Sem senhas, sem `DATABASE_URL` e sem credenciais de mensageria.

## 3. Estrutura de pastas do frontend (`frontend/`)

```
frontend/
  index.html                      # lang="pt-BR", meta viewport-fit=cover, theme-color
  public/
    favicon.ico
    icon-192.png  icon-512.png
    manifest.webmanifest
  src/
    main.tsx                      # Bootstrap React 19 + QueryClientProvider
    App.tsx                       # Roteador mestre e gerenciador de estações operacionais
    index.css                     # Tailwind @layer base + CSS variables de tokens.css
    lib/
      money.ts                    # Formatação de moeda BRL, cálculos em centavos inteiros (Cents)
      datetime.ts                 # Formatação de data/hora pt-BR, cronômetros KDS, cálculo de tempo aberto
      utils.ts                    # Utilitários de classe (clsx, tailwind-merge)
      csv.ts                      # Exportação client-side para relatórios (M15)
    types/
      api.ts                      # Interfaces canônicas (Usuario, Produto, Comanda, ItemComanda, DTOs)
    services/
      apiClient.ts                # Wrapper Fetch com tratamento padronizado de ApiError e requestId
      comandas.ts                 # Funções de requisição de comandas e itens
      produtos.ts                 # Funções de produtos, estoque e cardápio
      usuarios.ts                 # Funções de colaboradores e perfis
    hooks/
      useComandas.ts              # Custom hooks TanStack Query para comandas
      useProdutos.ts              # Custom hooks TanStack Query para produtos
      useUsuarios.ts              # Custom hooks TanStack Query para operadores
    stores/
      useSessionStore.ts          # Zustand: operador logado, perfil ativo, modo da aplicação
      useComandaStore.ts          # Zustand: mesa ativa, comanda focada, carrinho local de rascunho
    components/
      ui/                         # Componentes primitivos atômicos (Button, Input, Badge, Card, Stepper, Modal, ToggleSwitch)
      common/                     # Barril de exportação de componentes compartilhados
    features/
      auth/                       # X01 Login operacional e despacho por perfil
      garcom/                     # G01–G11 Salão, mesas, comanda mobile e envio para a cozinha
      caixa/                      # C01–C17 Balcão de venda, conferência e quitação em 3 colunas
      kds/                        # K01–K07 Display de cozinha/bar em 3 colunas e tema escuro nativo
      gestao/                     # M01–M15 Painel administrativo executivo, estoque e métricas
```

## 4. Rotas e estações operacionais

| Rota / Modo | Estação | Perfis autorizados | Guarda de acesso |
|---|---|---|---|
| `/login` | X01 Login operacional | todos | Se já houver operador na sessão, permite troca direta |
| `/garcom` | G01 Salão (mesas) | `garcom`, `gerente` | Exige perfil Garçom ou Gerente; celular 390×844 |
| `/garcom/mesa/:mesa` | G03 Comanda da mesa | `garcom`, `gerente` | Abertura ou lançamento de itens na comanda |
| `/garcom/comandas` | G07 Histórico de comandas | `garcom`, `gerente` | Filtrado pelo `garcom_id` do operador |
| `/garcom/cozinha` | G08 Prontos para entrega | `garcom`, `gerente` | Fichas do KDS prontas para servir na mesa |
| `/caixa` ou `/caixa/venda` | C01 Balcão de venda | `caixa`, `gerente` | Desktop 1440×900, busca rápida F2, catálogo central |
| `/caixa/mesas` | C02 Monitor de mesas | `caixa`, `gerente` | Grade de 6 colunas com status do salão |
| `/caixa/pedidos` | C03 Histórico de pedidos | `caixa`, `gerente` | Tabela com filtros de status e datas |
| `/caixa/receber` | C04 Contas a receber | `caixa`, `gerente` | Fila de comandas fechadas aguardando pagamento |
| `/caixa/pagamento/:id` | C07 Quitação e split | `caixa`, `gerente` | 3 colunas: resumo, meios de pagamento e fiscal |
| `/caixa/concluida/:id` | C12 Venda finalizada | `caixa`, `gerente` | Recibo de consumo e impressão |
| `/kds` | K01 Fila de cozinha/bar | `cozinha`, `gerente` | TV/monitor 1920×1080 em tema escuro nativo |
| `/gestao` | M01 Visão geral (BI) | `gerente` | Dashboard executivo com 4 KPIs e gráficos |
| `/gestao/cardapio` | M02 Cardápio | `gerente` | Cadastro e inativação lógica de itens |
| `/gestao/estoque` | M05 Gestão de estoque | `gerente` | Saldos, alertas de ruptura e reposição |
| `/gestao/vendas` | M07–M11 Auditoria e BI | `gerente` | Faturamento, curva ABC e desempenho de garçons |
| `/gestao/equipe` | M12 Gestão de equipe | `gerente` | Cadastro e inativação de operadores |
| `/gestao/fiscal` | M14 Fiscal (placeholder) | `gerente` | Aviso de escopo sobre documentos fiscais |

- Se o operador tentar acessar uma rota sem permissão de seu perfil, a UI renderiza a tela X06-b (sem redirecionamentos silenciosos).
- A sessão e as preferências ativas persistem em `localStorage` (`vapt.session`, `vapt.theme`).

## 5. Mapeamento de Tokens Semânticos para Utilitários Tailwind

O arquivo `frontend/tailwind.config.js` estende o Tailwind com a paleta exata de `DESIGN.md`:

| Token `DESIGN.md` | Classe de Fundo | Classe de Borda | Classe de Texto |
|---|---|---|---|
| `bg` (Creme `#FBF7F1`) | `bg-bg` | — | — |
| `surface` (Branco `#FFFFFF`) | `bg-surface` | — | — |
| `surface-2` (`#F3ECE1`) | `bg-surface-2` | — | — |
| `border` (`#E5DACB`) | — | `border-border` | — |
| `border-strong` (`#8C7A68`) | — | `border-border-strong` | — |
| `text` (Café `#2B2019`) | — | — | `text-text` |
| `text-2` (`#6A5849`) | — | — | `text-text-2` |
| `brand` (Mostarda `#F2A81D`) | `bg-brand` | — | — |
| `on-brand` (`#2B2019`) | — | — | `text-on-brand` |
| `brand-soft` (`#FDF0D2`) | `bg-brand-soft` | — | — |
| `brand-text` (`#8A5200`) | — | — | `text-brand-text` |
| `brand-edge` (`#A86400`) | — | `border-brand-edge` | — |
| `nav` (`#3A2A21`) | `bg-nav` | — | — |
| `success` (Manjericão `#2F7D4F`) | `bg-success` | `border-success` | `text-success` |
| `success-soft` (`#DDF0E4`) | `bg-success-soft` | — | `text-success-text` |
| `danger` (Tomate `#C4391D`) | `bg-danger` | `border-danger` | `text-danger` |
| `danger-soft` (`#FBE3DC`) | `bg-danger-soft` | — | `text-danger-text` |
| `tint-1` / `tint-beer` (`#FBE6B8`) | `bg-tint-beer` | — | — |
| `tint-2` / `tint-snack` (`#E4EFD5`) | `bg-tint-snack` | — | — |
| `tint-3` / `tint-drink` (`#F8D9CC`) | `bg-tint-drink` | — | — |
| `tint-4` / `tint-dessert` (`#EBDDCB`)| `bg-tint-dessert` | — | — |

Raios de borda: `rounded-input` (14px), `rounded-card` (20px), `rounded-card-lg` (24px), `rounded-btn` (18px), `rounded-full` (pills 999px).

## 6. Camada HTTP e Tratamento de Erros

```ts
// services/apiClient.ts
export interface ApiErrorDetail {
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
}

export class ApiError extends Error {
  constructor(
    public codigo: string,
    public mensagem: string,
    public status: number,
    public detalhes?: Record<string, unknown>,
    public requestId?: string
  ) {
    super(mensagem);
  }
}
```
- Cabeçalhos: `Content-Type: application/json`; cabeçalho opcional `X-Request-Id` repassado para auditoria.
- Timeouts: requisições do Core abortam em 8 s; satélites em 2,5 s.
- Falhas de rede disparam `ApiError` local com código `SEM_CONEXAO`.
- Valores monetários trafegam como string decimal de 2 casas (`"12.50"`), nunca float.

## 7. Dinheiro e Aritmética de Exibição

- **Centavos Inteiros (`Cents`):** Funções utilitárias convertem `"12.50"` $\rightarrow 1250$ centavos por manipulação de string e split. Toda soma e multiplicação de quantidade no rascunho utiliza números inteiros, eliminando imprecisões de ponto flutuante do JavaScript.
- **Rótulo "Estimado":** Enquanto a comanda estiver aberta, valores totais exibem o rótulo "Estimado". O fechamento formal (`POST /comandas/:id/fechar`) consolida subtotal, taxa de serviço e total calculados com precisão Decimal no banco de dados.
- **Taxa de Serviço Opcional:** Calculada com regra *round half up* sobre o subtotal. Switch acessível na UI permite remover ou aplicar a taxa com recálculo instantâneo.

## 8. PWA e Estratégia de Cache Offline

- **`manifest.webmanifest`:** `name: "VaptPDV"`, `display: "standalone"`, `theme_color: #F2A81D`, `background_color: #FBF7F1`.
- **Workbox / Service Worker:** Precache dos assets estáticos (HTML, JS, CSS, fontes e ícones SVG). Rotas de leitura `/produtos` e `/usuarios` com estratégia `StaleWhileRevalidate`.
- **Mutações:** Estratégia estritamente `NetworkOnly` para criação e alteração de comandas, lançamentos e pagamentos. Sem fila cega de sincronização offline na v1.

## 9. Detecção de estado do sistema (alimenta X03)

O hook `useSystemStatus()` combina: `navigator.onLine`, falhas consecutivas de requisição ($\ge 2$) e `GET /health` a cada 15 s (com verificação de satélites). Saída: `'sincronizado' | 'degradado' | 'sem_conexao'` + `servicosAfetados[]`. Respostas de mutação com avisos de degradação disparam toast de atenção e marcam o serviço afetado por 60 s.

## 10. Desempenho e Acessibilidade

- Alvos de toque $\ge 44\text{ px}$ em todas as telas de garçom e caixa touch. No KDS, botões amplos de 72 px operáveis à distância.
- Contraste WCAG 2.2 AA validado em ambos os temas (claro e escuro). Bordas de seleção utilizam `brand-edge` (4,7:1) em vez de mostarda pura.
- Navegação completa por teclado no Caixa (atalhos `F2`, `F4`, `F6`, `F7`, `F8`, `Esc`, `1–5`) e no KDS (setas e `Enter`).
- `<FocusTrap>` e `inert` no fundo para Modal/Drawer/Sheet; devolução obrigatória do foco ao elemento gatilho ao fechar.
- Regiões `aria-live="polite"` para totais e atualizações dinâmicas; `role="alert"` para erros.

## 11. Observabilidade no cliente

Console estruturado (`{ts, nivel, rota, acao, comanda_id?, requestId?}`), com mascaramento automático de dados sensíveis (CPF `***.456.789-**`). Exceções não tratadas caem no Error Boundary X06-c com opção de recarregar e código do erro visível para suporte.
