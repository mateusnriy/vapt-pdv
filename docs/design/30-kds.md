# Modo KDS (K01–K07) — TV/monitor 1920×1080, pouco ou nenhum toque

**Perfis:** `cozinha`, `gerente`. **Rota:** `/kds`. **Serviço:** `kds-service` `:3001` (RF19–RF23, RN18, RN20, RN22). **Tema padrão: escuro** (`data-theme="dark"` e `data-surface="kds"`; `--focus-width: 4px` neste módulo para leitura à distância).
**Referência visual:** `referencias/KDS_-_Cozinha_2x.png` (ver deltas de escopo em `DESIGN.md §14`). Tipografia: tokens `--fs-kds-*` (DESIGN §3). **Poll:** 2 s (`GET /kds/fila`). Nada de navegação: uma tela só.
**Princípios:** leitura a 2–3 m; o item mais antigo sempre no topo; alerta por **texto + cor**; botão grande (72 px) para toque, e **tudo também por teclado** (K05).

---

## K01 — Painel de cozinha e bar

**Layout (1920×1080):**
```
┌────────────────────────────────────────────────────────────────────────────┐ 88 px
│ [V] Cozinha   [Todas][Cozinha][Bar]      ● Online   [⚙ Ajustes]     19:48  │
├────────────────────────────────────────────────────────────────────────────┤
│ margem 48 │ Novos ②        │ gap 32 │ Em preparo ③     │ gap 32 │ Prontos ② │ 48
│           │ ┌──────────────┐│        │ ┌──────────────┐ │        │ ┌────────┐│
│           │ │▌Mesa 6 Pedido 0481   01:12 ││ ...        │ │        │ │...     ││
│           │ │ 2× Cheeseburger duplo      │              │
│           │ │    Sem picles              │              │
│           │ │ [   Iniciar preparo   ] 72 │              │
│           │ └──────────────┘│        │                  │        │          │
└────────────────────────────────────────────────────────────────────────────┘
```
**Cabeçalho:** logo "V" 56 `brand`; título dinâmico "Cozinha" (padrão), "Bar" ou "Cozinha e bar" conforme o filtro; **chips de setor** `Todas · Cozinha · Bar` (H 56; ativo `brand`; teclas `1/2/3`) — *Chapa/Fritadeira/Montagem do mockup ficam fora da v1 (Q-08)*; pill X03 "● Online" (variações: "Sem atualização há {s} s" `brand`; "Sem conexão" `danger`); botão Ajustes (IconButton 56, `settings`, `aria-label="Ajustes do KDS"`, tecla `,`); **relógio** 44/800 `HH:MM` (atualiza a cada 10 s; `aria-hidden`, não é região viva).
**Colunas (3, larguras iguais):** `Novos` (fichas `recebido`) → `Em preparo` (`em_preparo`) → `Prontos` (`pronto`). Cabeçalho da coluna: nome 30/800 + contador em pill circular. `entregue` e `cancelado` não aparecem (cancelado: ver K02). Rolagem vertical interna sem barra visível; **o mais antigo no topo** (ordenar por cronômetro desc).
**Capacidade e excesso:** cabem ~4 tickets por coluna. Com ≥ 5, ativar **escala compacta** (`--kds-scale: .85` em fontes e paddings, mínimo 22 px para itens) e exibir, fixado na base da coluna, o botão-chip **"+N abaixo"** (ao ativar: rola até o próximo ticket). Auto-rolagem **desligada** por padrão (opção em K03).
**Agrupamento (P-09):** fichas do mesmo `comanda_id` e mesmo status formam **um ticket**. Se a mesma comanda tem fichas em estados diferentes, aparece **um ticket por coluna**, cada um apenas com as fichas daquele estado. Filtro de setor restringe as fichas exibidas (e as ações afetam só as visíveis).
**Dados:** `GET /kds/fila?setor=` (sem setor = ambos) com `status in (recebido, em_preparo, pronto)`; ordem FIFO do servidor (RF21), reordenada por cronômetro por coluna.
**Atualização:** *polling* 2 s com `ETag`/`If-None-Match` quando disponível; diff por `id` para não remontar tickets (evita perda de foco); novos tickets disparam K06.

