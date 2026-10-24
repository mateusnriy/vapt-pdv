# DESIGN.md — VaptPDV

Sistema de PDV, KDS e gestão para restaurantes, lanchonetes e bares (multi-segmento, configurável por estabelecimento). Este documento é a fonte única de verdade visual: use exatamente estes tokens, formas e regras.

**Como ler.** As seções 1 a 10 são o contrato visual (a numeração é citada pelas specs de tela: §2.3 mapa de status, §3 tipografia KDS, §8.2 camadas de feedback). A seção 11 traz o `tokens.css` pronto para copiar. As seções 12 a 14 cobrem ícones, responsividade, impressão e o que está dentro ou fora da v1.
**Precedência.** Em conflito, vale nesta ordem: spec da tela (`docs/design/*.md`) > catálogo de componentes (`docs/design/04-componentes.md`) > arquitetura do frontend (`docs/design/01-arquitetura-frontend.md`) > este documento. Quando a spec cita um token, ele existe aqui com o mesmo nome.

## 1. Direção

- **Personalidade:** acolhedora, rápida, confiável. Visual limpo, cantos arredondados, cores de alimentos (mostarda, café, creme, manjericão, tomate).
- **Assinatura visual (o que torna o VaptPDV reconhecível):** (1) o **tile tintado** de produto, um quadrado arredondado com a cor da categoria e um ícone linear; (2) a **faixa lateral de estado** (10 px no ticket do KDS, 4 px em "Minha mesa", 6 px no toast), sempre acompanhada de texto; (3) a **mostarda só em ação**: se algo é mostarda, dá para tocar ou está selecionado. O resto fica quieto, em creme, café e branco.
- **Proibido:** emojis, cores neon, gradientes decorativos, sombras pesadas, ícones coloridos aleatórios, cartão dentro de cartão, ícone sozinho em ação ambígua.
- **Prioridade:** velocidade e clareza na operação (pico de movimento) acima de ornamento. Poucos toques por venda (meta do Garçom: lançar um item em até 3 toques), layout estável, sem saltos de conteúdo.
- **Temas:** claro e escuro em todos os módulos, com modo Automático. KDS abre em escuro por padrão (leitura à distância); perfil `cozinha` entra em escuro mesmo com tema global claro.
- **Idioma:** pt-BR. Moeda `R$ 1.234,56`, datas `24/10/2026`, hora 24 h (`19:42`).
- **Usuários e contexto** (premissas que guiam as decisões): garçom em pé, uma mão, celular 360–430 px, pressa, luz variável; caixa em balcão, mouse, teclado e toque, turnos longos; cozinha a 2–3 m de uma TV, mãos sujas, pouco ou nenhum toque; gerente em desktop analisando o dia. Sem senha de operador na v1 (login por escolha de pessoa).
- **Escopo da v1** (as telas só prometem o que existe): sem fila offline de vendas, sem NFC-e, sem desconto, sem transferência de mesa, sem impressora real, sem foto de produto, sem resgate de cashback. Ver §14.

## 2. Cores (tokens semânticos)

### 2.1 Tokens

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| bg (Creme) | #FBF7F1 | #17120F | fundo de tela |
| surface | #FFFFFF | #221A15 | cards, painéis, campos |
| surface-raised | #FFFFFF | #2A2019 | modal, drawer, sheet, toast, popover (no escuro é mais claro que surface: elevação por tom) |
| surface-2 | #F3ECE1 | #2D231C | campos desabilitados, steppers, trilhos, cabeçalho de tabela, hover de linha |
| border | #E5DACB | #43342A | bordas decorativas e divisores (não identifica controle sozinho) |
| border-strong | #8C7A68 | #8F7B69 | borda de controle (campo, chip inativo, switch desligado, checkbox, mesa livre tracejada); ≥ 3:1 |
| text (Café) | #2B2019 | #F6EEE4 | texto principal |
| text-2 | #6A5849 | #C2B1A0 | texto de apoio, placeholder, ícone de tile |
| brand (Mostarda) | #F2A81D | #F5B335 | fundo de ação primária e item ativo |
| brand-hover | #E39A0B | #F8BF52 | primário em hover (só ponteiro fino) |
| brand-press | #C98400 | #E0A024 | primário pressionado |
| on-brand | #2B2019 | #2B2019 | texto e ícone sobre brand |
| brand-soft | #FDF0D2 | #3D2E14 | seleção, atenção, "ocupada" e "em preparo" |
| brand-text | #8A5200 | #F5C766 | texto sobre brand-soft ou sobre superfície; contorno de gráfico |
| brand-edge | #A86400 | #F5B335 | **linha ou ícone** de seleção (borda 2 px de item em pedido, marcador "Minha", ponto de badge); no claro a mostarda pura não chega a 3:1, por isso existe este token |
| nav | #3A2A21 | #0F0B09 | rail e sidebar |
| nav-active-bg | #523C2E | #2A201A | item ativo da navegação |
| nav-text | #F6EEE4 | #F6EEE4 | texto e ícone da navegação |
| nav-text-2 | #C9B8A6 | #BBAA98 | item inativo da navegação |
| success (Manjericão) | #2F7D4F | #5FC083 | livre, pronto, ligado (switch), barra de pagamento |
| success-soft | #DDF0E4 | #1D3326 | fundo de sucesso |
| success-text | #1F6B3E | #7FD39D | texto sobre success-soft |
| danger (Tomate) | #C4391D | #F07A60 | erro, atraso, destrutivo, conta pedida |
| danger-soft | #FBE3DC | #3D1E17 | fundo de erro |
| danger-text | #A52E15 | #FF9C85 | texto sobre danger-soft |
| on-danger | #FFFFFF | #2B2019 | texto sobre `danger` sólido (só em diálogo de confirmação) |
| focus | #2B2019 | #F6EEE4 | anel de foco (igual ao texto) |
| scrim | rgba(43,32,25,.5) | rgba(0,0,0,.62) | fundo de modal e drawer (`--color-scrim`) |
| chart-bar | #F2A81D | #F5B335 | preenchimento de barras |
| chart-bar-stroke | #8A5200 | #F5C766 | contorno de barras e de HBar |
| tint-1 mostarda | #FBE6B8 | #4A3815 | tile de produto |
| tint-2 manjericão | #E4EFD5 | #27382A | tile de produto |
| tint-3 tomate | #F8D9CC | #4A2A20 | tile de produto |
| tint-4 cappuccino | #EBDDCB | #3A2E25 | tile de produto |

