# Modo Gestão e BI (M01–M15) — Desktop 1440×900

**Perfil:** `gerente`. **Shell:** `SideNav` 248 px (Visão geral · Cardápio · Estoque · Vendas · Equipe · Fiscal) + `TopBar` 80 px (título da seção, busca contextual, pill de sincronização X03, operador ativo) + conteúdo rolável. Largura de referência 1440×900 (mínimo 1024 px; abaixo disso tabelas viram cards e filtros recolhem).
**Princípios de Gestão:** visão rápida para tomada de decisão no turno; integridade fiscal e contábil; **nunca apagar fisicamente produtos ou colaboradores** (regra institucional RN04/RN08: inativação lógica `ativo=false`); resiliência de relatórios (se o serviço analítico estiver instável, a operação do PDV e caixa continua sem bloqueios).
**Padrões herdados:** estados X07, status X03, toasts X04, confirmações X05, tema X09, componentes `04-componentes.md`.

---

## M01 — Visão geral (Dashboard Executivo)

**Rota:** `/gestao` · **UC08, RF30, RF31, RF33, RN21** · **Poll:** 30 s (ou atualização sob demanda).

**Layout (1440×900):**
```
┌──────┬───────────────────────────────────────────────────────────────────────┐
│[V]PDV│ Visão geral                   [● Sincronizado] [Período: Hoje ▾] [Gerente]│
├──────┼───────────────────────────────────────────────────────────────────────┤
│Visão │ ┌──────────────┐┌──────────────┐┌──────────────┐┌───────────────────┐ │
│Cardáp│ │Faturamento   ││Pedidos       ││Ticket médio  ││Tempo preparo(KDS) │ │
│Estoqu│ │R$ 4.829,50   ││142           ││R$ 34,01      ││14 min             │ │
│Vendas│ │+12% vs ontem ││+8% vs ontem  ││-2% vs ontem  ││-3 min vs ontem    │ │
│Equipe│ └──────────────┘└──────────────┘└──────────────┘└───────────────────┘ │
│Fiscal│ ┌───────────────────────────────────────┐┌──────────────────────────┐│
│      │ │ Vendas por hora                       ││ Meios de pagamento       ││
│      │ │ [BarChart: barras mostarda, pico 20h] ││ [HBarList: Pix, Cartão..]││
│      │ └───────────────────────────────────────┘└──────────────────────────┘│
│      │ ┌───────────────────────────────────────┐┌──────────────────────────┐│
│      │ │ Mais vendidos (Top 5)                 ││ Precisa de atenção       ││
│      │ │ [RankTable: Produto, Qtd, Receita]    ││ [AlertItem: Rupturas...] ││
│      │ └───────────────────────────────────────┘└──────────────────────────┘│
└──────┴───────────────────────────────────────────────────────────────────────┘
```

**Cabeçalho e Filtro:** seletor de período em `SegmentedControl`: `Hoje` (padrão) · `7 dias` · `30 dias` · `Personalizado` (abre modal de datas).
**Região 1 — 4 KPIs Executivos (`KpiCard` 04 §3.11):**
1. **Faturamento bruto:** soma de comandas pagas no período (`Dinheiro`), com variação percentual vs. período anterior.
2. **Total de pedidos:** contagem de comandas concluídas.
3. **Ticket médio:** faturamento dividido pelo número de comandas (`Dinheiro`).
4. **Tempo médio de atendimento/KDS:** tempo médio desde abertura/lançamento até entrega na mesa.

**Região 2 — Gráficos Centrais (2 colunas):**
- **Vendas por hora (`BarChart` 04 §3.12):** SVG acessível com colunas em mostarda (`--color-chart-bar`), contorno 1,5 px (`--color-chart-bar-stroke`), rótulo do valor acima da barra e hora abaixo. Barra de pico com destaque (`border 2px text` + legenda "Pico às 20h · 36 pedidos"). Sem projeções de horas futuras.
- **Meios de pagamento (`HBarList` 04 §3.12):** distribuição percentual e em valor: Pix, Cartão de Crédito, Cartão de Débito, Dinheiro, Vale-refeição. Trilho em `surface-2` com barra em mostarda e rótulo percentual à direita.