**Estados:** carregando (3 colunas × 2 skeletons de ticket) · vazio por coluna (copy em X07) · todo vazio ⇒ texto central discreto "Sem pedidos no momento." · **sem atualização** (falha de *poll* > 6 s ⇒ pill brand; > 20 s ⇒ pill danger + banner "Sem conexão. Os pedidos podem estar desatualizados." e botões `disabledReason: "Sem conexão"`) · erro de ação (toast `alert` + ticket volta ao estado anterior).
**A11y:** cada coluna é `section` com `aria-labelledby`; ticket é `article` com `aria-label="Mesa 6, pedido 0481, 2 itens, 01:12"`; novo ticket anunciado em `aria-live="polite"` ("Novo pedido: Mesa 6, 3 itens"); cronômetros: sem anúncio por segundo (só mudança de faixa).
**CA:**
- CA-K01-1: item lançado no Garçom aparece em Novos em ≤ 2 s (OBJ-05) sem recarregar a tela.
- CA-K01-2: tickets em cada coluna ficam ordenados do mais antigo para o mais novo.
- CA-K01-3: filtro "Bar" não exibe itens da cozinha e vice-versa (RN22 pela `categoria` da ficha).
- CA-K01-4: com 5+ tickets na coluna a escala compacta é aplicada e o chip "+N abaixo" aparece.
- CA-K01-5: a 1280×720 nenhuma função se perde (3 colunas permanecem; fontes escalam com `clamp`).
**testid:** `kds-header`, `kds-filtro-<todas|cozinha|bar>`, `kds-coluna-<novos|preparo|prontos>`, `kds-ticket-<comandaId>-<coluna>`, `kds-mais-abaixo-<coluna>`.

---

## K02 — Ticket (componente `KdsTicket`)

**Anatomia (largura = coluna ≈ 560 px; R `card-lg`; fundo `surface`; borda 1 px `border`; P 24; gap interno 16):**
1. **Borda esquerda 10 px** (`success` | `brand` | `danger`) conforme faixa de SLA.
2. **Linha de cabeçalho:** à esquerda **identificador do local** (36/800: "Mesa 6", "Balcão 27", "Retirada 12") + `Pedido 0481` (22/700 `text-2`); em Prontos, abaixo, `Lucas` (20/600 `text-2`, o garçom a retirar). À direita `TimerPill`.
3. **Itens** (um por ficha, ordem de chegada): `2×` (32/800, coluna fixa 72 px) · nome (30/700) · **observação** abaixo do nome (22/700 `brand-text`) · **alergia** em bloco próprio: R `control`, fundo `danger-soft`, ícone `shield-alert` + "Alergia: sem glúten" (24/800 `danger-text`) — **sempre acima da observação normal e do próximo item**, nunca truncado.
4. **Botão do ticket** (72 px, largura total, R `btn-lg`, 26/800):

| Coluna | Rótulo | Variante | Efeito |
|---|---|---|---|
| Novos | Iniciar preparo | `primary` | `PATCH status=em_preparo` em cada ficha visível (imediato) |
| Em preparo | Marcar como pronto | `primary` | `PATCH status=pronto` (janela Desfazer) |
| Prontos | Marcar como entregue | `success-outline` | `PATCH status=entregue` (janela Desfazer) |

**Faixas de SLA** (limites de K03; padrão env):