### 2.2 Regras de uso

- Texto normal ≥ 4,5:1; texto grande, componentes, linhas de controle e foco ≥ 3:1 (tabela 2.4).
- **Mostarda é cor de ação**, nunca de erro. No tema claro ela é **preenchimento** (botão, chip ativo, FAB) com `on-brand` por cima; como linha ou ícone solto use `brand-edge`, e como texto use `brand-text`.
- Estado nunca depende só de cor: sempre texto ou ícone junto. A faixa lateral colorida do ticket vem com o texto "Atenção" ou "Atrasado".
- Cor de feedback usa o trio `soft` (fundo) + `text` (texto) + cor cheia (faixa, borda ou ícone). Não misture trios.
- `danger` cheio como fundo só no botão `destructive-solid` dentro de diálogo de confirmação.
- Fundos brancos fixos só em dois lugares: QR Code (também no tema escuro) e impressão do recibo.
- Gráficos usam uma cor (mostarda) com rótulos diretos; nada de arco-íris.

### 2.3 Mapa de status (rótulos oficiais)

Toda pill de status é `StatusPill` (H 26–28, pill, 13/700, ícone opcional de 14 px) com texto sempre visível.

| Domínio | Valor da API | Rótulo | Fundo / texto | Ícone |
|---|---|---|---|---|
| Mesa | sem comanda | Livre | success-soft / success-text | `circle-check` |
| Mesa | `aberta` | Ocupada | brand-soft / brand-text | `utensils` |
| Mesa | `fechada` ou conta pedida | Conta pedida | danger-soft / danger-text (+ borda 2 px `danger` no card) | `receipt` |
| Mesa | `garcom_id` = operador | Minha (pill secundária fora do filtro Minhas; marcador `brand-edge` de 4 px) | brand-soft / brand-text | `user` |
| Comanda | `aberta` | Aberta | brand-soft / brand-text | `clock` |
| Comanda | `fechada` | Aguardando pagamento | danger-soft / danger-text | `receipt` |
| Comanda | `paga` | Paga | success-soft / success-text | `circle-check` |
| Comanda | `cancelada` | Cancelada | surface-2 / text-2 | `circle-x` |
| Ficha | `recebido` | Aguardando | surface-2 / text-2 | `hourglass` |
| Ficha | `em_preparo` | Em preparo | brand-soft / brand-text | `flame` |
| Ficha | `pronto` | Pronto | success-soft / success-text | `bell` |
| Ficha | `entregue` | Entregue | surface-2 / text-2 | `check` |
| Ficha | `cancelado` | Cancelado | surface-2 / text-2, nome riscado | `circle-x` |
| SLA do ticket | dentro / atenção / atraso | `mm:ss` · `mm:ss · Atenção` · `mm:ss · Atrasado` | success / brand / danger (soft + text) | — |
| Sistema | sincronizado / degradado / sem conexão | ● Sincronizado (● Online no KDS) · ▲ Parcial · ✕ Sem conexão | success / brand / danger (soft + text) | — |
| Estoque | 0 | Esgotado | danger-soft / danger-text | — |
| Estoque | abaixo do mínimo | Estoque baixo | brand-soft / brand-text | `triangle-alert` |
| Cadastro | `ativo=false` | Inativo | surface-2 / text-2 | — |
| Login | último operador | Último acesso | brand-soft / brand-text | — |

### 2.4 Contrastes verificados (WCAG 2.2 AA)

Calculados com a fórmula de luminância relativa; todos passam nos dois temas.

| Par | Claro | Escuro | Mínimo |
|---|---|---|---|
| text em bg / surface | 14,9 / 15,9 | 16,2 / 14,9 | 4,5 |
| text-2 em surface / surface-2 | 6,8 / 5,8 | 8,2 / 7,4 | 4,5 |
| on-brand em brand | 7,9 | 8,6 | 4,5 |
| brand-text em brand-soft | 5,7 | 8,3 | 4,5 |
| success-text em success-soft | 5,5 | 7,5 | 4,5 |
| danger-text em danger-soft | 5,7 | 7,4 | 4,5 |
| on-danger em danger | 5,3 | 5,8 | 4,5 |
| nav-text em nav / nav-active-bg | 11,9 / 8,9 | 17,0 / 13,8 | 4,5 |
| nav-text-2 em nav | 7,1 | 8,7 | 4,5 |
| border-strong em surface | 4,1 | 4,2 | 3 |
| focus em bg | 14,9 | 16,2 | 3 |
| brand-edge em surface | 4,7 | 9,3 | 3 |
| success e danger (linhas, ícones) em surface | 5,0 / 5,3 | 7,6 / 6,2 | 3 |
| **brand (mostarda) como linha em surface** | **2,0 — não usar** | 9,3 | 3 |

### 2.5 Tiles por categoria

O tile do produto tem a tint da categoria e o ícone `lucide` em `text-2` (contraste do ícone sobre a tint ≥ 5:1 nos dois temas). Categoria desconhecida cicla as quatro tints pelo hash do nome. No Tailwind (`frontend/tailwind.config.js`), os tokens semânticos possuem aliases mapeados diretamente:

| Categoria | Token Semântico | Alias no Tailwind | Hex Claro / Escuro | Ícone |
|---|---|---|---|---|
| Lanches | tint-1 mostarda | `tint-beer` | #FBE6B8 / #4A3815 | `sandwich` |
| Porções | tint-2 manjericão | `tint-snack` | #E4EFD5 / #27382A | `drumstick` |
| Sobremesas | tint-3 tomate | `tint-drink` | #F8D9CC / #4A2A20 | `ice-cream-cone` |
| Bebidas | tint-4 cappuccino | `tint-dessert` | #EBDDCB / #3A2E25 | `cup-soda` |
| Combos | tint-1 mostarda | `tint-beer` | #FBE6B8 / #4A3815 | `package` |
| Outras | por hash | — | por hash | `utensils` |

## 3. Tipografia

