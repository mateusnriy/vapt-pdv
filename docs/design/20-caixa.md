# Modo Caixa (C01–C17) — desktop/tablet 1440×900, mouse + teclado + toque

**Perfis:** `caixa`, `gerente`. **Shell:** `RailNav` 88 px (Venda · Mesas · Pedidos · Caixa · Ajustes) + `TopBar` 80 px + conteúdo + `ShortcutFooter`. Largura mínima 1024 (abaixo: rail 72, painel de pedido vira drawer). Alvos ≥ 44 px. Tudo operável por teclado; atalhos globais `F2 F4 F6 F7 F8`, `/`, `?`, `Esc`.
**Referências visuais:** `referencias/Caixa_-_Venda_2x.png`, `Caixa_-_Pagamento_2x.png` (ver deltas de escopo em `DESIGN.md §14`).
**TopBar (todas as telas do Caixa):** busca (só C01/C03) · pill X03 "Sincronizado" · pill "Impressora cozinha — Não conectada" (placeholder P-14, abre C16) · operador (Avatar + "Ana L." + "Caixa 01"; abre X02).
**Princípio de dinheiro:** valores em tela de comanda `aberta` são **estimados** (P-07); após `fechar`, valores do servidor.

---

## C01 — Venda (balcão)

**Rota:** `/caixa/venda` (opcional `?comanda=<id>` para continuar comanda de mesa) · **RF03–RF05, RF11, RF13, RF16 · RN01, RN04, RN06, RN08, RN13**.

**Layout (1440×900):**
```
┌──┬───────────────────────────────────────────────┬──────────────────────┐
│V │ [🔍 Buscar item (F2)] [●Sincron.][Impressora][AL]│ Pedido 0482  [Cliente F4]│
│  ├───────────────────────────────────────────────┤ Balcão · senha 27      │
│Venda│ [Todos][Lanches][Porções][Bebidas][Sobrem.][Combos]│ ───────────────────── │
│Mesas│ ┌────┐┌────┐┌────┐┌────┐  grade 4 col, gap 16│ Hambúrguer art. [−2+] 69,80│
│Ped. │ │tile││tile││tile││tile│                    │  Sem cebola · médio      │
│Caixa│ └────┘└────┘└────┘└────┘                    │ ...        linhas c/ colunas fixas │
│     │ ...                                          │ ───────────────────── │
│Ajust│ F2 Buscar · F4 Cliente/CPF · F6 Desconto ·   │ Subtotal (estimado)   │
│     │ F7 Nota fiscal · F8 Cobrar                   │ Gorjeta 10% [switch]  │
└──┴───────────────────────────────────────────────┤ Total  R$ 144,98      │
                                                    │ [Desconto][Mais ▾]    │
                                                    │ [ Cobrar  R$ 144,98 ] │
                                                    └──────────────────────┘
```
**Região central:** chips de categoria (`Todos` + categorias de `/produtos`; contagem opcional) · grade de `ProductCard` (4 colunas ≥ 1280; 3 em 1024–1279) · rolagem independente; rodapé de atalhos fixo.
**Busca (F2 ou `/`):** filtra a grade por nome (sem acento, parcial); `Enter` com **exatamente 1** resultado adiciona +1; `Esc` limpa. Placeholder "Buscar item (F2)". Código de barras não suportado (PB-05).
**Adicionar produto:** clique/toque/`Enter` no card ⇒ +1. Sem comanda ainda: cria `POST /comandas {mesa:"B-<senha>", garcom_id:<Balcão>}` (senha = maior senha `B-*` do dia + 1; em `MESA_OCUPADA` tenta a seguinte) e em seguida `POST …/itens`. Otimista: a linha aparece na hora; falha ⇒ reverte e toast. Cada +1 adicional no mesmo produto ⇒ `PATCH` quantidade (agrupa cliques em janela de 250 ms).
**Painel de pedido (440 px):**
- Cabeçalho: "Pedido {nº}" (24/800) + "Balcão · senha 27" ou "Mesa 6" + botão **Cliente** (`F4`, abre C14; se vinculado, vira chip "Mariana · ***.456.789-**" com ×).
- Linhas `OrderLine` com **colunas fixas**; observação abaixo do nome; botão observação (C15). `−` em 1 remove com Desfazer (X04).
- Aviso de cozinha (se comanda existe e KDS responde): pill `brand-soft` "2 itens ainda no preparo" (informativo; RF22).
- Resumo: Subtotal (estimado) · **Gorjeta 10%** (Switch, ligado por padrão, removível) · **Total**.
- Ações: **Desconto** (secundário, **desabilitado**: "Não disponível nesta versão") · **Mais** (menu: "Cancelar pedido" → C13, "Limpar pedido" se vazio) · **Cobrar** `xxl` 68 px "Cobrar" à esquerda + valor à direita (`F8`).
**Cobrar:** `POST /comandas/:id/fechar {aplicar_taxa_servico}` ⇒ comanda `fechada` ⇒ navega a C07. Sem itens ⇒ desabilitado (`disabledReason: "Adicione itens"`). `409 COMANDA_SEM_ITENS` improvável; tratar via catálogo.
**Estados:** carregando produtos (12 skeletons) · erro de produtos (ErrorState + cache em `StaleWhileRevalidate`) · sem conexão (grade usa cache, **adicionar** desabilitado "Sem conexão") · degradado (KDS: banner; venda segue) · produto esgotado (card .55 + pill; não clicável) · `ESTOQUE_INSUFICIENTE` (toast "Só restam {n} de {produto}" e stepper limitado) · pedido vazio (X07) · sem usuário "Balcão" (EmptyState de configuração: "Falta o garçom 'Balcão'. Peça ao gerente para cadastrá-lo (perfil Garçom)." — Q-02).
**A11y:** grade como `ul` de `button`s; foco visível; leitor: "Hambúrguer artesanal, R$ 34,90, adicionar. 2 no pedido."; total em `aria-live="polite"` ao mudar.
**CA:**
- CA-C01-1: tocar em 3 produtos diferentes e `F8` leva a C07 com `total` igual ao do servidor.
- CA-C01-2: alternar Gorjeta 10% altera o total estimado imediatamente e o `aplicar_taxa_servico` enviado em `fechar`.
- CA-C01-3: produto `estoque=0` não é adicionável; produto inativo não aparece.
- CA-C01-4: stepper de linhas alinhado verticalmente em todas as linhas (teste visual).
- CA-C01-5: tile do produto mede 96×96 e o ícone varia por categoria.
**testid:** `produto-<id>`, `busca-produto`, `painel-pedido`, `linha-pedido-<itemId>`, `switch-gorjeta`, `btn-cobrar`, `btn-cliente`.

