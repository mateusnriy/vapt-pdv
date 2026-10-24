# 04 — Catálogo de componentes

Todos usam **apenas** tokens de `tokens.css`. Estados mínimos de todo controle interativo: **padrão · hover (só ponteiro fino) · foco (anel 2 px) · pressionado · desabilitado · carregando (`aria-busy`)**. Nomes de `data-testid` seguem `<componente>-<identificador>` em *kebab-case*. Medidas em px CSS.

Convenções: `H` altura · `R` raio · `P` padding · `Fs` fonte (token). "Alvo" = área clicável mínima 44×44.

---

## 1. Primitivos

### 1.1 Button
| Variante | Visual | Uso |
|---|---|---|
| `primary` | fundo `brand`, texto `on-brand`, 800 | 1 por região. Cobrar, Enviar para a cozinha, Concluir venda |
| `secondary` | fundo `surface`, borda 1 px `border-strong`, texto `text` | ações de apoio |
| `tertiary` | sem borda/fundo, texto `text`, sublinhado no foco/hover | links de ação |
| `destructive` | secundário com texto `danger-text` | cancelar/inativar (levam a confirmação ou Desfazer) |
| `destructive-solid` | fundo `danger`, texto `on-danger` | **somente** dentro de diálogo de confirmação |
| `success-outline` | borda `success`, texto `success-text`, fundo `success-soft` | KDS "Marcar como entregue" |

Tamanhos: `md` H 44 R `control` Fs `body-sm` · `lg` H 52 · `xl` H 60 R `btn-lg` (Enviar para a cozinha) · `xxl` H 68 R `btn-lg` Fs 20/800 (Cobrar) · `kds` H 72 R `btn-lg` Fs `kds-button`. Props: `leadingIcon`, `trailingContent` (ex.: valor ao lado do rótulo, alinhado à direita), `loading`, `disabledReason` (texto visível **dentro** do botão, 13/600, quando desabilitado por regra: "Faltam R$ 84,98").
Desabilitado: fundo `surface-2`, texto `text-2`, sem sombra. `loading`: spinner 20 px à esquerda, rótulo permanece, `aria-busy="true"`, clique ignorado. Rótulo **nunca** quebra em duas linhas (`white-space: nowrap`; largura mínima = conteúdo).
`testid`: `btn-<acao>` (ex.: `btn-cobrar`, `btn-enviar-cozinha`).

### 1.2 IconButton
44×44 (visual 40 pode ser, alvo 44). `aria-label` obrigatório. Variantes `plain`, `outline`, `soft` (fundo `surface-2`). `testid`: `iconbtn-<acao>`.

### 1.3 Chip / Aba de filtro
Pill H 44, P 0 16, Fs `body-sm` 700. Ativo: `brand`/`on-brand` (categorias) **ou** `text`/`bg` invertido (filtros neutros). Inativo: `surface` + borda `border-strong`. Opcional contador (`Conta pedida · 2`) em pill interna. Container com `role="tablist"` (abas) ou grupo de `button aria-pressed` (filtros). Rolagem horizontal com *fade* de 24 px nas bordas e **setas** (IconButton) em ≥ 600 px; garantir que o último chip nunca fique cortado sem indicação. `testid`: `chip-<grupo>-<valor>`.

### 1.4 SegmentedControl (período)
Contêiner `surface-2` R pill, P 4; segmento H 40 R pill; ativo `surface` + borda `border` + texto 800. `role="radiogroup"`. Ex.: Hoje · 7 dias · 30 dias.

### 1.5 StatusPill
H 26–28, P 0 10–12, R pill, Fs `caption` 700; cores do mapa de status (`DESIGN §2.3`); **sempre texto**; ícone opcional 14 px. Não interativa. `testid`: `status-<valor>`.

### 1.6 TimerPill (KDS)
R pill, P 4 14, Fs `kds-timer` tabular. Texto: `mm:ss` | `mm:ss · Atenção` | `mm:ss · Atrasado`. Cores: success-soft/success-text · brand-soft/brand-text · danger-soft/danger-text. `role="timer"`; `aria-live="off"`; anunciar só mudança de faixa via `announce()`.

### 1.7 Switch
44×26, R pill, botão `role="switch"` + `aria-checked`. Desligado: fundo `surface-2` + borda `border-strong`; ligado: fundo `success`, polegar `surface`. Rótulo à esquerda (clicável); texto de estado "Ligado/Desligado" opcional (obrigatório quando o rótulo não deixa claro). Desabilitado: opacidade .6 **apenas no controle**, rótulo mantém contraste + nota explicativa. `testid`: `switch-<nome>`.