- Família: **Plus Jakarta Sans** (400–800), `woff2` local; fallback `system-ui`. Números com `font-variant-numeric: tabular-nums` em preços, tabelas, relógios e cronômetros.
- **Escala base (px/peso):** `fs-kpi` 30–32/800 · `fs-title` 24–26/800 · `fs-section` 16–18/700–800 · `fs-body` 14–15/600 · `fs-body-sm` 14/700 · `fs-caption` 13/600–700 · `fs-micro` 12/700 (mínimo absoluto).
- Altura de linha: 1,45 no corpo, 1,15 em títulos e números grandes. Nenhum rótulo de botão quebra linha (`white-space: nowrap`).
- Quando o texto é longo, limite a 70 caracteres por linha (ajudas, avisos, ReceiptView é exceção por ser cupom).
- **Tokens de uso recorrente:** número da mesa 38/800 · total do pedido 30/800 · título de modal 20/800 · rótulo de campo 13/700 · ajuda e erro 13/600 · preço de card 16/800 · nome de produto 15/700 · navegação 13/700 (rail e bottom) e 15/700 (sidebar) · valor do MoneyInput no pagamento 24/800 · troco 30/800.
- **KDS (leitura a 2–3 m), tokens `--fs-kds-*`:**

| Token | Px/peso | Onde |
|---|---|---|
| `--fs-kds-place` | 36/800 | local do pedido ("Mesa 6", "Balcão 27") |
| `--fs-kds-order` | 22/700 | "Pedido 0481" |
| `--fs-kds-qty` | 32/800 | "2×" (coluna fixa de 72 px) |
| `--fs-kds-item` | 30/700 | nome do item |
| `--fs-kds-note` | 22/700 | observação (`brand-text`), nunca abaixo de 22 mesmo na escala compacta |
| `--fs-kds-allergy` | 24/800 | bloco de alergia (`danger-text`) |
| `--fs-kds-button` | 26/800 | botão do ticket (72 px) |
| `--fs-kds-timer` | 26/800 | cronômetro em pill |
| `--fs-kds-column` | 30/800 | título da coluna |
| `--fs-kds-clock` | 44/800 | relógio do cabeçalho |

  A escala compacta (`--kds-scale: .85`, a partir de 5 tickets na coluna) e o "Tamanho do texto: Grande" (×1,15) multiplicam estes valores. Abaixo de 1280 px de largura, as fontes escalam com `clamp()` e as 3 colunas permanecem.
- **Rótulos de botão:** verbo + objeto ("Enviar para a cozinha", "Cobrar", "Concluir venda"). Sem caixa-alta corrida; frases em *sentence case*.

## 4. Forma, espaço, elevação, movimento

### 4.1 Raios
| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | 6 | `kbd`, barras de gráfico (topo) |
| `--radius-control` | 14 | botões md/lg, campos, linhas, toasts, banners, tiles de produto |
| `--radius-card` | 20 | cards de produto, produto em lista, tiles de pagamento |
| `--radius-card-lg` | 24 | mesa, ticket, KPI, modal, QrPanel |
| `--radius-btn-lg` | 18 | botões xl, xxl e KDS |
| `--radius-sheet` | 28 | topo do bottom sheet |
| `--radius-pill` | 999 | chips, pills, switch, FAB, avatar |

Uma lógica só: o raio cresce com o tamanho do elemento. Não misturar raios dentro de um mesmo componente.

### 4.2 Espaço
Múltiplos de 4: 4, 8, 12, 16, 24, 32, 48. Margem lateral do celular 16; gap de grade 12 (mesas) e 16 (produtos); padding de card 16–24; margem e gap do KDS 48 e 32.

### 4.3 Elevação
Borda de 1 px + sombra muito leve. `--shadow-1`: `0 1px 2px rgba(43,32,25,.06)`. `--shadow-float` (FAB e popover): `0 6px 16px rgba(43,32,25,.16)`. Modal, drawer e sheet usam `surface-raised` + scrim, sem sombra extra. No escuro, sem sombra: a elevação vem do tom (`surface` < `surface-raised`).

### 4.4 Movimento
- Só para feedback: `--dur-fast` 100 ms (pulse do card ao tocar, press), `--dur-base` 160 ms (troca de coluna, entrada de ticket), `--dur-slow` 240 ms (modal: fade + `translateY` 8 px; drawer: slide). Entrada com `--ease-out`, saída com `--ease-in`.
- Anime só `transform` e `opacity`. Skeleton com *shimmer* de 1,2 s.
- Um único movimento espontâneo permitido: a borda do KDS pulsa **uma vez** (3 s, sem piscar acima de 3 Hz) quando chega ticket novo.
- `prefers-reduced-motion: reduce` remove shimmer, pulse e deslizes; fica só a troca de estado.

### 4.5 Camadas (z-index)
`--z-sticky` 10 · `--z-nav` 20 · `--z-fab` 30 · `--z-drawer` 40 · `--z-modal` 50 · `--z-toast` 60.

### 4.6 Alvos e alturas
Alvo mínimo 44×44 (celular e caixa touch); KDS 56 (cabeçalho e ajustes) e 72 (botão do ticket). Altura de botão: md 44 · lg 52 · xl 60 (Enviar para a cozinha) · xxl 68 (Cobrar) · kds 72. Campo 52 (desktop 48). Chip 44. Linha de tabela 56 (compacta 44).

## 5. Componentes

Medidas e estados completos estão em `04-componentes.md`; aqui ficam as regras visuais que não podem variar. Todo controle tem 6 estados: padrão, hover (só ponteiro fino), foco, pressionado, desabilitado, carregando (`aria-busy`).