---

## C02 — Mesas

**Rota:** `/caixa/mesas` · **RF09, RF10, RF16** · **Poll 5 s.**
**Layout:** título "Mesas" + contadores em pills (Ocupadas N · Contas pedidas N · Livres N) · filtros `Todas · Ocupadas · Conta pedida · Livres` · grade 6 colunas (≥ 1280) de `MesaCard` (versão larga: H 132, inclui nome do garçom e itens).
**Ações:** clique em mesa Ocupada/Conta pedida ⇒ C05 (drawer). Mesa Livre ⇒ sem ação (tooltip "Mesas são abertas pelo garçom"; botão "Abrir mesa no Caixa" **fora do escopo** — usar C01 balcão).
**Ordenação "Conta pedida" primeiro** quando filtro = Todas? **Não**: manter ordem numérica; "Conta pedida" destaca por borda e pill (layout estável).
**Estados:** padrão X07; sem conexão = cache + carimbo.
**CA:** CA-C02-1: mesa com `fechada` sem `aberta` aparece "Conta pedida"; CA-C02-2: pill + borda 2 px danger; CA-C02-3: clicar abre C05 e a URL ganha `?comanda=<id>`.
**testid:** `mesas-caixa-grid`, `mesa-<n>`.

---

## C03 — Pedidos

**Rota:** `/caixa/pedidos` · **RF09.** Filtros: busca por mesa/nº; status (chips: Todas, Abertas, Aguardando pagamento, Pagas, Canceladas); período (`de`/`ate`, padrão hoje); `Limpar filtros`.
**DataTable:** colunas **Pedido · Mesa/Local · Garçom · Status · Itens · Total · Aberta em**; linha clicável ⇒ C05; paginação 25/50; ordenação do servidor (mais recente). Total: estimado em aberta (com "~"), final em fechada/paga.
**Estados:** padrão X07 (vazio: "Nenhum pedido no período.").
**CA:** CA-C03-1: filtros combinados geram `GET /comandas?status=&mesa=&de=&ate=&limit=&offset=` exatamente; CA-C03-2: filtros ficam na URL.
**testid:** `tabela-pedidos`, `filtro-pedidos-<campo>`.