**Região 3 — Operação e Alertas (2 colunas):**
- **Mais vendidos (`RankTable` 04 §3.13):** tabela compacta com os 5 produtos com maior volume/receita no período (Posição, Nome, Categoria, Qtd Vendida, Receita Gerada).
- **Precisa de atenção (`AlertItem` 04 §3.14):** lista de cartões de aviso urgente:
  - Itens esgotados no salão (`danger-soft`, ícone `circle-alert`, link rápido para Repor).
  - Itens com estoque abaixo do mínimo (`brand-soft`, ícone `triangle-alert`).
  - Mesas com permanência excedida (> 2 horas sem lançamentos).

**Dados:** `GET /analytics/faturamento`, `GET /analytics/produtos/curva-abc`, `GET /analytics/estoque/alertas`. No Módulo 1 (Core monolítico), métricas consolidadas pelo backend Fastify sobre os registros de comandas e produtos.
**Estados:** carregando (skeletons de 4 KPIs e blocos gráficos) · erro de analytics (ErrorState inline em cada card com "Tentar de novo", permitindo que o restante do dashboard funcione se um endpoint falhar) · vazio (dia sem vendas: "Nenhuma venda registrada neste período.").
**A11y:** KPIs em `role="region"` com nomes acessíveis; gráficos com tabela `sr-only` equivalente; `h1` "Visão geral".
**CA:**
- CA-M01-1: alternar período recarrega os dados analíticos sem travar a navegação.
- CA-M01-2: falha na rota analítica não derruba o shell do gerente; exibe `ErrorState` no bloco específico.
**testid:** `kpi-faturamento`, `kpi-pedidos`, `kpi-ticket-medio`, `kpi-tempo-kds`, `grafico-vendas-hora`, `lista-meios-pagamento`, `tabela-mais-vendidos`, `bloco-alertas`.

---

## M02 — Cardápio (produtos)

**Rota:** `/gestao/cardapio` · **UC07, RF01, RF11, RN04** · **Leitura:** `GET /produtos`.

**Layout:**
- **Cabeçalho:** `h1` "Cardápio" (24/800) + subtítulo "{N} produtos cadastrados" · busca rápida por nome (SearchInput) · botão primário `lg` **"+ Novo produto"** (abre M03 em modo criação).
- **Filtros rápidos (chips):** `Todos` · `Lanches` · `Porções` · `Bebidas` · `Sobremesas` · `Combos` · `Inativos` (mostra apenas produtos com `ativo=false`).
- **Tabela de produtos (`DataTable` 04 §2.8):**
  - Colunas: **Produto** (tile tintado 40×40 + nome 15/700 + categoria) · **Preço** (15/800, alinhado à direita) · **Estoque atual** (número + badge `Esgotado` se 0 ou `Estoque baixo` se $\le$ mínimo) · **Status** (`StatusPill`: Ativo verde / Inativo cinza) · **Ações** (IconButton `pencil` para editar M03; IconButton `ellipsis` para menu: Inativar/Reativar M04).
- **Ordenação:** padrão por nome asc; permite ordenar por preço e estoque.

**Estados:** carregando (8 linhas skeleton) · vazio ("Nenhum produto cadastrado. Toque em Novo produto.") · filtro vazio (X07).
**CA:**
- CA-M02-1: produtos com `ativo=false` só aparecem quando o chip "Inativos" ou filtro equivalente está acionado.
- CA-M02-2: busca filtra em tempo real sem latência perceptível.
**testid:** `tabela-cardapio`, `busca-cardapio`, `btn-novo-produto`, `produto-linha-<id>`.

---

## M03 — Produto (criar / editar)