- **Botão:** `primary` (brand, on-brand, 800; um por região), `secondary` (borda `border-strong`, fundo surface), `tertiary` (texto), `destructive` (texto `danger-text`, leva a confirmação ou Desfazer), `destructive-solid` (danger/on-danger, só dentro de diálogo), `success-outline` (KDS "Marcar como entregue"). **Desabilitado:** `surface-2` com texto `text-2` e o **motivo escrito dentro do botão** (13/600): "Faltam R$ 84,98", "Adicione itens", "Sem conexão". Carregando: spinner de 20 px à esquerda, rótulo mantido, largura intacta.
- **Chip/aba:** pill 44 px; ativo = brand (categorias) ou `text` invertido (filtros neutros), inativo = surface + `border-strong`; contador opcional em pill interna. Rolagem horizontal com *fade* de 24 px e setas em ≥ 600 px.
- **StatusPill:** ver §2.3.
- **Card de produto (Caixa):** tile 96×96 tintado com ícone de 40 px, nome 15/700 (2 linhas), preço 16/800. Em pedido: borda 2 px `brand-edge` + selo "×2" (brand-soft). Esgotado: opacidade .55 + pill "Esgotado", `aria-disabled`, não clicável.
- **Linha de produto (Garçom):** tile 56×56, nome 15/700, preço 14/600 `text-2`; sem quantidade = botão `+` 44; com quantidade = Stepper, borda 2 px `brand-edge` na linha e botão de observação visível.
- **Stepper:** `[−] n [+]`, largura fixa 128 px, fundo surface-2 (brand-soft quando selecionado). `−` em 1 vira lixeira e remove o item.
- **Switch:** 44×26, `role="switch"`, ligado = success com polegar `surface` (5,0:1), desligado = surface-2 + `border-strong`. Rótulo à esquerda.
- **Campos:** rótulo sempre visível acima (13/700), borda `border-strong`, foco = borda 2 px `focus`, erro = borda `danger` + ícone `circle-alert` + texto `danger-text`. MoneyInput com prefixo "R$" e máscara pt-BR; CPF/CNPJ com máscara e validação no *blur*.
- **Mesa (card):** número 38/800, pill de status, tempo aberto, total parcial "Estimado". Livre = borda tracejada `border-strong`; Ocupada = borda `border`; **Conta pedida = borda 2 px `danger` + pill com texto**; Minha = faixa esquerda 4 px `brand-edge`.
- **Ticket KDS:** `surface`, `radius-card-lg`, padding 24, **faixa esquerda 10 px** (success | brand | danger) com `TimerPill` ("18:05 · Atrasado"); quantidade e item grandes; observação em `brand-text`; **alergia em bloco próprio** (`danger-soft`, ícone `shield-alert`, texto 24/800) sempre acima da observação normal e nunca truncada; um botão de 72 px por ticket.
- **KPI:** rótulo 13/700 `text-2`, valor 30/800, variação com sinal e texto ("+8% em relação a ontem"). Verde para positivo e vermelho para negativo só quando o sentido faz sentido para o indicador. Indisponível: "—" + "Indisponível. {motivo}".
- **Gráficos:** barras em mostarda com contorno `chart-bar-stroke` de 1,5 px; valor acima da barra; eixos começam em zero; pico com contorno 2 px `text` e legenda "Pico às 20h · 36 pedidos"; `role="img"` + `aria-label` + tabela `sr-only`. HBarList: rótulo à esquerda, percentual à direita, trilho de 8 px.
- **Modal / Drawer / Sheet:** `surface-raised`, `radius-card-lg` (sheet: 28 no topo). Modal sm 480 / md 640; drawer 480 (560 em formulários longos); sheet com até 85% da altura, botão "Fechar" visível e rodapé que sobe com o teclado. Foco inicial no primeiro campo ou no botão **seguro**.
- **ConfirmDialog:** título em forma de pergunta com o objeto ("Cancelar o pedido 0482?"), consequência em 1–2 frases, botão seguro "Voltar" (foco inicial) + destrutivo com a ação nomeada. Nunca "Sim/Não" nem "OK".
- **Navegação:** BottomNav 64 px + safe area (4 destinos; ativo = pill brand-soft atrás do ícone + `aria-current`); RailNav 88 px; SideNav 248 px; TopBar 80 px; FAB 56 px com "Abrir mesa" em uma linha.
- **Banner e toast:** ver §8.2.
- **Tabela (DataTable):** `<table>` semântica, cabeçalho sticky em surface-2, sem zebra, linha clicável com foco. Abaixo de 1024 px vira lista de cards.
- **Recibo (ReceiptView):** papel de 360 px na tela, fonte tabular; impressão preto sobre branco em 80 mm. Rodapé fixo: "Comprovante de consumo. Não é documento fiscal."

## 6. Módulos e telas

Shells e medidas por módulo. Cada tela citada tem seu ID (G01, C07, K02…) na spec correspondente.

### 6.0 Transversais (todos os módulos)
- **Login (X01):** "Quem está operando agora?", grade de cartões de operador (160×176 no desktop, linhas de 72 no celular) agrupados por perfil (Garçons, Caixa, Gerência, Cozinha e bar), "Último acesso" primeiro. Sem senha, sem confirmação. Rodapé com status, tema e versão.
- **Status do sistema (X03):** pill no cabeçalho + banner de detalhe (§8.2).
- **Erros de rota (X06):** 404, sem permissão (nunca redireciona em silêncio) e erro inesperado ("A tela travou, mas suas vendas continuam salvas no servidor"), sempre com ação primária.
- **PWA (X08):** instalar em faixa discreta e atualizar em toast persistente; nunca recarrega sozinho com rascunho aberto.

### 6.1 Caixa (desktop, mouse/teclado/touch, 1440×900; mínimo 1024)
- **Shell:** RailNav de 88 px (nav café) com ícone + rótulo: Venda, Mesas, Pedidos, Caixa (= Receber), Ajustes. TopBar de 80 px: busca (F2, só em Venda e Pedidos), pill de status, pill "Impressora cozinha — Não conectada" (placeholder), operador (Avatar + nome + "Caixa 01"). ShortcutFooter com `kbd`.
- **Venda:** chips de categoria + grade de 4 colunas (3 entre 1024 e 1279) de cards de produto. Painel direito de 440 px: "Pedido 0482", local, botão Cliente (F4), linhas com colunas fixas `[1fr | 128 | 96]`, aviso de cozinha, Subtotal (estimado), **Gorjeta 10% (switch ligado por padrão)**, Total 30/800, Desconto (desabilitado com motivo), Mais ▾ e **Cobrar** (68 px, valor à direita, F8).
- **Mesas, Pedidos, Receber:** grade de 6 colunas de mesas (versão larga de 132 px); tabela com filtros na URL; duas seções em Receber ("Contas pedidas — fechar" e "Aguardando pagamento"), mais antigo primeiro, "Atrasado" acima de 5 min.
- **Detalhe da comanda:** drawer 480/560 com itens, totais (estimado ou final), pendências da cozinha (nunca bloqueiam) e ações por status.
- **Pagamento (C07):** 3 colunas. Resumo ≈ 380 px com "já pago / falta pagar" + ProgressBar e pagamentos lançados; centro com as formas (Pix, Crédito, Débito, Dinheiro, Vale-refeição), valor a cobrar editável, divisão (igual, por item, por pessoa) e painel da forma (QR Pix com cronômetro de 5:00, troco em 30/800 `success-text`, cartão na maquininha); coluna fiscal com CPF/CNPJ opcional, "Emitir NFC-e" ligado e desabilitado com explicação e "Imprimir via do cliente". **Concluir venda** só habilita com saldo zero e mostra "Faltam R$ …" enquanto isso.
- **Venda concluída (C12):** `circle-check` de 64 px, total 32/800, fidelidade (valores vindos do serviço, nunca calculados na tela), "Nova venda" como primário, recibo à direita.
- **Atalhos:** F2 buscar · F4 cliente/CPF · F6 desconto (indisponível) · F7 nota (indisponível) · F8 cobrar · `?` ajuda · 1–5 forma de pagamento · Ctrl+Enter concluir.
- **Densidade:** Padrão ou Compacta (reduz cards e linhas, alvos continuam ≥ 44).