---

## C04 — Receber (contas a receber)

**Rota:** `/caixa/receber` (item "Caixa" do rail) · **UC04, UC05** · **Poll 5 s.**
**Duas seções:**
1. **Contas pedidas — fechar** (comandas `aberta` com `conta_solicitada_em`, PB-01): cartão com Mesa, garçom, itens, tempo desde o pedido da conta, botão **Fechar conta** (abre C06).
2. **Aguardando pagamento** (`fechada`): cartão com Mesa, nº do pedido, **total** (final), tempo esperando (`fechada_em`), botão primário **Cobrar** ⇒ C07.
Ordenar por tempo esperando (mais antigo primeiro); atrasos (> 5 min) com pill "Atrasado" danger. Cartões clicáveis também abrem C05.
**Estados:** vazio "Nenhuma conta aguardando pagamento." · padrão X07.
**CA:** CA-C04-1: mesa que pediu a conta no Garçom aparece na seção 1 em ≤ 5 s; CA-C04-2: após pagar, some da seção 2.
**testid:** `secao-fechar`, `secao-cobrar`, `btn-cobrar-<comandaId>`.

---

## C05 — Detalhe da comanda

**Tipo:** Drawer 480/560 px · **Gatilho:** `?comanda=<id>` · **RF10, RF22.**
**Conteúdo (de cima para baixo):** cabeçalho (Pedido nº · Local · StatusPill · IconButton fechar) → metadados (garçom, aberta há…, cliente/CPF mascarado, "Fechada em HH:MM" quando houver) → **tabela de itens** (qtd × nome_copiado, observação, preço_copiado, subtotal do item) → totais (**estimado** se `aberta`; final se não) → **Pendências da cozinha** (RF22; só `aberta`/`fechada`): "2 itens ainda não foram entregues na mesa" com lista; indisponível ⇒ "Não foi possível consultar a cozinha" (neutro) → **ações** conforme status:

| Status | Ações no rodapé |
|---|---|
| `aberta` | **Fechar conta** (primário → C06) · Adicionar itens (→ C01 `?comanda=`) · Mais ▾: Cancelar pedido (C13) |
| `fechada` | **Cobrar** (primário → C07) |
| `paga` | **Ver recibo** (→ C12 modo recibo) · imprimir |
| `cancelada` | nenhuma (texto "Comanda cancelada em HH:MM") |
**CA:** CA-C05-1: pendência de cozinha nunca bloqueia "Fechar conta"; CA-C05-2: valores de `paga` coincidem com o servidor (sem "Estimado").
**testid:** `drawer-comanda`, `btn-fechar-conta`, `btn-ver-recibo`.

---

## C06 — Fechar conta (gorjeta 10%)

**Tipo:** Modal `sm` · **Gatilho:** "Fechar conta" (C04/C05) · **RF06, RF14, RN05, RN11, RN12, RN15.** (Em C01 a gorjeta é escolhida no próprio painel e `Cobrar` fecha direto.)
**Conteúdo:** título "Fechar a conta da Mesa 4" · resumo: "{N} itens" · Subtotal (estimado) · **Switch "Gorjeta 10%"** (ligado; ajuda: "Taxa de serviço opcional. O cliente pode recusar.") + valor · **Total (estimado)** 30/800 · aviso condicional de cozinha (brand-soft, não bloqueia) · botões: "Voltar" · **"Fechar conta"** (primário `lg`).
**Fluxo:** `POST /comandas/:id/fechar {aplicar_taxa_servico}` ⇒ `200` ⇒ modal troca para **estado de sucesso**: "Conta fechada. Total R$ 144,98" (valores do servidor) com botões **"Cobrar agora"** (primário → C07) e "Cobrar depois" (fecha). Erros: `COMANDA_SEM_ITENS` (sugere cancelar), `COMANDA_NAO_ABERTA` (recarrega).
**CA:** CA-C06-1: o `total` mostrado após o sucesso vem do servidor (testar com arredondamento `round_half_up`: subtotal `"33.35"` ⇒ gorjeta `"3.34"`); CA-C06-2: Gorjeta desligada envia `aplicar_taxa_servico:false` e total = subtotal.
**testid:** `modal-fechar-conta`, `switch-gorjeta`, `btn-confirmar-fechar`.