| Coluna | Cronômetro conta desde | Dentro (verde) | Atenção (mostarda) | Atrasado (tomate) |
|---|---|---|---|---|
| Novos | `criado_em` | < 10 min | 10–14:59 | ≥ 15 min |
| Em preparo | `criado_em` (SLA total de cozinha) | < 10 min | 10–14:59 | ≥ 15 min |
| Prontos | `pronto_em` (espera de retirada) | < 3 min | 3–5:59 | ≥ 6 min |
Pill: `mm:ss` (verde), `mm:ss · Atenção`, `mm:ss · Atrasado`; acima de 59:59 ⇒ `1h02`. Cronômetro do ticket = o do item **mais antigo**. (Corrige o mockup: Prontos conta espera de retirada.)

**Ticket cancelado (RF23):** se todas as fichas passam a `cancelado` ⇒ ticket permanece 15 s com faixa `danger-soft` "Pedido cancelado" no topo, itens riscados e botão "Dispensar" (72); se só parte cancelou, o item aparece riscado com pill "Cancelado" e sai no próximo ciclo. O garçom não é notificado por este caminho.
**Pendente de desfazer:** ver K07.
**Foco:** ticket com foco recebe anel 4 px `focus` + `outline-offset: 4px` em volta do **card**; o botão interno é o alvo do `Enter`.
**CA:** CA-K02-1: item com `alergia=true` exibe bloco de alergia com texto, ícone e cor (3 sinais); CA-K02-2: faixa SLA muda sem recarregar ao cruzar 10:00 e 15:00; CA-K02-3: tickets ≥ 15 min têm borda esquerda `danger` **e** o texto "Atrasado"; CA-K02-4: rótulo do botão nunca quebra linha.
**testid:** `kds-item-<fichaId>`, `kds-alergia-<fichaId>`, `kds-btn-<iniciar|pronto|entregue>-<comandaId>`, `kds-timer-<comandaId>`.

---

## K03 — Ajustes do KDS

**Tipo:** Drawer 560 px, tipografia ampliada (corpo 20 px; alvos 56 px). **Gatilho:** botão Ajustes ou `,`. Preferências **locais ao dispositivo** (`useUiStore.kds`); nota no rodapé "Valem só para esta tela."
**Campos:**
| Campo | Controle | Padrão | Limites |
|---|---|---|---|
| Setor padrão ao abrir | SegmentedControl Todas/Cozinha/Bar | Todas | — |
| Alerta de atenção (min) | Stepper | 10 | 1–59 |
| Alerta de atraso (min) | Stepper | 15 | > atenção |
| Retirada: atenção (min) | Stepper | 3 | 1–30 |
| Retirada: atraso (min) | Stepper | 6 | > atenção |
| Tempo para desfazer (s) | Stepper | 5 | 0–10 (0 = sem janela) |
| Som ao chegar pedido novo | Switch | desligado | — |
| Tamanho do texto | SegmentedControl Padrão/Grande (×1,15) | Padrão | — |
| Rolagem automática das colunas | Switch | desligado | rola 1 ticket a cada 8 s quando há excesso |
| Tema | X09 | Escuro | — |
| Tela cheia | Botão "Entrar em tela cheia" (Fullscreen API) | — | — |
| Operador | "Trocar operador" (X02) | — | — |
Validação: atraso > atenção (erro inline "O atraso precisa ser maior que a atenção."). Botão "Restaurar padrões" (secundário). Alterações aplicam na hora (sem "Salvar").
**CA:** CA-K03-1: alterar atraso para 12 min faz um ticket de 12:30 virar "Atrasado" imediatamente; CA-K03-2: som só toca após o usuário ligar o switch (gesto que libera áudio).
**testid:** `drawer-ajustes-kds`, `kds-ajuste-<campo>`.

---

## K04 — Estados do KDS