### 6.2 Garçom (celular 390×844, uso com uma mão; mínimo 360)
- **Shell:** cabeçalho de contexto ("Sábado · jantar" + pill + Avatar), conteúdo rolável, BottomNav de 4 destinos (Mesas, Comandas, Cozinha, Perfil) com badge de prontos. Sem gesto obrigatório; toda ação tem botão visível. Safe areas respeitadas.
- **Salão:** título "Salão", chips (Todas, Minhas, Livres, Conta pedida) com contagem, grade de 2 colunas (gap 12), FAB "Abrir mesa" na zona do polegar (`bottom: 76px + safe-area`, `padding-bottom` de 88 na lista).
- **Abrir mesa:** sheet com NumPad (teclas de 64), nome do cliente opcional e botão xl "Abrir mesa".
- **Comanda:** voltar + mesa + pessoas + tempo; card "N itens enviados" (abre o sheet de itens); categorias que **filtram** a lista; linhas com stepper; rodapé fixo com "N novos itens" + total estimado, **Enviar para a cozinha** (60 px) e "Pedir a conta" (48 px). Comanda fechada, paga ou cancelada abre em modo leitura com faixa explicativa.
- **Itens enviados:** sheet agrupado por status de preparo, ajuste de quantidade e remoção com Desfazer de 5 s; item pronto traz "Marcar como entregue".
- **Cozinha:** lista "Prontos para entregar" (mais antigo primeiro, pill "Pronto há 3 min"), "Em preparo" recolhido, chips de setor. Aviso de pronto = toast persistente + badge + vibração curta (sem som por padrão).
- **Perfil:** Avatar 72, trocar operador, tema, resumo do turno (contagens), instalar app, serviços, Sair.

### 6.3 KDS (TV/monitor 1920×1080, pouco ou nenhum toque)
- **Tema escuro por padrão**, `data-surface="kds"`, anel de foco de **4 px**, alvos de 56 a 72 px.
- **Cabeçalho (88 px):** logo "V" 56, título dinâmico (Cozinha, Bar ou Cozinha e bar), chips de setor **Todas · Cozinha · Bar** (56 px; teclas 1/2/3), pill "● Online", Ajustes e relógio 44/800. As estações Chapa, Fritadeira e Montagem ficam fora da v1.
- **Colunas:** Novos → Em preparo → Prontos, larguras iguais, margem 48 e gap 32, mais antigo no topo. Tickets do mesmo pedido e status formam um ticket; estados diferentes geram um ticket por coluna. Com 5 ou mais tickets: escala compacta + chip "+N abaixo".
- **SLA:** Novos e Em preparo contam desde `criado_em` (atenção em 10 min, atraso em 15); Prontos contam a espera de retirada (atenção em 3 min, atraso em 6). Configurável nos Ajustes. Cronômetros continuam contando sem conexão.
- **Botões:** Novos "Iniciar preparo" (primary, imediato) · Em preparo "Marcar como pronto" (primary, Desfazer 5 s) · Prontos "Marcar como entregue" (success-outline, Desfazer 5 s). Durante a janela o botão vira "Desfazer (5)" e o ticket fica com opacidade .75.
- **Teclado e bump bar:** setas navegam, Enter avança, Esc desfaz, 1/2/3 filtra, `,` abre Ajustes. Foco com anel de 4 px e `outline-offset` 4 px em volta do card.
- **Ticket cancelado:** fica 15 s com faixa `danger-soft` "Pedido cancelado" e botão "Dispensar".

### 6.4 Gestão e BI (desktop 1440×900)
- **Shell:** SideNav de 248 px (logo + "VaptPDV" com "PDV" em mostarda): Visão geral, Cardápio, Estoque, Vendas, Equipe, Fiscal. Rodapé com operador, tema e estado dos serviços.
- **Visão geral:** período (Hoje / 7 dias / 30 dias) em SegmentedControl, 4 KPIs, pedidos por hora (BarChart), meios de pagamento (HBarList), mais vendidos (RankTable) e "Precisa de atenção" (AlertItem: esgotado, estoque baixo, vendas pendentes). Cada card tem skeleton e ErrorState próprio: um serviço de relatórios fora do ar não derruba a tela.
- **Cardápio e Estoque:** tabela com filtros, drawer de produto (formulário em coluna única, "Descartar alterações?" se sujo), modal de reposição que avisa quando o estoque mudou ("O estoque mudou para X. Revise o valor.").
- **Vendas:** quatro abas (Comandas, Faturamento, Curva ABC, Garçons) com filtros de período e exportação CSV. Percentuais vêm prontos do serviço, nunca recalculados.
- **Equipe:** lista com perfis e inativação confirmada. **Fiscal:** placeholder honesto ("Emissão fiscal indisponível nesta versão").
- Especificação detalhada das telas M01–M15 em `docs/design/40-gestao.md`.

## 7. Estados obrigatórios (todas as telas)

