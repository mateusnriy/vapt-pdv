# Telas transversais (X01–X09)

Modelo de cada spec: **Objetivo · Rota/Perfil · Layout · Regiões/componentes · Dados · Estados · Interações · Microcopy · A11y · Critérios de aceite (CA) · `data-testid`**. Estados padrão de lista (carregando/vazio/erro) estão em X07 e se aplicam onde a tela diz "padrão X07".

---

## X01 — Login operacional

**Objetivo:** escolher o operador ativo e ir direto à estação do perfil (RF34, RN23). **Sem senha** no Módulo 1. **Rota:** `/login`. **Perfis:** todos. **Fonte:** UC01.

**Layout (desktop ≥ 1024, centralizado, máx. 960 px):**
```
        [V]  VaptPDV
   Quem está operando agora?
   [ Buscar operador ]                     (só se > 12 operadores)
   ── Garçons ───────────────────────────────
   [Avatar Lucas] [Avatar Ana] [Avatar ...]
   ── Caixa ─────────────  ── Gerência ──  ── Cozinha e bar ──
   rodapé:  ● Sincronizado     Tema ▾      v2.0.0
```
Celular (< 600): lista vertical de linhas de 72 px agrupadas por perfil (cabeçalhos `section`), logo no topo, rodapé fixo com tema/versão.

**Dados:** `GET /usuarios?ativo=true`. Agrupar por `perfil`; ordem: gerente, caixa, garcom, cozinha; dentro do grupo, ordem alfabética. "Último operador neste aparelho" (`localStorage vapt.ultimoOperador`) vem primeiro com pill "Último acesso".

**Estados:** carregando = 6 skeletons de OperatorCard · vazio = EmptyState "Nenhum operador ativo." + "Peça ao gerente para cadastrar a equipe." (sem ação) · erro = ErrorState "Não foi possível carregar a equipe." + Tentar de novo · sem conexão = banner X03 + lista em cache se houver.

**Interações:** toque/clique/`Enter` em um operador ⇒ `setOperador()`, define tema padrão do módulo (cozinha ⇒ escuro), navega para a rota inicial do perfil (`02 §4`). Teclado: setas movem na grade, `Enter` seleciona, `/` foca a busca. Nenhum diálogo de confirmação.

**Microcopy:** título "Quem está operando agora?" · grupos: "Garçons", "Caixa", "Gerência", "Cozinha e bar" · perfil na pill: Garçom / Caixa / Gerente / Cozinha.

**A11y:** `h1` título; grupos em `section` com `aria-labelledby`; cada card é `button` com nome acessível "Lucas, garçom"; foco inicial no "Último acesso" ou 1º card.

**CA:**
- CA-X01-1: dado usuário `garcom` ativo, quando seleciona, então chega a `/garcom` em < 300 ms após o clique (sem requisição adicional).
- CA-X01-2: usuários `ativo=false` nunca aparecem.
- CA-X01-3: perfil `cozinha` abre `/kds` em tema escuro mesmo com tema global `claro`.
- CA-X01-4: navegável só com teclado; foco visível.

**testid:** `login-grid`, `operador-<id>`, `login-busca`.

---

## X02 — Trocar operador

**Gatilho:** Avatar/nome do operador (cabeçalho do Caixa, Perfil do Garçom, rodapé da Gestão, Ajustes do KDS). **Tipo:** Modal `md` (desktop) / Sheet (celular).
**Conteúdo:** título "Trocar operador" · mesma lista de X01 (sem busca se ≤ 12) com o atual marcado ("Você") · botão secundário "Cancelar".
**Regras:** se `useDraftStore` tem rascunho do operador atual ⇒ aviso no topo (brand-soft): "Há itens não enviados na Mesa 4. Eles ficam salvos neste aparelho." (não bloqueia). Ao confirmar, navega para a rota inicial do novo perfil.
**CA:** CA-X02-1: trocar para outro perfil leva à rota correta; CA-X02-2: `Esc` fecha sem trocar; foco volta ao Avatar.
**testid:** `modal-trocar-operador`.

---

## X03 — Status do sistema (pill + banner)

**Objetivo:** comunicar saúde do ecossistema sem bloquear o trabalho (RN17, OBJ-04). Duas camadas (DESIGN §8.2).

**Pill de cabeçalho** (sempre presente; H 32; ícone + texto):

| Estado | Pill | Cor |
|---|---|---|
| `sincronizado` | "● Sincronizado" (Garçom/Caixa) · "● Online" (KDS) | success-soft/success-text |
| `degradado` | "▲ Parcial" + serviço (ex.: "Cozinha") em `aria-label` | brand-soft/brand-text |
| `sem_conexao` | "✕ Sem conexão" | danger-soft/danger-text |

**Banner de detalhe** (aparece quando ≠ sincronizado):