**Tipo:** Drawer 480 px (desktop) / Sheet (mobile).
**Gatilho:** Botão "+ Novo produto" (`?produto=novo`) ou editar linha da tabela (`?produto=<id>`).
**Objetivo:** cadastrar ou atualizar item de venda mantendo integridade com as regras de estoque e categorias.

**Conteúdo do Formulário:**
1. **Cabeçalho:** "Novo produto" ou "Editar produto #{id}" · botão Fechar.
2. **Nome do produto:** Field texto obrigatório (ex.: "Hambúrguer artesanal", 3–80 caracteres).
3. **Categoria:** Select nativo estilizado: `Lanches`, `Porções`, `Bebidas`, `Sobremesas`, `Combos` ou texto livre.
4. **Preço de venda (R$):** `MoneyInput` com máscara pt-BR e preenchimento em centavos. Obrigatório, valor > 0,00. Nunca float.
5. **Estoque atual:** Field numérico inteiro ($\ge 0$). Na criação, define o saldo inicial; na edição, campo desabilitado com aviso "Para ajustar saldo, use o módulo de Estoque" para manter auditoria de movimentos.
6. **Estoque mínimo:** Field numérico inteiro ($\ge 0$, padrão 5). Dispara alerta quando o saldo atinge ou fica abaixo deste valor.
7. **Rodapé com Ações:** Botão secundário "Cancelar" · Botão primário `lg` **"Salvar produto"**.

**Interações e Regras:**
- Envio: Criação ⇒ `POST /produtos {nome, categoria, preco: "12.50", estoque, estoque_minimo}`. Edição ⇒ `PATCH /produtos/:id {nome, categoria, preco, estoque_minimo}`.
- Formulário sujo: tentar fechar pelo scrim ou Esc abre diálogo X05 `descartar-alteracoes`.
- Sucesso: toast "Produto salvo com sucesso.", fecha drawer e invalida queries do cardápio e salão.
**CA:**
- CA-M03-1: preço formatado como string com 2 casas decimais no payload HTTP.
- CA-M03-2: campo nome vazio impede submissão com erro inline "Informe o nome do produto."
**testid:** `drawer-produto`, `campo-nome-produto`, `campo-preco-produto`, `campo-categoria-produto`, `btn-salvar-produto`.

---

## M04 — Inativar / Reativar produto

**Tipo:** ConfirmDialog (X05 `inativar-produto`).
**Gatilho:** Menu de ações do produto no Cardápio (M02).
**Regra Crucial (RN04, AGENTS.md):** **PROIBIDA A EXCLUSÃO FÍSICA (`DELETE`) DE PRODUTOS**. Produtos são inativados (`ativo=false`), preservando integridade referencial com comandas já fechadas e histórico financeiro.

**Conteúdo do Diálogo:**
- **Inativação:** Título "Inativar {nome do produto}?"; corpo: "Ele sairá do cardápio do garçom e do caixa imediatamente. As vendas já registradas no histórico não serão afetadas."; Botão seguro "Voltar" (foco inicial) · Botão destrutivo **"Inativar produto"** (`destructive-solid`).
- **Reativação:** Diálogo simples: "Reativar {nome do produto}?"; corpo: "O item voltará a ficar visível para lançamento."; Botões: "Voltar" · "Reativar produto" (primário).

**Fluxo:**
- Inativar: `POST /produtos/:id/inativar` (ou `PATCH /produtos/:id {ativo: false}`).
- Reativar: `PATCH /produtos/:id {ativo: true}`.
- Sucesso: toast "Produto inativado com sucesso." / "Produto reativado.", atualiza tabela.
**CA:**
- CA-M04-1: nenhuma chamada `DELETE /produtos/:id` é disparada pelo frontend.
- CA-M04-2: produto inativado desaparece imediatamente do salão do garçom no próximo poll.
**testid:** `dialog-inativar-produto`, `btn-confirmar-inativar-produto`.

---