| Estado | Regra visual |
|---|---|
| Carregando | skeleton com **a mesma quantidade e dimensões** do conteúdo final (mesas 8, produtos 12, linhas 8, KPIs 4) e `aria-busy` |
| Vazio (nada ainda) | ícone linear 40 px, título curto, ação seguinte ("Toque em Abrir mesa") |
| Vazio (filtro) | "Nenhum … com esses filtros" + "Limpar filtros" |
| Erro | ErrorState com "Tentar de novo" e detalhe recolhido com `requestId` |
| Sucesso | toast discreto de 3–4 s; marcos (pagamento) ganham tela própria |
| Sem conexão | cache com carimbo ("Mostrando dados de 19:42"), banner, botões de gravação desabilitados com o motivo "Sem conexão". **Não há fila de vendas na v1** |
| Degradado | pill "▲ Parcial" + banner; o fluxo crítico nunca é bloqueado |
| Item esgotado | opacidade .55 + pill "Esgotado", não clicável |
| Sem permissão | tela X06-b explicando o motivo, ou controle desabilitado com motivo ("Somente o caixa fecha a conta") |
| Impressora | placeholder "Impressora não conectada" com "Tentar de novo" (desabilitado: "Disponível em versão futura") |
| Modo leitura | faixa "Esta comanda está {status}. Não é possível lançar itens." |
| Rascunho pendente | aviso brand-soft "Há itens não enviados na Mesa 4. Eles ficam salvos neste aparelho." |

## 8. Acessibilidade e operação

### 8.1 Acessibilidade
- Contraste conforme §2.4. Foco visível: anel de `--focus-width` (2 px; 4 px no KDS) na cor `focus`, com `outline-offset` de 2 px, nunca coberto por barras fixas (`scroll-padding`).
- Controles reais (`button`, `a`, `input` com `label`); ícone sem texto com `aria-label`; um `h1` por tela; landmarks (`header`, `nav`, `main`); tabelas com `caption` `sr-only`.
- Modal, drawer e sheet: foco preso, fundo `inert`, `Esc` fecha, foco volta ao gatilho.
- Valores que mudam (total, "Falta pagar", rascunho) em `aria-live="polite"`; erros em `role="alert"`; só "Sem conexão" é `assertive`. Cronômetros não anunciam por segundo, só a mudança de faixa.
- `prefers-reduced-motion` e `prefers-color-scheme` respeitados. Zoom a 200% sem perder função; sem rolagem horizontal da página.
- Nada depende de hover nem de gesto. Atalhos de teclado nunca são o único caminho.

### 8.2 Camadas de feedback do sistema
Da menos para a mais intrusiva; use a menor que resolve.

| Camada | Quando | Visual | Posição |
|---|---|---|---|
| **Pill de status** | sempre presente | H 32, ícone + texto (X03) | cabeçalho: ao lado do Avatar (Garçom), TopBar (Caixa), cabeçalho (KDS), rodapé da SideNav (Gestão) |
| **Banner** | estado ≠ sincronizado | faixa `control`, ícone + texto + ação; brand (degradado), danger (sem conexão, impressora), success (voltou, some em 4 s) | logo abaixo do cabeçalho da tela, largura do conteúdo; empurra o conteúdo em vez de cobrir |
| **Toast** | resultado de ação | 360 px no desktop, `100% − 32` no celular, H mín. 56, faixa lateral de 6 px com a cor semântica, ícone + texto + ação opcional; máx. 3 empilhados, duplicatas agrupadas | desktop: canto inferior direito, acima do ShortcutFooter; celular: **topo**, abaixo da safe area, para não cobrir o rodapé com o CTA; KDS: base central |
| **Inline** | erro de campo ou linha | ícone + texto `danger-text` junto ao campo, foco no primeiro erro | no próprio elemento |
| **Diálogo** | só quando exige decisão | ConfirmDialog (§5) | centro (modal) ou base (sheet) |

Duração: sucesso 3–4 s; atenção 8 s; Desfazer 5 s; erro e persistentes (item pronto, nova versão) até o usuário agir. Toast de erro nunca some sozinho.
Nomes de serviço na interface: Cozinha, Fidelidade, Relatórios, Servidor.

### 8.3 Ações destrutivas e Desfazer
- Preferir **Desfazer** (5 s, mutação adiada, fechar a tela descarta a ação) para remover item e avançar ficha do KDS.
- Confirmar com diálogo apenas quando não há como desfazer ou o efeito é alto: cancelar pedido, remover pagamento lançado, cancelar cobrança Pix, sair do pagamento com valores lançados, inativar produto ou usuário, descartar alterações, pedir a conta, abrir comanda sobre conta aguardando pagamento, limpar rascunho, remover item já entregue. O botão destrutivo leva o nome da ação ("Cancelar pedido"); o seguro é "Voltar" e recebe o foco inicial.

### 8.4 Dinheiro, gorjeta e divisão
- Valores em tela de comanda **aberta** são **estimados** e levam o rótulo "Estimado" (tooltip: "O valor final é calculado ao fechar a conta"); depois de fechar valem os valores do servidor, sem rótulo.
- Gorjeta de 10% vem sugerida (switch ligado) e é sempre removível; arredondamento *round half up* em centavos. No pagamento ela já está definida: "Gorjeta definida no fechamento."
- Divisão de conta nunca altera o total sem mostrar a diferença: "Soma das parcelas R$ X · Diferença R$ 0,00" precisa fechar em zero; sobras de centavos aparecem como "R$ 0,01 a mais nas primeiras N parcelas".
- Cartão em qualquer subtipo (crédito, débito, vale-refeição) é só visual; o servidor recebe "cartão".

### 8.5 Teclado
Caixa: `F2 F4 F6 F7 F8`, `/`, `?`, `Esc`, `1–5`, `Ctrl+Enter`; atalhos não disparam com foco em campo de texto, exceto F-keys e Esc. KDS: ver §6.3.

## 9. Conteúdo

- Frases curtas, verbo + objeto, voz ativa, sem jargão, *sentence case*. Um termo por conceito: **Mesa, Comanda, Pedido, Ticket (KDS)**. Pedido aparece como "Pedido 0482" (4 dígitos); local como "Mesa 6", "Balcão 27", "Retirada 12".
- **Erros** dizem o que houve e como resolver, sem culpar: "Esta mesa já está aberta. Abra a comanda existente ou escolha outra mesa." Não pedem desculpa e nunca mostram código solto (o `requestId` fica em "Ver detalhes").
- **Vazios** indicam a próxima ação. **Sucessos** repetem o verbo do botão ("Enviar para a cozinha" → "3 itens enviados para a cozinha.").
- **Degradação** explica o que continua funcionando: "Cozinha fora do ar. Você continua vendendo; os itens são enviados quando ela voltar."
- **Formatos:** CPF `000.000.000-00` (mascarado após vincular: `***.456.789-**`), telefone `(84) 99999-9999`, tempo "12 min", "1h12", cronômetro `18:05`, turnos (almoço, tarde, jantar, madrugada).
- **Honestidade de escopo:** funções fora da v1 aparecem desabilitadas com motivo ("Não disponível nesta versão", "Em breve"), nunca somem sem explicação nem fingem funcionar. O QR Pix traz a legenda "QR Code de demonstração".
- Textos de interface ocupam até 30% mais que em inglês: nada de largura fixa em rótulo.