---

## C07 — Pagamento

**Rota:** `/caixa/pagamento/:comandaId` (exige `fechada`; senão X06/redirect para C05) · **RF07, RF16, RN02, RN24.**

**Layout (3 colunas, 1440×900; header 80):**
```
┌ ‹ Voltar ao pedido   Pagamento · Pedido 0482                 ● Online ┐
├───────────────┬─────────────────────────────────┬──────────────────────┤
│ RESUMO        │ Forma de pagamento              │ NOTA FISCAL          │
│ 2× Hambúrg... │ [Pix][Crédito][Débito][Dinheiro][Vale-ref.]│ CPF/CNPJ (opcional) │
│ ...           │ ┌─ painel da forma ───────────┐ │ [ 000.000.000-00 ]   │
│ Subtotal      │ │ Valor a cobrar [ R$ 84,98 ] │ │ ⓘ Emitir NFC-e  (desab.)│
│ Gorjeta 10%   │ │ Dividir a conta: [Igual][Por item][Por pessoa]│ Imprimir via do cliente [on]│
│ Total 144,98  │ │ (conteúdo específico da forma)│ │ nota de contingência │
│ ───────────── │ └─────────────────────────────┘ │                      │
│ Já pago 60,00 │                                 │ [ Concluir venda ]   │
│ ▓▓▓░░░ Falta 84,98│                             │  Faltam R$ 84,98     │
│ Pagamentos lançados│                            │                      │
└───────────────┴─────────────────────────────────┴──────────────────────┘
```
**Coluna Resumo (≈ 380 px):** linhas da comanda (qtd × nome, valor) · Subtotal · Gorjeta 10% (valor do servidor; **sem opção de remover aqui** — dica: "Para alterar, cancele e refaça o fechamento" não existe; texto: "Gorjeta definida no fechamento.") · **Total** · bloco `Já pago` / **`Falta pagar`** + `ProgressBar` (success) · lista **Pagamentos lançados** (`PaymentLine`: forma, detalhe, valor, "Remover").
**Coluna central:** `radiogroup` de `PaymentMethodTile` (Pix padrão; atalhos `1–5`) → painel da forma (abaixo) → **MoneyInput "Valor a cobrar neste pagamento"** (preenchido com *Falta pagar*; editável; nunca > falta, exceto Dinheiro que aceita "recebido" maior) → **"Dividir a conta"** (3 chips; abre C11) → botão **"Lançar pagamento"** (secundário `lg` 52; desabilitado se valor ≤ 0) — **no Pix** o botão é "Confirmar Pix recebido".
**Painéis por forma:**
- **C10 Pix (P-12):** `QrPanel` com QR de demonstração + legenda "QR Code de demonstração"; texto "Mostre o QR ao cliente e confirme quando o valor cair na conta."; banner "Aguardando pagamento · expira em 04:32" (cronômetro 5:00; ao zerar: "QR expirado" + botão "Gerar novo QR"); "Copiar código Pix" (secundário); "Cancelar cobrança" (destrutivo → X05 `cancelar-pix`); **"Confirmar Pix recebido"** (primário) lança o pagamento.
- **C08 Dinheiro:** campo "Valor recebido" (MoneyInput + NumPad opcional + atalhos rápidos `R$ 20 · 50 · 100` e "Valor exato") → mostra **Troco** (`Cents`, em destaque 30/800 `success-text`; "Sem troco" se 0); **Lançar pagamento** lança `min(recebido, valor a cobrar)`; troco só informativo (registrado no `PaymentLine` "Troco: R$ 15,02"). Recebido < valor a cobrar ⇒ erro "O valor recebido é menor que o valor a cobrar."
- **C09 Cartão (Crédito/Débito/Vale-refeição):** selecionar o tile define o **subtipo visual**; texto "Cobre na maquininha e confirme aqui." (sem TEF); campo opcional "Final do cartão ou comprovante (NSU)" (≤ 12, **não enviado ao backend** — apenas ecoado no PaymentLine local); **Lançar pagamento** confirma. Todos mapeiam para `forma_pagamento: "cartao"`.
**Coluna Fiscal:** Field **CPF/CNPJ (opcional)** com máscara e validação → se preenchido, tenta vincular fidelidade (C14, `GET resumo`) e exibe chip "Cliente: Mariana · saldo R$ 12,40" ; **Switch "Emitir NFC-e"** ligado e **desabilitado** + ajuda "Emissão fiscal indisponível nesta versão. A via do cliente é um comprovante simples." ; **Switch "Imprimir via do cliente"** (ligado; usa `window.print()` em C12) ; nota "Sem internet, a nota é emitida em contingência…" **removida** (não aplicável). 
**Concluir venda:** `primary xxl`; **habilitado só com `Falta pagar = R$ 0,00`**; desabilitado mostra o motivo no próprio botão ("Faltam R$ 84,98"). Ao clicar: `POST /comandas/:id/pagar {forma_pagamento, cpf?, pagamentos?}` (P-08) ⇒ `200 paga` ⇒ navega a C12. Atalho `Ctrl+Enter` (e `F8`).
**Regras de split (RN24 / DESIGN §8):** lançamentos ficam só na UI; "Remover" exige X05; sair da tela com lançamentos ⇒ X05 `sair-pagamento`; divisão **nunca** altera o total — se a divisão gera diferença de centavos, exibir "Diferença de R$ 0,01 na primeira parcela".
**Forma enviada (P-08):** única forma ⇒ ela; mistas ⇒ a de maior valor (PB-04: `pagamentos[]` quando existir). Débito/Crédito/Vale ⇒ `"cartao"`.
**Estados:** carregando (skeleton 3 colunas) · erro de carga (ErrorState) · `COMANDA_NAO_FECHADA` (redireciona para C05 com toast) · sem conexão (Concluir desabilitado "Sem conexão") · Fidelidade fora (chip "Fidelidade indisponível"; segue) · Liquidando (botão `loading`, resto inerte) · erro ao pagar (toast + lançamentos mantidos + "Tentar de novo").
**A11y:** colunas como `section` com títulos; `Falta pagar` em `aria-live="polite"`; QR com `aria-label` "QR Code de demonstração"; cronômetro `role="timer"` com anúncio a 1:00 e 0:00.
**CA:**
- CA-C07-1: com total R$ 144,98 e R$ 60,00 em dinheiro lançados, "Falta pagar" = R$ 84,98 e "Concluir venda" desabilitado com "Faltam R$ 84,98".
- CA-C07-2: lançar R$ 84,98 no Pix habilita "Concluir venda"; clicar envia exatamente 1 `POST /pagar`.
- CA-C07-3: Crédito, Débito e Vale-refeição enviam `"cartao"`.
- CA-C07-4: Dinheiro R$ 100,00 recebido para R$ 84,98 ⇒ troco R$ 15,02 exibido; lançamento = R$ 84,98.
- CA-C07-5: NFC-e permanece desabilitada com a explicação visível.
**testid:** `forma-<pix|credito|debito|dinheiro|vale>`, `valor-cobrar`, `btn-lancar-pagamento`, `btn-confirmar-pix`, `pagamento-lancado-<n>`, `falta-pagar`, `btn-concluir-venda`, `campo-cpf`.

