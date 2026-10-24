# Modo Garçom (G01–G11) — celular 390×844, uso com uma mão

**Perfil:** `garcom` (gerente em leitura). **Shell:** cabeçalho de tela + conteúdo rolável + **BottomNav** (Mesas · Comandas · Cozinha · Perfil). Viewport mínimo 360 px (RNF05). Safe areas respeitadas. **Sem gesto obrigatório**; toda ação tem botão visível. Meta: lançar um item em ≤ 3 toques (abrir mesa → `+` no produto → Enviar para a cozinha).
**Referências visuais:** `referencias/Garcom_-_Mesas_2x.png`, `Garcom_-_Comanda_2x.png` (ver deltas de escopo em `DESIGN.md §14`).
**Padrões herdados:** estados X07, status X03, toasts X04, confirmações X05.

---

## G01 — Salão (mapa de mesas)

**Rota:** `/garcom` · **UC01, RF15** · **Poll:** 5 s (`GET /comandas?status=aberta` e `?status=fechada`).

**Layout (390×844):**
```
┌──────────────────────────────────────┐
│ Sábado · jantar        [● Sincron.][RM]│  linha de contexto + pill + Avatar (44)
│ Salão                                  │  h1 24/800
│ [Todas 7][Minhas 3][Livres 3][Conta 1]→│  chips H44 (rolagem + fade + setas ≥600)
│ ┌────────┐ ┌────────┐                  │
│ │Livre   │ │Ocupada │   grade 2 col, gap 12, P 16 lateral
│ │ 1      │ │ 2      │
│ │4 lugares│ │34min  R$186,40│
│ └────────┘ └────────┘
│ ...                          [+ Abrir mesa] ← FAB (acima da nav)
│ [Mesas][Comandas][Cozinha][Perfil]     │  BottomNav 64 + safe
└──────────────────────────────────────┘
```
- **Contexto:** "{Dia da semana} · {turno}" (`turno()` em 01 §7). Pill X03 e Avatar abrem X02.
- **Filtros:** `Todas` · `Minhas` · `Livres` · `Conta pedida`. Cada chip mostra contagem. Padrão: `Todas`. `Minhas` = comandas com `garcom_id` do operador. Persistência do filtro na sessão.
- **Grade:** `MesaCard` por mesa de `1..VITE_QTD_MESAS` + balcões ativos (`B-*` não aparecem aqui). Mesa **Ocupada** = comanda `aberta`; **Conta pedida** = P-03; **Livre** = sem comanda. Ordenação: numérica. Mesas "Minhas" ganham marcador.
- **Toque na mesa:** Livre ⇒ G02 com mesa preenchida; Ocupada/Conta pedida ⇒ `/garcom/mesa/:mesa` (G03; em "Conta pedida" abre em modo leitura com ação de reabrir **não disponível**: só consulta).
- **FAB "Abrir mesa":** abre G02 sem mesa. `Abrir mesa` em uma linha.
- Mesa de outro garçom: pode **abrir** (para lançar itens se necessário — o salão é compartilhado) mas mostra o nome do responsável no G03 ("Mesa de Ana"). Edição permitida (RF não restringe por dono).

**Dados exibidos por card:** status (pill), número (38/800), tempo aberto (`aberta_em`), total parcial **estimado** (soma de `preco_copiado × quantidade` via `Cents`; "—" se `GET` de lista não trouxer itens: PB-09), "N lugares" só se houver configuração (Q/PB-12).

**Estados:** carregando (8 skeletons) · erro (ErrorState) · sem conexão (cache + banner "Dados de HH:MM") · filtro vazio (X07) · degradado: nenhum impacto.

**CA:**
- CA-G01-1: mesa com comanda `aberta` aparece "Ocupada" em ≤ 5 s após ser aberta em outro aparelho.
- CA-G01-2: tocar em mesa Livre abre G02 com o número preenchido e foco no botão "Abrir mesa".
- CA-G01-3: com 31+ mesas configuradas, a grade rola e o FAB não cobre o último card (padding-bottom 88).
- CA-G01-4: "Conta pedida" mostra borda 2 px `danger` **e** pill com texto.