### 1.8 Stepper
Grupo `[−] n [+]` com colunas fixas: botão 44 · número 40 (centralizado, tabular, 800) · botão 44 → **largura total 128 px** (sempre). Fundo `surface-2` (padrão) ou `brand-soft` (item selecionado). `−` em 1 não vai a 0: no Caixa/Garçom, `−` com valor 1 **remove** o item (com Desfazer no Garçom) — o rótulo do botão muda para `aria-label="Remover {item}"` e o ícone vira lixeira. Limite superior = `estoque` conhecido (`+` desabilita com `aria-describedby` "Só restam n"). `role="group"` `aria-label="Quantidade de {item}"`; número em `output`/`aria-live="polite"`. `testid`: `stepper-<produto>`.

### 1.9 Campos (Field)
Estrutura: `label` (13/700) · controle · ajuda/erro (13/600). Controle H 52 (desktop 48), R `control`, borda 1 px `border-strong`, fundo `surface`, texto `body`. Foco: borda 2 px `focus`. Erro: borda `danger`, ícone `circle-alert` + texto `danger-text`, `aria-invalid="true"`, `aria-describedby`. Placeholder `text-2`. Opcional marcado "(opcional)" no rótulo.
- **Input texto / SearchInput** (ícone `search` à esquerda, botão limpar 44 px à direita, dica `F2` em `kbd`).
- **MoneyInput:** prefixo "R$", `inputmode="decimal"`, máscara pt-BR, valor interno em centavos (`Cents`), alinha à direita; Fs 24/800 no pagamento.
- **Select:** nativo estilizado (`<select>`), seta `chevron-down`.
- **Textarea:** 3 linhas, contador "0/140".
- **Checkbox/Radio:** 24 px visual, alvo 44; marca `check`/ponto `brand-text` sobre `surface` com borda `border-strong`.
- **CpfInput:** máscara `000.000.000-00`; valida dígitos verificadores no *blur* ("CPF inválido. Confira os números."); aceita CNPJ (14 dígitos) quando informado em campo "CPF/CNPJ".
`testid`: `field-<nome>`.

### 1.10 NumPad
Grade 3×4 (1–9, ⌫, 0, limpar); teclas H 64 (celular) / 56 (desktop), R `control`, `surface-2`, Fs 24/800. Saída em `output` acima. Uso: número da mesa (G02), valor recebido em dinheiro (C08). Também aceita teclado físico.

### 1.11 Avatar
Círculo 44 (cabeçalho) / 56 (login); fundo `brand-soft`, iniciais 2 letras `brand-text` 800. Em botão: `aria-label="Operador {nome}. Abrir menu"`.

### 1.12 Kbd
Tag `kbd` R `xs`, `surface-2`, borda `border`, Fs `micro` 700; descreve atalho. Nunca a única forma de acionar.

### 1.13 ProgressBar
Trilho H 8 R pill `surface-2`; preenchimento `success` (pagamento) ou `brand` com contorno (BI). `role="progressbar"` com `aria-valuenow/min/max` e **texto adjacente** com o valor ("R$ 60,00 de R$ 144,98").

### 1.14 Skeleton
Bloco `surface-2` R conforme componente-alvo; *shimmer* 1,2 s (desligado com reduced-motion). Dimensões idênticas ao conteúdo final. `aria-hidden` + região com `aria-busy="true"` e texto `sr-only` "Carregando {coisa}".

---

## 2. Padrões

### 2.1 Modal
Largura `sm` 480 / `md` 640; R `card-lg`; fundo `surface-raised`; P 24; cabeçalho (título 20/800 + IconButton fechar) · corpo (rolável) · rodapé (ações alinhadas à direita: secundária à esquerda do primário). Scrim `--color-scrim`. Abre com `dur-slow` (fade + translateY 8 px). `Esc` fecha. Foco inicial: primeiro campo, ou botão **seguro** (nunca o destrutivo). `testid`: `modal-<id>`.

### 2.2 Drawer
Direita, 480 px (≥ 1280: 560 para formulários longos), altura total; cabeçalho fixo e rodapé fixo com ações; rolagem interna. Fecha por `Esc`, botão ou scrim (se formulário "sujo" ⇒ confirmação X05 "Descartar alterações?"). Em < 600 px vira **Sheet**.