| Estado | Texto | Ação | Dispensável |
|---|---|---|---|
| Cozinha fora do ar | "Cozinha fora do ar. Você continua vendendo; os itens são enviados quando ela voltar." | — | sim (10 min) |
| Fidelidade fora do ar | "Fidelidade fora do ar. O pagamento segue normal; pontos são creditados depois." | — | sim |
| Relatórios fora do ar | "Relatórios indisponíveis. Vendas e caixa não são afetados." | "Tentar de novo" | sim |
| Sem conexão com o servidor | "Sem conexão com o servidor. Nada foi enviado. Verifique o Wi-Fi." | "Tentar de novo" | **não** |
| Dados desatualizados | "Mostrando dados de 19:42." | — | não (some ao reconectar) |
| Impressora (placeholder v1) | "Impressora não conectada." | "Tentar de novo" | sim |
| Voltou | "Conexão restabelecida." | — | auto 4 s (verde) |

**Regras:** detecção por `useSystemStatus()` (01 §9). Degradado ⇒ **nunca** desabilita fluxo crítico. Sem conexão ⇒ botões que gravam recebem `disabledReason: "Sem conexão"`. Anunciar mudanças via `aria-live` (`polite`; `assertive` só para "Sem conexão").
**CA:** CA-X03-1: com `kds-service` parado, lançar item no Garçom conclui com sucesso e exibe banner "Cozinha fora do ar" (sem erro). CA-X03-2: derrubar o Core ⇒ pill "Sem conexão" em ≤ 20 s. CA-X03-3: ao voltar, banner verde some em 4 s e pill volta a "Sincronizado".
**testid:** `status-pill`, `banner-<cozinha|fidelidade|relatorios|sem-conexao|impressora>`.

---

## X04 — Toasts e "Desfazer"

| Evento | Tipo | Texto | Duração |
|---|---|---|---|
| Mesa aberta | sucesso | "Mesa 4 aberta." | 4 s |
| Itens enviados | sucesso | "3 itens enviados para a cozinha." | 4 s |
| Item removido | **desfazer** | "Batata rústica removida. Desfazer (5)" | 5 s (envio adiado) |
| Ficha avançada (KDS) | **desfazer** | "Pedido da Mesa 3 marcado como pronto. Desfazer (5)" | 5 s |
| Aviso de degradação | atenção | "Cozinha fora do ar. O item foi salvo e será enviado quando ela voltar." | 8 s |
| Pagamento lançado | sucesso | "R$ 60,00 em dinheiro lançados." | 4 s |
| Conta fechada | sucesso | "Conta da Mesa 4 fechada. Total R$ 144,98." | 4 s |
| Cópia (Pix) | sucesso | "Código Pix copiado." | 3 s |
| Erro de ação | erro (`role=alert`) | catálogo `03 §4` | até dispensar |
| Item pronto (garçom) | persistente | G10 | até tocar |
| Nova versão | persistente | X08 | até agir |

**Regras do Desfazer:** a mutação só é enviada ao fim da janela; durante ela o item fica "pendente" (visual `opacity .55` + texto "Removendo…"); `Desfazer` cancela o timer e restaura. Se o app for fechado/recarregado durante a janela, **a ação não é executada** (comportamento seguro; documentar em teste). `Esc` no KDS = Desfazer.
**CA:** CA-X04-1: remover item e tocar Desfazer em 5 s ⇒ nenhum `DELETE` é enviado. CA-X04-2: sem Desfazer ⇒ exatamente 1 `DELETE` após 5 s.
**testid:** `toast-<tipo>`, `toast-desfazer`.

---

## X05 — Diálogo de confirmação (catálogo)

Componente `ConfirmDialog` (04 §2.4). Foco inicial = botão seguro. Lista **completa** (nada de "Sim/Não"):

| ID de uso | Título | Corpo | Seguro | Destrutivo |
|---|---|---|---|---|
| `cancelar-comanda` (C13) | "Cancelar o pedido 0482?" | "Os 4 itens serão descartados e a mesa ficará livre. O estoque não é alterado. Isso não pode ser desfeito." | Voltar | Cancelar pedido |
| `remover-pagamento` (C07) | "Remover o pagamento de R$ 60,00?" | "O valor volta para 'Falta pagar'." | Voltar | Remover pagamento |
| `cancelar-pix` (C10) | "Cancelar a cobrança Pix?" | "O QR Code deixa de valer. Você pode gerar outro." | Manter cobrança | Cancelar cobrança |
| `sair-pagamento` (C07) | "Sair do pagamento?" | "R$ 60,00 lançados serão descartados. A conta continua aberta para pagamento." | Ficar | Sair e descartar |
| `inativar-produto` (M04) | "Inativar {produto}?" | "Ele sai do cardápio e não pode mais ser vendido. As vendas já feitas continuam no histórico." | Voltar | Inativar produto |
| `inativar-usuario` (M13) | "Inativar {nome}?" | "A pessoa deixa de aparecer no login. O histórico é mantido." | Voltar | Inativar usuário |
| `descartar-alteracoes` (M03/M13) | "Descartar alterações?" | "As mudanças não salvas serão perdidas." | Continuar editando | Descartar |
| `pedir-conta` (G06) | "Pedir a conta da Mesa 4?" | "O caixa será avisado. Você não poderá mais lançar itens depois que a conta for fechada." (+ aviso de itens não enviados) | Voltar | Pedir a conta |
| `abrir-mesa-conta-aberta` (G11) | "Esta mesa tem uma conta aguardando pagamento." | "Abrir uma nova comanda agora mistura consumos. Tem certeza?" | Voltar | Abrir nova comanda |
| `trocar-operador-rascunho` (X02) | aviso (não diálogo) | — | — | — |
| `limpar-rascunho` (G03/C01) | "Limpar os itens não enviados?" | "Os {n} itens do rascunho serão removidos." | Voltar | Limpar itens |