**testid:** `salao-grid`, `mesa-<n>`, `filtro-mesas-<valor>`, `fab-abrir-mesa`.

---

## G02 — Abrir mesa

**Tipo:** Sheet (altura auto, ≈ 560 px com NumPad). **Gatilhos:** FAB; toque em mesa Livre. **RF03, RN07, RN08.**

**Conteúdo:**
1. Título "Abrir mesa". Botão Fechar.
2. **Mesa:** `output` grande (38/800) "Mesa __"; NumPad (se mesa não veio preenchida). Mostra "Mesa 12 · livre" ou erro inline "Mesa 12 já está aberta. Abrir comanda existente." (link).
3. **Nome do cliente (opcional):** Field texto, placeholder "Ex.: Mesa da Mariana" (≤ 60).
4. **Pessoas (opcional)** — Stepper 1–20 (apenas se PB-03; senão omitir).
5. Botão primário `xl` **"Abrir mesa"** (60), desabilitado enquanto sem mesa válida: motivo "Informe o número da mesa".

**Fluxo:** `POST /comandas {mesa, garcom_id: operador.id, nome_cliente?, pessoas?}` ⇒ `201` ⇒ fecha sheet, toast "Mesa 12 aberta.", navega para G03. Em `409 MESA_OCUPADA` ⇒ erro inline + ação "Abrir comanda existente" (navega para G03 da mesa). Em `422 GARCOM_INVALIDO` ⇒ toast de erro (catálogo). Se a mesa tem conta aguardando pagamento (comanda `fechada` mais recente) ⇒ G11 antes do POST.
**Validação:** mesa numérica `1..VITE_QTD_MESAS` ou texto livre ≤ 8 caracteres sem espaços (mesas nomeadas ex.: "V1") — aceitar, avisar "Mesa fora do salão configurado" apenas como dica.
**A11y:** foco inicial no NumPad/Field mesa; `Enter` abre; sheet `role="dialog"`.
**CA:** CA-G02-1: 3 toques (FAB → "1" "2" → Abrir mesa) abrem a mesa 12; CA-G02-2: duas aberturas simultâneas da mesma mesa ⇒ uma recebe `MESA_OCUPADA` com mensagem do catálogo.
**testid:** `sheet-abrir-mesa`, `numpad-<tecla>`, `btn-abrir-mesa`.

---

## G03 — Comanda (lançar itens)

**Rota:** `/garcom/mesa/:mesa` · **RF04, RF05, RF11, RF13, RN01, RN04, RN06, RN09, RN13** · **Poll:** `GET /comandas/:id` 5 s (pausa durante edição de rascunho).