## M05 — Estoque (Saldos · Alertas · Movimentos)

**Rota:** `/gestao/estoque` · **UC07, RF12, RF33** · **Poll:** 30 s.

**Estrutura de 3 Abas (`tablist`):**
1. **Aba 1 — Saldos gerais (`?aba=saldos`):**
   - Tabela com todos os produtos ativos, categoria, estoque atual, estoque mínimo, status de estoque (`Normal` verde, `Baixo` mostarda, `Esgotado` tomate).
   - Botão rápido de linha: **"Repor estoque"** (abre M06 com o produto selecionado).
2. **Aba 2 — Alertas de ruptura (`?aba=alertas`):**
   - Lista filtrada apenas com produtos onde `estoque <= estoque_minimo`.
   - Card de aviso no topo com total de itens críticos.
   - Indicador visual com barra de nível de estoque relativo ao mínimo.
3. **Aba 3 — Histórico de movimentos (`?aba=movimentos`):**
   - Tabela de auditoria: Data/Hora, Produto, Tipo (Entrada/Reposição, Saída por Venda, Ajuste Manual), Quantidade movimentada (`+10`, `-2`), Comanda vinculada (se venda), Responsável.

**Estados:** padrão X07; alerta vazio: "Nenhum item com estoque crítico no momento."
**CA:**
- CA-M05-1: produtos esgotados (saldo 0) aparecem no topo da aba de alertas com destaque `danger`.
- CA-M05-2: navegação entre abas preserva filtros na URL.
**testid:** `estoque-tabs`, `tab-saldos`, `tab-alertas`, `tab-movimentos`, `btn-repor-<id>`.

---

## M06 — Repor / ajustar estoque

**Tipo:** Modal `sm` (480 px).
**Gatilho:** Botão "Repor estoque" na linha da tabela de Estoque (M05) ou card de alerta.
**Objetivo:** dar entrada em mercadoria ou ajustar contagem física com prevenção de concorrência.

**Conteúdo:**
1. Título "Repor estoque: {Nome do Produto}".
2. Identificação: "Saldo atual registrado: **{n} unidades**".
3. **Tipo de operação (SegmentedControl):**
   - `Entrada (+)` (padrão): adiciona quantidade ao saldo existente.
   - `Balanço / Ajuste direto (=)`: substitui o saldo por contagem física.
4. **Quantidade a movimentar:** Field numérico inteiro com Stepper e teclas rápidas (`+5`, `+10`, `+20`, `+50`).
5. **Prévia do novo saldo:** texto em destaque "Novo estoque final: **{novoSaldo} unidades**".
6. **Motivo do ajuste (opcional):** Field texto (ex.: "Nota fiscal 1042", "Contagem de fechamento").
7. **Botões:** Secundário "Cancelar" · Primário **"Confirmar reposição"**.

**Prevenção de Concorrência (03 §3):**
Ao submeter a reposição, o frontend lê o saldo atualizado via `GET /produtos/:id`. Se o saldo no servidor diferir do exibido na abertura do modal (ex.: houve baixa por venda simultânea), exibe aviso em mostarda: *"O estoque mudou de {antigo} para {atual} enquanto você editava. Revise o valor final."* e exige confirmação adicional antes de aplicar o `PATCH /produtos/:id {estoque}`.
**CA:**
- CA-M06-1: reposição positiva soma unidades ao saldo com feedback imediato.
- CA-M06-2: concorrência de estoque dispara o aviso sem aplicar sobrescrita cega.
**testid:** `modal-repor-estoque`, `campo-qtd-repor`, `btn-confirmar-repor`.

---

## M07 — Vendas — Comandas

**Rota:** `/gestao/vendas?aba=comandas` · **UC08, RF09, RF10**.
**Objetivo:** consulta e auditoria do histórico geral de comandas do estabelecimento.