## 10. Para gerar telas (prompt base)

**Prompt base:** "Use o DESIGN.md do VaptPDV: fundo creme, ação em mostarda (preenchimento, texto café por cima), texto em café, sucesso manjericão, erro tomate; Plus Jakarta Sans; cantos 14/20/24 e pill; sem emojis nem neon; tema claro e escuro; alvos ≥ 44 px; estados completos (carregando, vazio, erro, sem conexão, esgotado, sem permissão). Gere a tela [nome] do módulo [Caixa | Garçom | KDS | Gestão] conforme a seção 6, usando os dados de exemplo abaixo."

**Dados de exemplo** (para a tela parecer real): estabelecimento "VaptPDV Bar"; garçons Lucas e Ana; mesa 4 com 3 pessoas aberta há 34 min; produtos Hambúrguer artesanal R$ 34,90, Cheeseburger duplo, Batata rústica, Onion rings (esgotado), Chopp 300 ml, Limonada suíça; Pedido 0482 com subtotal R$ 131,80, gorjeta R$ 13,18 e total R$ 144,98; R$ 60,00 em dinheiro já lançados e "Faltam R$ 84,98"; KDS com Mesa 6 (2× Cheeseburger duplo, "Sem picles") em 01:12 e uma ficha com "Alergia: sem glúten".

**Variações por módulo:**
- *Garçom:* celular 390×844, retrato, zona do polegar, CTA fixo no rodapé, BottomNav de 4 destinos.
- *Caixa:* 1440×900, rail de 88 px, grade de 4 colunas, painel direito de 440 px com Cobrar, rodapé de atalhos.
- *KDS:* 1920×1080, tema escuro, 3 colunas, tipografia gigante, borda lateral de SLA com texto.
- *Gestão:* 1440×900, sidebar de 248 px, 4 KPIs, gráfico de barras em mostarda com rótulos diretos.

## 11. `tokens.css` (copiar para `design-tokens/tokens.css`)

Hex só aqui; o resto do código usa `var(--…)` (o Stylelint barra hex fora deste arquivo).

```css
:root {
  color-scheme: light;
  /* cor */
  --color-bg:#FBF7F1; --color-surface:#FFFFFF; --color-surface-raised:#FFFFFF; --color-surface-2:#F3ECE1;
  --color-border:#E5DACB; --color-border-strong:#8C7A68;
  --color-text:#2B2019; --color-text-2:#6A5849;
  --color-brand:#F2A81D; --color-brand-hover:#E39A0B; --color-brand-press:#C98400; --color-on-brand:#2B2019;
  --color-brand-soft:#FDF0D2; --color-brand-text:#8A5200; --color-brand-edge:#A86400;
  --color-nav:#3A2A21; --color-nav-active-bg:#523C2E; --color-nav-text:#F6EEE4; --color-nav-text-2:#C9B8A6;
  --color-success:#2F7D4F; --color-success-soft:#DDF0E4; --color-success-text:#1F6B3E;
  --color-danger:#C4391D; --color-danger-soft:#FBE3DC; --color-danger-text:#A52E15; --color-on-danger:#FFFFFF;
  --color-focus:#2B2019; --color-scrim:rgba(43,32,25,.5);
  --color-chart-bar:#F2A81D; --color-chart-bar-stroke:#8A5200;
  --color-tint-1:#FBE6B8; --color-tint-2:#E4EFD5; --color-tint-3:#F8D9CC; --color-tint-4:#EBDDCB;
  /* tipografia */
  --font-sans:"Plus Jakarta Sans", system-ui, sans-serif;
  --fs-kpi:30px; --fs-title:24px; --fs-section:18px; --fs-body:15px; --fs-body-sm:14px; --fs-caption:13px; --fs-micro:12px;
  --fs-kds-place:36px; --fs-kds-order:22px; --fs-kds-qty:32px; --fs-kds-item:30px; --fs-kds-note:22px;
  --fs-kds-allergy:24px; --fs-kds-button:26px; --fs-kds-timer:26px; --fs-kds-column:30px; --fs-kds-clock:44px;
  --kds-scale:1;
  /* forma */
  --radius-xs:6px; --radius-control:14px; --radius-card:20px; --radius-card-lg:24px;
  --radius-btn-lg:18px; --radius-sheet:28px; --radius-pill:999px;
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-6:24px; --space-8:32px; --space-12:48px;
  --shadow-1:0 1px 2px rgba(43,32,25,.06); --shadow-float:0 6px 16px rgba(43,32,25,.16);
  --target-min:44px; --focus-width:2px; --focus-offset:2px;
  /* movimento e camadas */
  --dur-fast:100ms; --dur-base:160ms; --dur-slow:240ms;
  --ease-out:cubic-bezier(.2,.8,.2,1); --ease-in:cubic-bezier(.4,0,1,1);
  --z-sticky:10; --z-nav:20; --z-fab:30; --z-drawer:40; --z-modal:50; --z-toast:60;
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-bg:#17120F; --color-surface:#221A15; --color-surface-raised:#2A2019; --color-surface-2:#2D231C;
  --color-border:#43342A; --color-border-strong:#8F7B69;
  --color-text:#F6EEE4; --color-text-2:#C2B1A0;
  --color-brand:#F5B335; --color-brand-hover:#F8BF52; --color-brand-press:#E0A024; --color-on-brand:#2B2019;
  --color-brand-soft:#3D2E14; --color-brand-text:#F5C766; --color-brand-edge:#F5B335;
  --color-nav:#0F0B09; --color-nav-active-bg:#2A201A; --color-nav-text:#F6EEE4; --color-nav-text-2:#BBAA98;
  --color-success:#5FC083; --color-success-soft:#1D3326; --color-success-text:#7FD39D;
  --color-danger:#F07A60; --color-danger-soft:#3D1E17; --color-danger-text:#FF9C85; --color-on-danger:#2B2019;
  --color-focus:#F6EEE4; --color-scrim:rgba(0,0,0,.62);
  --color-chart-bar:#F5B335; --color-chart-bar-stroke:#F5C766;
  --color-tint-1:#4A3815; --color-tint-2:#27382A; --color-tint-3:#4A2A20; --color-tint-4:#3A2E25;
  --shadow-1:none; --shadow-float:none;
}
/* "Automático": lib/theme.ts lê prefers-color-scheme e grava data-theme="light" ou "dark" na raiz; o CSS só conhece esses dois valores. */
:root[data-surface="kds"] { --focus-width:4px; --focus-offset:4px; --target-min:56px; }
body { font-family:var(--font-sans); background:var(--color-bg); color:var(--color-text); font-variant-numeric:tabular-nums; }
:focus-visible { outline:var(--focus-width) solid var(--color-focus); outline-offset:var(--focus-offset); }
@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation:none !important; transition:none !important; } }
```