**Layout:**
```
┌──────────────────────────────────────┐
│ ‹  Mesa 2                [Transferir]│  voltar(44) + título + secundário DESABILITADO "Em breve"
│    3 pessoas · aberta há 34 min      │  (omite "3 pessoas" sem PB-03)
│ ┌──────────────────────────────────┐ │
│ │✓ 4 itens enviados   Total da mesa│ │  MesaSummaryCard (abre G05)
│ │  Cozinha confirmou às 19:42 R$186,40 ›│
│ └──────────────────────────────────┘ │
│ [Bebidas][Lanches][Porções][Sobrem…]→│  categorias (chips; ativo = brand)
│ ┌──────────────────────────────────┐ │
│ │▢ Chopp 300 ml     [−] 2 [+]  (obs)│ │  ProductRow (selecionado: borda brand)
│ │▢ Limonada suíça              [ + ]│ │
│ │▢ Onion rings       [Esgotado]     │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤  rodapé fixo (safe-area)
│ 3 novos itens                R$ 44,00│  contagem + total estimado dos novos
│ [   Enviar para a cozinha   ]  60 px │  primário xl
│ [      Pedir a conta        ]  48 px │  secundário
└──────────────────────────────────────┘
```
**Cabeçalho:** voltar volta a G01 (se há rascunho, **não** pergunta: rascunho persiste em `useDraftStore`). Subtítulo "{N pessoas · }aberta há {tempo}"; se mesa de outro garçom: "· Mesa de {nome}". "Transferir" visível, desabilitado, `title`/texto "Em breve" (fora do escopo).
**Categorias:** derivadas de `Produto.categoria` (PB-08); ordem: Bebidas, Lanches, Porções, Sobremesas, Combos, demais alfabéticas. **Filtram a lista por categoria** (corrige mockup). Primeira categoria ativa por padrão; lembrar a última usada na sessão.
**Lista:** `ProductRow` de produtos `ativo=true` da categoria, ordenados por nome. Inativos **não aparecem**. Esgotado (`estoque = 0`) aparece com pill e sem controle.
**Rascunho (P-05):** `+` adiciona ao rascunho local; Stepper altera; `−` em 1 remove do rascunho (sem Desfazer necessário — ainda não é item). Limite superior = `estoque`.
**Rodapé:** "N novos itens" = soma das quantidades do rascunho; total estimado em `Cents`. Sem rascunho: texto "Nenhum item novo", primário desabilitado (`disabledReason: "Adicione itens"`).
**Enviar para a cozinha:** executa `POST /comandas/:id/itens` por linha **em série**; durante o envio, botão `loading` e lista inerte; ao fim: sucesso total ⇒ limpa rascunho, toast "N itens enviados para a cozinha.", `invalidate` comanda, atualiza card enviados; sucesso parcial ⇒ itens com erro permanecem no rascunho com mensagem inline (ex.: "Só restam 1 de Chopp 300 ml.") e toast de atenção "2 de 3 itens enviados. Revise os que faltam."
**Itens enviados × editáveis (RN01):** itens já enviados **não** são editados nesta lista; ajustes/remoção ocorrem em G05. 
**Pedir a conta:** abre G06. Desabilitado se comanda não tem itens enviados ("Envie itens antes de pedir a conta").
**Comanda fechada/paga/cancelada (modo leitura):** rodapé substitui botões por faixa "Esta comanda está {status}. Não é possível lançar itens." + botão "Voltar ao salão"; lista de produtos oculta; mostrar G05 expandido.
**Estados:** carregando (skeleton de cabeçalho + 6 linhas) · erro/sem conexão (botão Enviar desabilitado "Sem conexão") · degradado (Cozinha fora: banner; envio continua; toast com aviso por `avisos[]`).
**A11y:** lista como `ul`; Stepper com `aria-label`; chips `role=tablist`; anúncio `aria-live` "Chopp 300 ml, 2 no rascunho. Total novos R$ 44,00."
**CA:**
- CA-G03-1: lançar 2× Chopp = `POST` com `quantidade: 2`; ficha aparece no KDS em < 2 s (OBJ-05).
- CA-G03-2: produto com `ativo=false` nunca é listado; se desativado após entrar no rascunho ⇒ erro `PRODUTO_INATIVO` na linha e remoção sugerida.
- CA-G03-3: `ESTOQUE_INSUFICIENTE` mantém a linha no rascunho e limita o stepper ao saldo informado.
- CA-G03-4: trocar de categoria preserva o rascunho.
- CA-G03-5: nenhuma soma monetária usa `Number` com casas decimais (teste unitário em `money.ts`).
**testid:** `comanda-header`, `card-itens-enviados`, `categoria-<nome>`, `produto-row-<id>`, `stepper-<id>`, `btn-enviar-cozinha`, `btn-pedir-conta`, `rodape-total-novos`.

---

## G04 — Observação e alergia do item

**Tipo:** Sheet · **Gatilho:** ícone `message-square-text` na linha com quantidade > 0 · **Depende de PB-02** (sem o campo no backend o botão não é renderizado).
**Conteúdo:** título "{Produto}" · **Atalhos rápidos** (chips toggle H 44): "Sem cebola", "Sem picles", "Bem gelada", "Sem gelo", "Ponto: mal passado", "Ponto: ao ponto", "Ponto: bem passado", "Sem açúcar" (lista **configurável por categoria**, 6–8 itens) · **Campo "Outra observação"** (Textarea ≤ 140, contador) · **Switch "Alergia ou restrição"** (desligado) — quando ligado: campo obrigatório "Qual alergia?" (ex.: "sem glúten"), texto de ajuda "A cozinha verá um alerta em destaque." · Botão primário "Salvar observação".
**Saída:** `observacao` = chips selecionados + texto livre unidos por " · "; `alergia` boolean. Salva no rascunho (linha). Observação em linha já enviada só pelo G05 (`PATCH` do item).
**CA:** CA-G04-1: alergia ligada sem texto ⇒ erro "Diga qual é a alergia."; CA-G04-2: observação aparece na linha do rascunho (13/600) e na ficha do KDS (K02).
**testid:** `sheet-observacao`, `obs-chip-<slug>`, `obs-texto`, `switch-alergia`.