**Filtros de Pesquisa:**
- Período: Data Inicial e Data Final (`de` e `ate`, padrão: hoje).
- Status: Chips multi-seleção (`Todas`, `Abertas`, `Aguardando pagamento`, `Pagas`, `Canceladas`).
- Mesa / Local: Busca rápida por número de mesa ou balcão.
- Colaborador: Select de garçons cadastrados.

**Tabela de Comandas (`DataTable` 04 §2.8):**
- Colunas: **Nº Pedido** (4 dígitos) · **Mesa/Local** · **Garçom** · **Abertura** (HH:MM) · **Fechamento/Pagamento** · **Status** (`StatusPill`) · **Forma Pagto** (ícone + texto) · **Total** (15/800, alinhado à direita).
- Linha clicável: abre o Drawer de Detalhe da Comanda na Gestão (M08).
- Paginação: 25 / 50 itens por página com totalizadores no rodapé.
**CA:**
- CA-M07-1: aplicar filtros refaz a busca com querystring na URL.
- CA-M07-2: exportação respeita exatamente os filtros selecionados.
**testid:** `tabela-vendas-comandas`, `filtro-periodo-de`, `filtro-periodo-ate`.

---

## M08 — Detalhe da comanda (gestão)

**Tipo:** Drawer 560 px (desktop).
**Gatilho:** Clique em qualquer comanda da tabela M07 (`?comanda=<id>`).
**Objetivo:** visualização pericial e completa de um consumo para suporte, conferência ou cancelamento administrativo.

**Conteúdo Estruturado:**
1. **Cabeçalho:** "Pedido {nº}" · Local ("Mesa 4" ou "Balcão 12") · StatusPill · Botão fechar.
2. **Metadados do Turno:** Garçom responsável, horário de abertura, horário de fechamento e quitação, tempo total de permanência.
3. **Lista de Itens Lançados:**
   - Tabela detalhada: Quantidade × Nome do Produto (com observações e alergias), Preço unitário registrado, Subtotal da linha, Horário de lançamento e status de entrega no KDS.
4. **Resumo Financeiro Auditado:**
   - Subtotal dos itens: `R$ X,XX`.
   - Taxa de serviço (10%): `R$ X,XX` (indica se foi aceita ou recusada).
   - Total final: `R$ X,XX`.
   - Meio de quitação: forma de pagamento, identificação do cliente (se fidelidade vinculada), comprovante de pagamento.
5. **Ações Administrativas:**
   - "Ver comprovante / Imprimir via" (abre visualizador do recibo).
   - "Cancelar pedido" (apenas se comanda ainda estiver aberta ou fechada sem quitação; exige diálogo X05 `cancelar-comanda`).
**CA:**
- CA-M08-1: comanda paga exibe todos os valores consolidados sem o rótulo "Estimado".
- CA-M08-2: observações e alergias aparecem associadas a cada linha do pedido.
**testid:** `drawer-detalhe-comanda-gestao`, `btn-imprimir-detalhe`.

---

## M09 — Vendas — Faturamento

**Rota:** `/gestao/vendas?aba=faturamento` · **UC08, RF30, RF31, RN21**.
**Objetivo:** análise profunda da receita bruta e líquida do estabelecimento.

**Métricas e Gráficos:**
- **Seletor de Agrupamento:** `Por Dia` · `Por Mês` · `Por Hora do Dia` (para descobrir os horários de maior receita).
- **Cards Comparativos:** Faturamento Líquido, Taxa de Serviço Acumulada (Gorjetas dos garçons), Total de Descontos/Cancelamentos.
- **Gráfico de Evolução:** BarChart temporal com comparativo de ticket médio.
- **Tabela de Fechamento por Período:** Tabela sintética consolidada com colunas Data, Qtd Comandas, Subtotal, Taxa de Serviço, Total Bruto.
- **Exportação:** Botão "Exportar Relatório CSV" (dispara M15).
**CA:**
- CA-M09-1: percentuais exibidos vêm formatados do serviço analítico, sem recálculo com float no cliente.
**testid:** `painel-faturamento`, `grafico-evolucao-faturamento`.