Quando a ação tem alternativa de **Desfazer** (remover item, avançar ficha), **não** usar diálogo.

---

## X06 — Telas de erro

**X06-a — 404.** `h1` "Página não encontrada" · "O endereço não existe ou mudou." · botão primário "Ir para o início" (rota do perfil) · secundário "Trocar operador".
**X06-b — Sem permissão.** `h1` "Seu perfil não acessa esta área" · "{Perfil} não abre {módulo}. Peça ao gerente ou troque de operador." · primário "Ir para {minha estação}" · secundário "Trocar operador". Nunca redirecionar silenciosamente.
**X06-c — Erro inesperado.** `h1` "Algo deu errado" · "A tela travou, mas suas vendas continuam salvas no servidor." · primário "Recarregar a tela" · terciário "Copiar código do erro" (`requestId`/timestamp). Registrar log estruturado.
**CA:** CA-X06-1: garçom abrindo `/gestao` vê X06-b com os textos acima; CA-X06-2: exceção de renderização cai no *error boundary* de rota sem derrubar o shell (rail/sidebar permanecem).

---

## X07 — Padrões de lista (copy por tela)

Carregando = skeleton com **mesma quantidade e dimensões**: grade de mesas 8 cards; produtos 12 cards; linhas 8; KPIs 4. Erro = "Não foi possível carregar {coisa}. Verifique a conexão e toque em Tentar de novo."

| Lista | Vazio (nada ainda) | Vazio (filtro) |
|---|---|---|
| G01 mesas (filtro Minhas) | "Você não tem mesas abertas. Toque em Abrir mesa." | "Nenhuma mesa nesse filtro." + Limpar filtros |
| G03 produtos da categoria | "Nenhum item nesta categoria." | — |
| G07 comandas | "Nenhuma comanda ainda hoje." | "Nenhuma comanda com esses filtros." |
| G08 prontos | "Nada pronto para entregar agora." | — |
| C01 pedido atual | "Toque em um produto para começar a venda." | — |
| C03 pedidos | "Nenhum pedido no período." | idem |
| C04 receber | "Nenhuma conta aguardando pagamento." | — |
| K01 coluna | Novos: "Sem pedidos novos." · Em preparo: "Nada em preparo." · Prontos: "Nada aguardando retirada." | idem por setor |
| M02 cardápio | "Nenhum produto cadastrado. Toque em Novo produto." | "Nenhum produto com esses filtros." |
| M12 equipe | "Nenhuma pessoa cadastrada." | idem |
| M01 alertas | "Tudo certo por aqui. Nenhum alerta agora." | — |

---

## X08 — PWA: instalar e atualizar

- **Instalar** (somente Garçom/Caixa, após 2ª visita, `beforeinstallprompt`): faixa discreta no Perfil/Ajustes + botão "Instalar o VaptPDV". Não interrompe o fluxo. iOS: instrução "Toque em Compartilhar e depois em Adicionar à Tela de Início".
- **Atualizar:** toast persistente "Nova versão disponível." + botão "Atualizar". Se há rascunho aberto, texto adicional "Seus itens não enviados serão mantidos." Nunca recarregar automaticamente.
- **Offline shell:** abrir sem rede mostra shell + X03 "Sem conexão" + dados em cache com carimbo.
**CA:** CA-X08-1: com SW novo e rascunho de itens, nenhum reload automático ocorre.

---

## X09 — Seletor de tema

SegmentedControl "Automático · Claro · Escuro" (ícones `sun-moon`, `sun`, `moon`) em G09 Perfil, C16 Ajustes, rodapé da Gestão e K03 Ajustes. Efeito imediato; persiste em `localStorage vapt.theme`. KDS: padrão "Escuro".
**CA:** CA-X09-1: alterar tema não recarrega nem perde rascunho; CA-X09-2: todos os componentes mantêm contraste nos dois temas (axe sem violações).