---

## G05 — Itens enviados

**Tipo:** Sheet (até 85%). **Gatilho:** `MesaSummaryCard`. **RF05, RF10, RN01, RF22/PB-10.**
**Conteúdo:** título "Itens da mesa {n}" · lista agrupada por **status de preparo**: Aguardando (recebido), Em preparo, Pronto, Entregue. Cada linha: quantidade × nome, observação, `StatusPill` do preparo (ou "—" se KDS indisponível), preço (`preco_copiado × qtd`), hora de envio. Ações por linha (somente se comanda `aberta`): **Ajustar quantidade** (Stepper inline, `PATCH`; acréscimo valida estoque) e **Remover** (IconButton lixeira, 44) ⇒ janela Desfazer 5 s (X04), `DELETE` ao fim. Itens `pronto` mostram botão **"Marcar como entregue"** (secundário 44) ⇒ `PATCH /kds/fichas/:id/status entregue`.
Rodapé: "Total da mesa (estimado) R$ 186,40" e nota "Valor final calculado ao fechar a conta."
**Regras:** remover item `entregue` pede X05 "Remover item já entregue?" (corpo: "A cozinha já entregou. O item sai da conta.") — porque Desfazer após entrega não reverte o consumo. KDS indisponível ⇒ pills "—" e nota "Status da cozinha indisponível".
**CA:** CA-G05-1: remover item gera `DELETE` apenas após 5 s sem Desfazer e cancela a ficha `recebido`; CA-G05-2: `409 COMANDA_NAO_ABERTA` fecha o sheet e mostra modo leitura.
**testid:** `sheet-itens-enviados`, `item-enviado-<id>`, `btn-remover-item`, `btn-marcar-entregue`.

---

## G06 — Pedir a conta

**Tipo:** Sheet de confirmação (X05 `pedir-conta`). **Depende de PB-01.**
**Conteúdo:** título "Pedir a conta da Mesa {n}?" · resumo: "{N} itens · R$ {total estimado}" · **avisos condicionais:** (a) rascunho com itens não enviados ⇒ brand-soft "Há {n} itens ainda não enviados. Envie ou descarte antes de pedir a conta." com botões "Enviar agora" e "Descartar itens" (a ação de pedir a conta fica desabilitada até resolver); (b) fichas `recebido/em_preparo` pendentes ⇒ aviso informativo "A cozinha ainda está preparando {n} itens." (não bloqueia).
Botões: "Voltar" (seguro) · **"Pedir a conta"** (primário). Sucesso: `POST /comandas/:id/solicitar-conta` ⇒ toast "Conta pedida. O caixa foi avisado." ⇒ volta a G01 (mesa em **Conta pedida**). Sem PB-01: botão do G03 vira "Avisar o caixa" desabilitado com motivo "Disponível em breve".
**CA:** CA-G06-1: com rascunho não enviado, "Pedir a conta" está desabilitado com motivo visível; CA-G06-2: após sucesso a mesa aparece em "Conta pedida" no G01 e no C02.
**testid:** `sheet-pedir-conta`, `btn-confirmar-pedir-conta`.

---

## G07 — Comandas (minhas)