---

## M10 — Vendas — Curva ABC

**Rota:** `/gestao/vendas?aba=curva-abc` · **UC08, RF32, RN21**.
**Objetivo:** identificar os itens vitais do cardápio através do princípio de Pareto (80/20).

**Visualização:**
- **Pills de Classificação:**
  - **Classe A (80% da receita):** itens vitais, margem e volume prioritários (badge verde).
  - **Classe B (15% da receita):** itens intermediários (badge mostarda).
  - **Classe C (5% da receita):** itens de cauda longa, baixa saída ou margem insignificante (badge cinza).
- **Tabela da Curva ABC:**
  - Colunas: Posição, Produto, Categoria, Quantidade Vendida, Receita Total (R$), Participação na Receita (%), Participação Acumulada (%), Classe (A/B/C).
- **Filtro por Categoria:** permite analisar a curva ABC isolada para Bebidas, Lanches ou Sobremesas.
**CA:**
- CA-M10-1: tabela ordenada decrescentemente por receita com acumulação até 100%.
**testid:** `tabela-curva-abc`, `filtro-categoria-abc`.

---

## M11 — Vendas — Desempenho de garçons

**Rota:** `/gestao/vendas?aba=garcons` · **UC08, RF30, RN21**.
**Objetivo:** acompanhar produtividade da equipe de salão e apuração de taxas de serviço.

**Estrutura:**
- **Tabela de Desempenho:**
  - Colunas: **Colaborador** (Avatar + Nome) · **Mesas atendidas** · **Comandas abertas** · **Volume total vendido (R$)** · **Taxa de serviço acumulada (R$)** · **Ticket médio por mesa (R$)**.
- **Regra de Transparência:** cálculo da taxa de serviço considera estritamente as comandas pagas em que a taxa de 10% foi aceita e mantida pelo cliente.
- **Exportação:** permite exportar a folha de taxas para conferência e repasse.
**CA:**
- CA-M11-1: taxa de serviço total bate exatamente com a soma das taxas registradas no banco.
**testid:** `tabela-desempenho-garcons`, `btn-exportar-garcons`.

---

## M12 — Equipe

**Rota:** `/gestao/equipe` · **UC07, RF02, RF17, RN08** · **Leitura:** `GET /usuarios`.

**Layout:**
- **Cabeçalho:** `h1` "Equipe" · subtítulo "{N} colaboradores ativos" · botão primário `lg` **"+ Novo colaborador"** (abre M13).
- **Filtros por Perfil (chips):** `Todos` · `Garçons` · `Caixa` · `Cozinha e bar` · `Gerência` · `Inativos`.
- **Tabela de Colaboradores (`DataTable`):**
  - Colunas: **Colaborador** (Avatar 44 + Nome) · **Perfil** (`StatusPill`: Garçom, Caixa, Cozinha, Gerente) · **Status** (Ativo verde / Inativo cinza) · **Cadastrado em** (DD/MM/AAAA) · **Ações** (Editar M13 / Inativar M13).
**CA:**
- CA-M12-1: colaboradores inativos não aparecem na tela de login operacional X01.
**testid:** `tabela-equipe`, `btn-novo-colaborador`, `usuario-linha-<id>`.

---

## M13 — Usuário (criar / editar / inativar)

**Tipo:** Drawer 480 px (criar/editar) + ConfirmDialog (inativar).
**Gatilho:** "+ Novo colaborador" (`?usuario=novo`), editar linha (`?usuario=<id>`) ou menu da linha.
**Regra Institucional (RN08, AGENTS.md):** **NUNCA DELETAR USUÁRIOS FISICAMENTE**. Apenas inativar (`ativo=false`), pois comandas e pagamentos possuem chave estrangeira vinculada ao colaborador.