### 2.3 BottomSheet
Base da viewport; largura total; R topo `sheet` (28); máx. 85% da altura; alça decorativa (`aria-hidden`); **botão "Fechar" visível** no cabeçalho; safe area inferior no rodapé; teclado virtual: o sheet sobe e o rodapé permanece visível. Sem gesto obrigatório.

### 2.4 ConfirmDialog (X05)
Modal `sm`/Sheet. Título = pergunta com o objeto ("Cancelar o pedido 0482?"); corpo = consequência em 1–2 frases; botões: **secundário "Voltar"** (foco inicial) + **destrutivo com a ação nomeada** ("Cancelar pedido"). Nunca "Sim/Não" nem "OK".

### 2.5 Toast
Largura 360 (desktop) / `100% − 32` (celular); H mín. 56; R `control`; fundo `surface-raised` + borda `border`; faixa esquerda 6 px com a cor semântica; ícone + texto + ação opcional ("Desfazer" com contagem regressiva circular 5 s). Fila: máx. 3 visíveis; duplicatas agrupadas. `role="status"` (informativo) / `role="alert"` (erro). Posição: ver DESIGN §8.2.

### 2.6 Banner (detalhe de estado do sistema)
Faixa R `control`, P 12 16, ícone + texto + ação ("Tentar de novo"); `brand-soft`/`brand-text` (degradado), `danger-soft`/`danger-text` (sem conexão, impressora), `success-soft`/`success-text` (voltou: some em 4 s). `role="status"` (ou `alert` p/ sem conexão). `testid`: `banner-<estado>`.

### 2.7 EmptyState / ErrorState
Centralizados, máx. 360 px: ícone linear 40 px `text-2` · título 18/800 · frase 14/600 `text-2` · **ação primária**. ErrorState: ícone `circle-alert` `danger-text` + botão "Tentar de novo" + detalhe técnico recolhido ("Ver detalhes" com `requestId`). Variante `inline` (dentro de card, H mín. 160).

### 2.8 DataTable
`<table>` semântica; `<caption class="sr-only">`; cabeçalho `surface-2` 13/700, sticky; linha H 56 (padrão) / 44 (compacta); zebra **não**; separador 1 px `border`; hover `surface-2` (ponteiro fino); linha clicável com `tabindex=0` + `Enter`; coluna numérica à direita; coluna de ações com "Mais ações" (IconButton `ellipsis`); ordenação `aria-sort`; rodapé com Pagination. Estados: skeleton de 8 linhas, vazio, erro. Em < 1024 px vira lista de cards (`<ul>`).

### 2.9 Pagination
"Anterior" · "Próxima" (Buttons secundários 44) + texto "Mostrando 26–50"; seletor de 25/50 por página. Sem número de total quando a API não informa.

### 2.10 Navegação
- **BottomNav (Garçom):** H 64 + safe area; 4 destinos; item: ícone 24 + rótulo 13/700; ativo = pill `brand-soft` atrás do ícone + rótulo `text` 800 + `aria-current="page"`; *badge* numérico (ex.: prontos) 20 px `danger` + texto "3 prontos" em `aria-label`.
- **RailNav (Caixa):** 88 px, fundo `nav`; item 72×64, ícone 24 + rótulo 13/700; ativo `nav-active-bg` R `control`; logo "V" 48 px no topo; "Ajustes" ancorado na base.
- **SideNav (Gestão):** 248 px; logo + "VaptPDV" ("PDV" em `brand`); item H 52 R `control` ícone + rótulo 15/700; ativo `nav-active-bg`; rodapé com operador, tema e estado dos serviços.
- **TopBar (Caixa):** H 80; busca (flex 1, máx. 640), pill de sincronização, pill de impressora, operador (Avatar + nome + "Caixa 01").
- **ShortcutFooter (Caixa):** linha de `kbd` + rótulo, Fs `micro`/`caption`; botões reais equivalentes existem na tela.
- **FAB (Garçom):** H 56 R pill, `brand`, ícone `plus` + rótulo "Abrir mesa" em **uma linha** (`nowrap`, largura ≥ 168), `shadow-float`, posição `bottom: 76px + safe-area; right: 16px` (acima da BottomNav); reserva `padding-bottom` de 88 px na lista para não cobrir cards.
- **MenuPopover:** `role="menu"`, itens H 44, setas navegam, `Esc` fecha.

### 2.11 Cabeçalhos de tela
`h1` (título 24/800) + subtítulo opcional (13/600 `text-2`). Garçom: linha de contexto acima ("Sábado · jantar") + pill de status + Avatar.

---

## 3. Componentes de domínio