---

## C11 — Dividir a conta

**Tipo:** Modal `md` (640) · **Gatilho:** "Dividir a conta" (C07) · **RN24.** Três abas (`tablist`): **Valor igual · Por item · Por pessoa**. Mostra sempre no topo "Falta pagar R$ X" e, no rodapé, **"Soma das parcelas R$ X · Diferença R$ 0,00"** (precisa ser 0,00 para aplicar).
- **Valor igual:** Stepper "Dividir entre N pessoas" (2–20) → lista de N parcelas calculadas por divisão inteira em centavos; as `r` primeiras recebem +R$ 0,01 e é exibido "R$ 0,01 a mais nas primeiras {r} parcelas".
- **Por item:** lista de itens com checkbox (e quantidade parcial por Stepper quando qtd > 1); "Parcela 1" soma itens selecionados **+ gorjeta proporcional** (`tip10` sobre o subtotal selecionado, `round_half_up`); botão "Adicionar parcela" cria a próxima; a **última** parcela recebe o restante para fechar o total exato; itens já atribuídos ficam inativos com rótulo "Parcela n".
- **Por pessoa:** N linhas com Field de valor (MoneyInput); atalhos "Preencher o restante na última"; indicador "Falta distribuir R$ X".
**Aplicar:** botão "Usar parcelas" (primário; desabilitado até diferença 0,00 com motivo) ⇒ fecha modal e cria **fila de parcelas** em C07: chip "Parcela 1 de 3 · R$ 48,33"; o MoneyInput assume o valor da próxima parcela a cada lançamento. "Limpar divisão" restaura "Falta pagar".
**CA:** CA-C11-1: total R$ 100,00 ÷ 3 ⇒ parcelas 33,34 / 33,33 / 33,33 e texto da diferença; soma = 100,00. CA-C11-2: por item, soma das parcelas = Falta pagar.
**testid:** `modal-dividir`, `tab-dividir-<igual|item|pessoa>`, `parcela-<n>`.