| Estado | Apresentação |
|---|---|
| Carregando inicial | 3 colunas com 2 skeletons de ticket cada; cabeçalho completo |
| Coluna vazia | Ícone `chef-hat`/`check` 40 + texto (X07), `text-2` |
| Painel vazio | texto central "Sem pedidos no momento." sobre as 3 colunas vazias |
| `kds-service` lento (> 6 s sem resposta) | pill "Sem atualização há {s} s" (brand); dados continuam visíveis |
| `kds-service` fora (> 20 s) | pill "Sem conexão" (danger) + banner (X03) + botões desabilitados "Sem conexão"; cronômetros **continuam** contando localmente |
| Erro de ação | toast `alert` "Não foi possível atualizar o pedido da Mesa 3. Tente de novo." + ticket volta |
| `409 TRANSICAO_KDS_INVALIDA` | refetch silencioso; sem toast se o estado já era o desejado |
| Sem permissão | X06-b |
| Reconectou | banner verde 4 s; refetch imediato |

---

## K05 — Navegação por teclado e bump bar

Modelo *roving tabindex*: um ticket focado por vez; foco inicial = ticket mais antigo da coluna "Novos" (ou 1ª coluna com tickets).

| Tecla | Efeito |
|---|---|
| `←` `→` (ou `4` `6` do teclado numérico) | muda de coluna (mantém linha aproximada) |
| `↑` `↓` (ou `8` `2`) | ticket anterior/seguinte na coluna |
| `Enter` / `Espaço` (ou `5` / `Enter` numérico) | aciona o botão do ticket focado |
| `Esc` | Desfazer da ação pendente mais recente |
| `1` `2` `3` | filtro Todas / Cozinha / Bar |
| `,` | abre Ajustes |
| `Tab` | percorre cabeçalho → colunas → Ajustes (ordem visual) |
Teclas ignoradas quando um drawer/modal está aberto (foco preso). Dica discreta no rodapé do cabeçalho de Ajustes: "Teclado: setas para navegar, Enter para avançar." (o painel principal não mostra legenda para não poluir). **CA:** CA-K05-1: é possível avançar um ticket de Novos a Entregue apenas com o teclado.

---

## K06 — Aviso de novo ticket

Ao surgir um ticket novo em **Novos**: (1) entra no lugar correto sem deslocar tickets visíveis acima (se inserção no meio, os de baixo descem com `transform` 160 ms; reduced-motion ⇒ sem animação); (2) borda externa pulsa **uma vez** (3 s, `brand`, sem piscar > 3 Hz); (3) anúncio `aria-live`; (4) som opcional (um *beep* curto ≤ 400 ms, volume do sistema; limitado a 1 por 3 s); (5) contador da coluna ganha realce `brand-soft` por 3 s. Nunca roubar o foco do teclado.
**CA:** CA-K06-1: nenhuma animação com `prefers-reduced-motion: reduce`; CA-K06-2: 5 tickets chegando juntos geram 1 anúncio agregado ("5 novos pedidos").

---

## K07 — Desfazer avanço de status

Aplica a **Marcar como pronto** e **Marcar como entregue** (janela configurável, padrão 5 s). Ao acionar: (1) o botão do ticket vira **"Desfazer (5)"** (secundário 72, contagem regressiva em texto e anel); (2) o ticket permanece na coluna com opacidade .75 e rótulo "Movendo para Prontos…"; (3) ao fim, envia `PATCH` para cada ficha **em série**; sucesso ⇒ ticket muda de coluna (animação 160 ms); (4) `Esc` ou toque em "Desfazer" cancela o timer, nada é enviado. Fechar/recarregar a tela durante a janela **descarta** a ação (seguro).
Com janela `0` o `PATCH` é imediato e não há Desfazer. "Iniciar preparo" é sempre imediato. Anúncio: "Pedido da Mesa 3 será marcado como pronto em 5 segundos. Esc desfaz."
**CA:** CA-K07-1: tocar em Desfazer em 5 s ⇒ nenhum `PATCH` enviado; CA-K07-2: sem desfazer ⇒ N `PATCH` (um por ficha) em ordem e ticket muda de coluna ao fim.
**testid:** `kds-btn-desfazer-<comandaId>`.