### 3.1 MesaCard
Grade 2 col. (celular), 3–6 col. (≥ 600). Card R `card-lg`, H mín. 120, P 16. Conteúdo: linha 1 — pill de status; linha 2 — **número 38/800** (rótulo acessível "Mesa N" via `aria-label` do botão; sem repetir "Mesa" visual); linha 3 — esquerda: tempo aberto (`caption`), direita: total parcial (`body` 800, rótulo "Estimado" no `aria-label`) | Livre: "N lugares" (se conhecido) ou vazio.
Estados: **Livre** (borda tracejada 1 px `border-strong`, fundo `surface`) · **Ocupada** (borda `border`) · **Conta pedida** (borda 2 px `danger`; pill danger) · **Minha** (marcador: ponto `brand-text` 8 px + "Sua mesa" no `aria-label`; no visual, borda esquerda 4 px `brand-edge` — texto "Minha" na pill secundária quando filtro ≠ Minhas). `button` inteiro; `testid`: `mesa-<n>`.

### 3.2 ProductCard (grade — Caixa)
Card R `card`, P 16, `surface`, borda `border`, `shadow-1`. Layout vertical: tile **96×96** R `control` (tint da categoria + ícone 40 px `text-2`) ao topo-esquerda · nome 15/700 (2 linhas, `line-clamp`) · espaço · preço 16/800. `button`; clique = +1 no pedido (animação de *pulse* 100 ms no card). **Em pedido:** borda 2 px `brand-edge` + selo "×2" (pill `brand-soft`) no canto superior direito. **Esgotado:** tile, nome e preço com opacidade .55; pill "Esgotado" 100% no lugar do preço; `aria-disabled="true"`. Grade: 4 colunas em 1440; 3 em 1024–1279; `gap` 16. `testid`: `produto-<id>`.

### 3.3 ProductRow (lista — Garçom)
Linha R `card`, H mín. 80, P 12, tile 56×56 + nome 15/700 + preço 14/600 `text-2` + controle à direita: **sem quantidade** → botão `+` 44 (outline); **com quantidade** → Stepper (borda 2 px `brand-edge` na linha, `brand-soft` no stepper); **esgotado** → pill "Esgotado" (linha .55 exceto pill); toque no corpo da linha abre G04 (observação) quando o item tem quantidade > 0 (PB-02). Botão de observação visível (ícone `message-square-text`, 44) quando há quantidade.

### 3.4 OrderLine (painel de pedido — Caixa)
Grid de **colunas fixas**: `[1fr | 128px stepper | 96px preço]`; linha 1 nome 15/700; linha 2 observação 13/600 `text-2` (alergia: ícone + "Alergia:" `danger-text`); preço do item em `body` 800 alinhado à direita (estimado); botão `message-square-text` 44 para observação; separador 1 px `border`. Remover: `−` em 1.

### 3.5 OrderSummary
Linhas: Subtotal (estimado) · **Gorjeta 10%** (Switch + valor) · **Total** (kpi 30/800). Rótulo "Estimado" quando a comanda está aberta. Após `fechar`: valores do servidor, sem "Estimado". Switch ligado por padrão; ao desligar, linha da gorjeta mostra "R$ 0,00" e o total atualiza.

### 3.6 MesaSummaryCard ("itens enviados")
Botão-card R `card` P 12: ícone `check` em quadrado success-soft 56 · título "N itens enviados" 15/800 · subtítulo "Cozinha confirmou às HH:MM" ou "Aguardando a cozinha" (se sem confirmação) · à direita: rótulo "Total da mesa" 12/600 + valor 16/800 · `chevron-right`. Abre G05.

### 3.7 PaymentMethodTile
Tile 148×112 R `card`, ícone 28 + rótulo 15/800; selecionado: fundo `brand-soft`, borda 2 px `brand-edge`; `role="radio"` dentro de `radiogroup`. Ícones distintos por forma (Pix custom, Crédito/Débito `credit-card` com sufixo visual "C"/"D" no tile, Dinheiro `banknote`, Vale-refeição `ticket`).

### 3.8 PaymentLine (pagamento lançado)
Linha R `card` P 12: ícone sucesso, forma (15/800) + detalhe (13/600: "Troco: R$ 0,00"), valor à direita, botão "Remover" (terciário `danger-text`, 44) → X05.

### 3.9 QrPanel
Moldura R `card-lg` P 16; QR 240×240 `surface` com contraste máx. (módulos `text` sobre branco, **mesmo no escuro** — fundo branco fixo + margem de silêncio 16); legenda "QR Code de demonstração"; banner de aguardando com cronômetro `mm:ss` (`role="timer"`); ações "Copiar código Pix" (secundário) e "Cancelar cobrança" (destrutivo).