---

## C12 — Venda concluída e recibo

**Rota:** `/caixa/concluida/:comandaId` · **RF26, RF27, RN18, RN19.**
**Layout (2 colunas):** esquerda — ícone `circle-check` 64 `success`, `h1` "Venda concluída", total 32/800, forma(s) (ex.: "Dinheiro R$ 60,00 · Pix R$ 84,98"), troco (se houver), bloco **Fidelidade**: com CPF vinculado "Mariana ganhou **R$ 6,59** de cashback (5% de R$ 131,80) e **131 pontos**" (valores do recibo/serviço — **não** recalcular; RN19 base = subtotal) ou "Cliente não identificado" + botão "Identificar cliente" **desabilitado** após pagamento (explica: "Informe o CPF antes de concluir a venda."); sem Fidelidade/atraso ⇒ "Cashback em processamento. Aparece no recibo em instantes."; ações: **"Nova venda"** (primário `xl` → C01 limpo) · "Imprimir recibo" (secundário, `window.print()`) · "Voltar às mesas". Direita — `ReceiptView` (`GET /fidelidade/recibos/:comandaId`; retry 3× a cada 2 s; se falhar: recibo **local** montado do `GET /comandas/:id` com aviso "Recibo simplificado" sem cashback/hash).
**Estados:** recibo carregando (skeleton do papel) · Fidelidade fora (recibo simplificado + banner) · modo "somente recibo" quando aberto de C05 ("Ver recibo").
**CA:** CA-C12-1: imprimir gera apenas o `ReceiptView` (CSS `@media print`), preto sobre branco, 80 mm de largura (`@page { size: 80mm auto }`); CA-C12-2: "Nova venda" não mantém itens anteriores; CA-C12-3: nenhum valor de cashback é calculado no cliente.
**testid:** `venda-concluida`, `recibo`, `btn-nova-venda`, `btn-imprimir-recibo`.

---

## C13 — Cancelar comanda

**Tipo:** ConfirmDialog (X05 `cancelar-comanda`) · **RF08, RN03, RN10.** Título "Cancelar o pedido {nº}?"; corpo com nº de itens e total estimado; seguro "Voltar" (foco inicial); destrutivo-sólido **"Cancelar pedido"**. `POST /comandas/:id/cancelar` ⇒ toast "Pedido {nº} cancelado." ⇒ C01 limpo (se estava em C01) ou fecha C05. Erros `COMANDA_NAO_ABERTA`/`COMANDA_IMUTAVEL` ⇒ catálogo. Disponível **só** para `aberta` (fechada/paga ⇒ ação ausente; com `409`, mensagem do catálogo).
**CA:** CA-C13-1: sem confirmação nada é enviado; CA-C13-2: estoque não muda (verificar `GET /produtos`).
**testid:** `dialog-cancelar-comanda`, `btn-confirmar-cancelar`.

---

## C14 — Cliente e fidelidade