## 12. Ícones e imagens

- **Ícones:** `lucide-react`, traço de 2 px, importados um a um, mais `icon-pix.svg` (único ícone próprio). Tamanhos: 14 (pill), 20 (botão), 24 (navegação), 28 (tile de pagamento), 40 (tile de produto e estados vazios), 64 (venda concluída). Cor herdada do texto do contexto; nunca decorativos coloridos. Confirmar no pacote instalado que cada nome citado existe e trocar pelo equivalente mais próximo se faltar.
- **Navegação:** Venda `shopping-cart` · Mesas `layout-grid` · Pedidos `clipboard-list` · Caixa `wallet` · Ajustes `settings` · Gestão: Visão geral `layout-dashboard`, Cardápio `book-open`, Estoque `package`, Vendas `chart-no-axes-column`, Equipe `users`, Fiscal `file-text`.
- **Ações e estados:** observação `message-square-text` · alergia `shield-alert` · remover `trash-2` · erro `circle-alert` · atenção `triangle-alert` · busca `search` · tema `sun-moon`, `sun`, `moon` · pagamento: Dinheiro `banknote`, Cartão `credit-card`, Vale-refeição `ticket`, Pix `icon-pix`.
- **Imagem de produto:** não existe na v1; o tile tintado é a identidade do produto. Quando houver foto, ela ocupa o mesmo quadrado (96 no Caixa, 56 no Garçom) com `object-fit: cover` e `radius-control`, e o tile tintado continua como fallback. Uma variante "foto grande" (4:3 no topo do card) é permitida só no Caixa e só se o estabelecimento tiver foto em todo o cardápio, para a grade não ficar irregular.
- **Logo:** quadrado "V" em mostarda com `on-brand` (56 no KDS, 48 no rail, 40 na sidebar); no login, logo + "VaptPDV" com "PDV" em mostarda sobre fundo claro usando `brand-text` para manter 4,5:1.

## 13. Responsividade, densidade e impressão

| Faixa | Largura | Comportamento |
|---|---|---|
| Compacta | < 600 | Garçom; Login em lista de linhas de 72; drawer vira sheet |
| Média | 600–1023 | Garçom em tablet (grade de 3 a 6 colunas); Caixa abaixo de 1024: rail de 72 e painel de pedido vira drawer |
| Grande | 1024–1279 | Caixa com grade de 3 colunas; tabelas ainda em modo tabela |
| Expandida | ≥ 1280 | Caixa com grade de 4 colunas e mesas em 6; drawers de 560 para formulários longos |

- Mobile first no Garçom; desktop first no Caixa e na Gestão (com fallback usável). KDS é 16:9, mas nada se perde a 1280×720.
- Tabelas com menos de 1024 px viram lista de cards; formulários em coluna única; `100dvh` e `env(safe-area-inset-*)` no celular; teclado virtual nunca cobre o botão primário do sheet.
- **Impressão:** só o recibo. `@page { size: 80mm auto }`, preto sobre branco, sem sombra, fonte tabular, `@media print` esconde todo o resto. "Imprimir via do cliente" usa o diálogo do navegador (sem impressora térmica na v1).
- **PWA:** `theme_color` #F2A81D, `background_color` #FBF7F1, ícones 192/512 com versão *maskable*; Garçom prefere retrato.

## 14. Escopo da v1 e decisões deste documento

**Fora da v1** (a interface mostra desabilitado com motivo ou omite): fila offline de vendas e sincronização posterior, NFC-e e contingência, desconto, transferência de mesa, impressora térmica e de cozinha, leitor de código de barras, resgate de cashback, estações do KDS além de Cozinha e Bar, foto de produto, abertura e fechamento de turno de caixa.

**Divergências da versão anterior deste arquivo, resolvidas para bater com as specs:**
- KDS: filtros Chapa, Fritadeira e Montagem saíram; ficam Todas, Cozinha e Bar.
- Offline: "vendas em fila" e "NFC-e em contingência" saíram; a v1 mostra cache com carimbo e bloqueia gravação com motivo.
- Caixa: o leitor de código de barras saiu da busca; F2 e `/` só buscam por nome.
- Banner "Offline com N vendas na fila" substituído pela tabela de §8.2.
- Visão geral: "vendas pendentes de sincronização" só aparece quando o serviço informar; sem dado, o alerta não é exibido.

**Decisões novas, para você validar:**
- `brand-edge`: a mostarda no tema claro dá 2:1 como linha; bordas de seleção e o marcador "Minha" passam a usar este token (4,7:1). O botão e o chip continuam mostarda cheia.
- Toast do Garçom no **topo** do celular, para não cobrir o rodapé fixo com "Enviar para a cozinha".
- Status "Aguardando pagamento" em `danger`, igual a "Conta pedida", porque é a mesma situação vista da comanda e da mesa.
- Tokens `brand-hover`, `brand-press`, `nav-text`, `nav-text-2` e a escala de z-index foram criados porque as specs e o CSS precisam deles.

**A validar com usuários reais:** legibilidade do KDS a 3 m com luz de cozinha; tamanho dos alvos do Garçom com luva ou mão molhada; se "Aguardando pagamento" em vermelho gera alarme demais no Caixa em horário de pico.