**Rota:** `/garcom/comandas` · **RF09.** Lista das comandas do operador no dia, mais recente primeiro.
**Layout:** título "Comandas" · chips de status: `Abertas` (padrão) · `Aguardando pagamento` · `Pagas` · `Canceladas` · lista de cards: "Mesa 2 · aberta há 34 min", StatusPill, total (estimado se aberta; final se fechada/paga), nome do cliente (se houver). Toque ⇒ G03 (leitura se não aberta).
**Dados:** `GET /comandas?status=&de=<hoje 00:00>&limit=25&offset=` filtrando `garcom_id`; "Carregar mais" (botão 44) ao fim. **Estados:** padrão X07.
**CA:** CA-G07-1: apenas comandas do operador; CA-G07-2: trocar de chip refaz consulta com `status` correspondente.
**testid:** `lista-comandas`, `comanda-card-<id>`.

---

## G08 — Cozinha (prontos para entregar)

**Rota:** `/garcom/cozinha` · **UC03, RF20/RF21** · **Poll:** 3 s `K GET /kds/fila?status=pronto` filtrado por `nome_garcom`.
**Layout:** título "Cozinha" · seção **"Prontos para entregar"** (cards ordenados por `pronto_em` asc, mais antigos primeiro): "Mesa 4 · Hambúrguer artesanal ×1", pill "Pronto há 3 min" (TimerPill desde `pronto_em`; atenção ≥ 3 min, atrasado ≥ 6 min), botão **"Marcar como entregue"** (primário `lg` 52; janela Desfazer 5 s) · seção colapsável **"Em preparo"** (somente leitura: item, mesa, tempo) · **Setor:** chips Todas · Cozinha · Bar.
**Estados:** KDS indisponível ⇒ ErrorState `inline` "A cozinha não responde. Os pedidos continuam sendo feitos." + Tentar de novo (RN17); vazio ⇒ "Nada pronto para entregar agora."
**CA:** CA-G08-1: "Marcar como entregue" faz `PATCH … entregue`; `409 TRANSICAO_KDS_INVALIDA` ⇒ refetch silencioso; CA-G08-2: badge numérico na BottomNav mostra qtd de prontos do operador.
**testid:** `lista-prontos`, `pronto-<fichaId>`, `btn-entregue`.

---

## G09 — Perfil

**Rota:** `/garcom/perfil`. Avatar 72 + nome + perfil · **Trocar operador** (X02) · **Tema** (X09) · **Resumo do turno:** "Mesas abertas agora: N", "Comandas hoje: N" (contagens da lista; sem valores de venda individuais) · **Instalar app** (X08) · **Sobre:** versão, estado dos serviços (lista com X03), botão "Sair" (volta a `/login`; limpa rascunhos? **não**: rascunho é por comanda e persiste).
**CA:** CA-G09-1: Sair navega a `/login` sem perder rascunhos.
**testid:** `perfil-trocar-operador`, `perfil-sair`.

---

## G10 — Aviso de item pronto

**Mecanismo:** o poll de G08 roda em segundo plano enquanto o app está aberto (qualquer tela do Garçom). Para cada ficha `pronto` do operador cujo `id` não foi visto: (1) **Toast persistente** (brand-soft, `role="status"`) "Mesa 4: Hambúrguer artesanal está pronto." + botão "Ver"; (2) **badge** na BottomNav; (3) vibração curta `navigator.vibrate(120)` se disponível e o usuário permitiu em Perfil ("Vibrar ao ficar pronto", padrão ligado); (4) som **desligado** por padrão.
Agrupar: se ≥ 3 avisos em 10 s ⇒ um toast "3 itens prontos. Ver". Persistência: "visto" guardado em memória + `sessionStorage`.
**CA:** CA-G10-1: ficha `pronto` gera exatamente um aviso por aparelho; CA-G10-2: respeita `prefers-reduced-motion` (sem animação).
**testid:** `toast-pronto`, `badge-cozinha`.

---

## G11 — Mesa com conta aguardando pagamento

**Tipo:** Sheet de confirmação (X05 `abrir-mesa-conta-aberta`). **Gatilho:** abrir mesa cuja comanda `fechada` mais recente ainda não foi paga. Mostra resumo "Conta de R$ {total} desde {HH:MM}". Botões: "Voltar" (seguro) · "Abrir nova comanda". **CA:** sem confirmação, nenhum `POST /comandas` é enviado.
**testid:** `sheet-mesa-conta-aguardando`.