### 3.10 KdsTicket / KdsColumn
Ver `30-kds.md` (K02). Medidas: ticket R `card-lg`, borda esquerda 10 px; P 24; coluna largura `(100vw − 3×gap − 2×margem)/3`, `gap` 32, margem 48.

### 3.11 KpiCard
R `card-lg` P 24; rótulo 13/700 `text-2`; valor 30/800; rodapé: variação (13/600; `success-text` positiva, `danger-text` negativa **desde que o sentido faça sentido** para o KPI; neutro `text-2`) + "em relação a ontem". Skeleton: 3 barras. Indisponível: valor "—" + frase "Indisponível. {motivo}".

### 3.12 BarChart (vertical) e HBarList (horizontal)
- **BarChart:** SVG; barras R 6 topo, fill `chart-bar`, contorno 1,5 px `chart-bar-stroke`; valor acima da barra (13/700); rótulo do eixo abaixo (13/600); base em zero; pico: contorno 2 px `text` + legenda "Pico às 20h · 36 pedidos" no cabeçalho; barras de horas futuras não renderizam (sem dado); `role="img"` + `aria-label` ("Pedidos por hora. Pico às 20h com 36. …") + tabela `sr-only` equivalente.
- **HBarList:** linha: rótulo à esquerda, **percentual à direita**, trilho H 8 `surface-2`, preenchimento `brand` com contorno `brand-text` 1 px; ordenação decrescente; total = 100%.

### 3.13 RankTable
Tabela compacta (DataTable `compacta`) com coluna "Qtd." e "Receita" à direita; cabeçalho informa o critério ("Ordenado por receita"); linha com barra de participação opcional (HBar 4 px).

### 3.14 AlertItem
Bloco R `control` P 12 16: ícone (`circle-alert` danger / `triangle-alert` brand) + texto 14/700 + ação à direita (link "Repor", "Ver vendas"); cores soft + text. `role="listitem"`; lista com `aria-label="Precisa de atenção"`.

### 3.15 ReceiptView
Papel 360 px (largura de cupom) centralizado; fundo `surface` sempre claro na impressão (`@media print`: preto sobre branco, sem sombra); fonte tabular; seções: cabeçalho do estabelecimento, mesa/pedido/garçom/data, itens (qtd × nome … subtotal), Subtotal, **Taxa de serviço (10%)**, **Total**, forma de pagamento, cliente (CPF mascarado), **cashback ganho**, hash de autenticidade (primeiros 12 chars), rodapé "Comprovante de consumo. Não é documento fiscal."

### 3.16 OperatorCard (login)
Botão card 160×176 (desktop) / linha 72 (celular): Avatar 56, nome 16/800, pill de perfil. Hover/foco: borda 2 px `brand-edge`. `testid`: `operador-<id>`.

---

## 4. Guia de Implementação com Tailwind CSS (`frontend/src/components/ui/`)

Para manter 100% de coerência entre a especificação e o código implementado em `frontend/`:

| Componente | Classes Recomendadas no Tailwind |
|---|---|
| **Button Primary** | `bg-brand hover:bg-brand-hover active:bg-brand-press text-on-brand font-extrabold rounded-btn transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-text` |
| **Button Secondary** | `bg-surface border border-border-strong text-text font-bold rounded-btn hover:bg-surface-2 transition-colors` |
| **Button Destructive** | `bg-surface border border-danger/40 text-danger font-bold rounded-btn hover:bg-danger-soft transition-colors` |
| **StatusPill Livre** | `bg-success-soft text-success border border-success/30 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5` |
| **StatusPill Ocupada** | `bg-brand-soft text-brand-text border border-brand/30 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5` |
| **StatusPill Conta pedida** | `bg-danger-soft text-danger border border-danger/40 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 animate-pulse` |
| **Input / Field** | `bg-surface border border-border-strong rounded-input px-3.5 py-3 text-text text-sm focus:outline-none focus:border-2 focus:border-text placeholder:text-text-2` |
| **Card Padrão** | `bg-surface border border-border rounded-card p-4 shadow-soft` |
| **Modal / Dialog** | `fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim backdrop-blur-xs` + container `bg-surface rounded-card-lg shadow-modal border border-border max-w-lg w-full p-6` |
| **Toast** | `fixed z-60 rounded-input shadow-modal border p-4 flex items-center gap-3 border-l-6` |