**Tipo:** Modal `md` · **Gatilho:** `F4` / botão Cliente (C01) / campo CPF (C07) · **RF24, RF25, RN14, RN19.** Depende de `fidelidade-service` (se fora ⇒ botão desabilitado: "Fidelidade indisponível no momento").
**Passo 1 — Buscar:** Field "CPF ou telefone" (detecção automática: 11 dígitos começando com DDD válido e 9º dígito = telefone **ou** CPF — se ambíguo, mostrar `SegmentedControl` CPF/Telefone). `Enter` busca `GET /fidelidade/clientes?documento=`.
**Passo 2a — Encontrado:** card do cliente: Avatar, nome, CPF mascarado, **Saldo: R$ 12,40 de cashback · 340 pontos** (valores do `resumo`) + nota "Resgate de cashback não está disponível nesta versão." · botão primário **"Vincular à venda"**.
**Passo 2b — Não encontrado:** EmptyState inline "Cliente não encontrado." + botão **"Cadastrar cliente"** ⇒ formulário (Nome*, CPF*, Telefone*, E-mail) ⇒ `POST /fidelidade/clientes` ⇒ vincula. Erros: CPF duplicado ("Este CPF já está cadastrado." + ação "Usar cadastro existente"), validação.
**Vinculado:** chip no painel (C01) / bloco no C07; "Remover" desfaz o vínculo (apenas UI) antes do pagamento. O CPF segue no `POST /pagar` (`cpf`).
**Sem CPF:** botão "Continuar sem identificar" (terciário) — comanda sem fidelidade paga normalmente (RN19).
**CA:** CA-C14-1: CPF inválido bloqueia com "CPF inválido. Confira os números."; CA-C14-2: timeout de 2 s do serviço ⇒ mensagem "Fidelidade demorou para responder. Você pode continuar sem identificar." e venda não é afetada (RN17).
**testid:** `modal-cliente`, `campo-documento`, `btn-vincular`, `btn-cadastrar-cliente`.

---

## C15 — Observação e alergia do item (Caixa)

**Tipo:** Modal `sm` · mesmo conteúdo e regras de **G04** (chips rápidos, texto ≤ 140, switch Alergia) com botão "Salvar observação". Aplica `PATCH` no item (se já lançado) ou no lançamento seguinte. **Depende de PB-02.** **testid:** `modal-observacao`.

---

## C16 — Ajustes do Caixa

**Rota:** `/caixa/ajustes`. Seções (cards de 640 px, coluna única centralizada): **Aparência** (X09 tema; Densidade: Padrão/Compacta — compacta reduz `ProductCard` e linhas) · **Atalhos** (Switch "Mostrar barra de atalhos"; botão "Ver todos os atalhos" → C17) · **Impressora** (placeholder P-14: "Impressora cozinha — Não conectada"; botões "Testar impressão" e "Tentar de novo" **desabilitados** com motivo "Disponível em versão futura"; "Imprimir via do cliente" usa o navegador) · **Operador** (nome, perfil, "Trocar operador") · **Serviços** (lista com status de Core, Cozinha, Fidelidade, Relatórios — X03) · **Sobre** (versão, build, `requestId` da última falha, botão "Copiar informações de suporte").
**CA:** CA-C16-1: alterações de preferências persistem após recarregar. **testid:** `ajustes-<secao>`.

---

## C17 — Atalhos e ajuda

**Tipo:** Modal `md`; abre com `?` ou do rodapé/C16. Tabela de atalhos (agrupada por contexto):

| Contexto | Atalho | Ação |
|---|---|---|
| Global | `F2` ou `/` | Buscar item |
| Global | `F4` | Cliente / CPF |
| Global | `F6` | Desconto (indisponível) |
| Global | `F7` | Nota fiscal (indisponível) |
| Global | `F8` | Cobrar / fechar |
| Global | `Esc` | Fechar camada / limpar busca |
| Global | `?` | Esta ajuda |
| Pagamento | `1–5` | Pix, Crédito, Débito, Dinheiro, Vale-refeição |
| Pagamento | `Enter` | Lançar pagamento |
| Pagamento | `Ctrl+Enter` | Concluir venda (se saldo zero) |
| Venda | `Enter` (na busca, 1 resultado) | Adicionar item |
| Venda | `+` / `−` (linha em foco) | Alterar quantidade |
Atalhos desabilitados aparecem com rótulo "indisponível nesta versão". **CA:** CA-C17-1: nenhum atalho dispara com foco em `input` de texto, exceto `F`-keys e `Esc`. **testid:** `modal-atalhos`.