**Formulário (Drawer):**
1. Título "Novo colaborador" ou "Editar colaborador".
2. **Nome completo:** Field obrigatório (3–60 caracteres, ex.: "Lucas Silveira").
3. **Perfil de acesso:** RadioGroup em cartões visíveis:
   - `garcom`: acesso ao salão PWA, abertura de mesa e pedidos.
   - `caixa`: acesso ao PDV balcão, fechamento de conta e pagamento.
   - `cozinha`: acesso ao display KDS com tema escuro nativo.
   - `gerente`: acesso irrestrito ao painel de gestão, cadastros e relatórios.
4. **Sem senha na v1:** nota explicativa visível "No Módulo 1 o login operacional é realizado por seleção de operador."
5. **Botão Salvar:** envia `POST /usuarios {nome, perfil}` ou `PATCH /usuarios/:id {nome, perfil}`.

**Inativação (ConfirmDialog X05 `inativar-usuario`):**
- Título: "Inativar {nome}?".
- Corpo: "A pessoa deixará de aparecer na tela de login operacional. O histórico de atendimentos e comandas já realizados será totalmente preservado."
- Botões: "Voltar" (foco inicial) · **"Inativar usuário"** (`destructive-solid`).
- Envia: `POST /usuarios/:id/inativar` (ou `PATCH /usuarios/:id {ativo: false}`).
**CA:**
- CA-M13-1: colaborador inativado desaparece imediatamente da grade de login X01.
- CA-M13-2: nenhuma chamada `DELETE /usuarios/:id` é disparada.
**testid:** `drawer-usuario`, `campo-nome-usuario`, `perfil-radio-<slug>`, `dialog-inativar-usuario`.

---

## M14 — Fiscal (*placeholder* honesto)

**Rota:** `/gestao/fiscal` · **Escopo v1 (§14 do DESIGN.md)**.
**Objetivo:** apresentar postura profissional e transparente sobre o escopo fiscal do sistema acadêmico/comercial.

**Conteúdo da Tela:**
- `h1` "Módulo Fiscal (NFC-e / SAT)".
- Card central de aviso em `surface` (largura máx. 640 px):
  - Ícone `file-text` 48 px em `text-2`.
  - Título 20/800: "Emissão de documentos fiscais indisponível nesta versão".
  - Mensagem explicativa clara: *"O VaptPDV opera nesta versão com comprovantes não fiscais de conferência e consumo (atendendo ao escopo do projeto de Sistemas Distribuídos). A integração com webservices da SEFAZ, contingência offline e certificados digitais A1 está planejada para versões futuras."*
  - Botão secundário "Voltar à Visão geral" (`/gestao`).
**CA:**
- CA-M14-1: a tela não promete emissão funcional nem oculta o módulo sem explicação.
**testid:** `tela-fiscal-placeholder`.

---

## M15 — Exportar dados

**Tipo:** Modal `sm` (480 px).
**Gatilho:** Botão "Exportar" em M01, M07, M09, M11.
**Objetivo:** exportar tabelas analíticas para arquivos CSV formatados em UTF-8 com separador padrão brasileiro (ponto e vírgula).

**Conteúdo do Modal:**
1. Título "Exportar dados".
2. Resumo: "{tipo do relatório} · {período selecionado}".
3. **Formato:** Chip fixo `CSV (.csv)` selecionado (Excel / LibreOffice).
4. **Opções:** Checkbox "Incluir detalhes dos itens" (quando aplicável).
5. Botões: "Cancelar" · **"Baixar arquivo CSV"** (primário).

**Implementação (`lib/csv.ts`):** geração no próprio navegador (client-side Blob) a partir dos dados já carregados no TanStack Query, com prefixo BOM `\uFEFF` para garantir acentuação correta no Microsoft Excel.
**CA:**
- CA-M15-1: download inicia imediatamente com nome `vaptpdv-{relatorio}-{data}.csv`.
- CA-M15-2: caracteres acentuados abrem legíveis no Excel sem corrupção de encoding.
**testid:** `modal-exportar`, `btn-baixar-csv`.