# 03 — Contrato de API consumido pela UI e catálogo de mensagens

> A **fonte oficial** dos contratos é o OpenAPI de cada serviço (`GET /docs`) e os esquemas Prisma do backend. Este arquivo lista o que **cada tela consome**, os formatos esperados e as pendências (PB-xx). No **Módulo 1**, todos os endpoints operacionais são servidos diretamente pelo backend Fastify Core (:3000 / proxy `/api`); a partir do **Módulo 2**, os serviços satélites KDS (:3001), Fidelidade (:3002) e Analytics (:3003) operam desacoplados. Dinheiro = **string decimal de 2 casas** (`"12.50"`); datas = ISO 8601 UTC (RNF11, RN15); IDs numéricos inteiros (`number`).

## 1. Tipos (TypeScript de referência)

```ts
type Dinheiro = string                       // "12.50" (duas casas decimais)
type Perfil = 'garcom' | 'caixa' | 'gerente' | 'cozinha'
type StatusComanda = 'aberta' | 'fechada' | 'paga' | 'cancelada'
type StatusFicha = 'recebido' | 'em_preparo' | 'pronto' | 'entregue' | 'cancelado'
type FormaPagamento = 'dinheiro' | 'pix' | 'cartao'
type Setor = 'cozinha' | 'bar'

interface Usuario {
  id: number
  nome: string
  perfil: Perfil
  ativo: boolean
  criado_em?: string
  atualizado_em?: string
}

interface Produto {
  id: number
  nome: string
  categoria: string
  preco: Dinheiro                            // "12.50"
  estoque: number
  estoque_minimo: number
  ativo: boolean
  criado_em?: string
  atualizado_em?: string
}

interface ItemComanda {
  id: number
  comanda_id: number
  produto_id: number
  nome_copiado: string
  preco_copiado: Dinheiro                    // "12.50"
  quantidade: number
  subtotal?: Dinheiro                        // calculado no fechamento
  observacao?: string                        // PB-02
  alergia?: boolean                          // PB-02
  status_preparo?: StatusFicha               // PB-10
}

interface Comanda {
  id: number
  numero?: number                            // exibição "Pedido 0482": padStart(4, '0')
  mesa: string                               // "1", "2" ou "B-01"
  garcom_id: number
  garcom_nome?: string                       // PB-09
  nome_cliente?: string | null               // PB-03
  pessoas?: number                           // PB-03
  status: StatusComanda
  aberta_em: string
  fechada_em?: string | null
  paga_em?: string | null
  conta_solicitada_em?: string               // PB-01
  subtotal: Dinheiro | null                  // null até fechar (RN05)
  taxa_servico: Dinheiro | null              // null até fechar (RN05)
  total: Dinheiro | null                     // null até fechar (RN05)
  forma_pagamento?: FormaPagamento | null
  itens?: ItemComanda[]
  avisos?: { servico: string; status: string }[]  // degradação graciosa
}

interface Ficha {
  id: number
  comanda_id: number
  item_id: number
  mesa: string
  nome_produto: string
  categoria: Setor
  quantidade: number
  nome_garcom: string
  status: StatusFicha
  criado_em: string
  iniciado_em?: string
  pronto_em?: string
  entregue_em?: string
  observacao?: string
  alergia?: boolean
}

interface ClienteFid {
  id: number
  nome: string
  cpf: string
  telefone: string
  email?: string
  saldo_pontos: number
  saldo_cashback: Dinheiro
  criado_em: string
}

interface ErroApi {
  erro: {
    codigo: string
    mensagem: string
    detalhes?: Record<string, unknown>
  }
}
```

## 2. Endpoints por tela

Legenda: **C** = Core `:3000`; **K** = KDS `:3001`; **F** = Fidelidade `:3002`; **B** = Analytics `:3003`. "Poll" = intervalo de atualização (P-10).

### 2.1 Transversais
| Tela | Chamadas |
|---|---|
| X01 Login | `C GET /usuarios?ativo=true` |
| X02 Trocar operador | idem |
| X03 Status | `C GET /health` (15 s; PB-13) |

### 2.2 Garçom
| Tela | Leitura (poll) | Escrita |
|---|---|---|
| G01 Salão | `C GET /comandas?status=aberta&limit=100` · `C GET /comandas?status=fechada&limit=50` (5 s) | — |
| G02 Abrir mesa | — | `C POST /comandas {mesa, garcom_id, nome_cliente?, pessoas?}` → `201` |
| G03 Comanda | `C GET /comandas/:id` (5 s) · `C GET /produtos?ativo=true` (cache 60 s) | `C POST /comandas/:id/itens {produto_id, quantidade, observacao?, alergia?}` · `PATCH …/itens/:itemId {quantidade}` · `DELETE …/itens/:itemId` |
| G04 Observação | — | incluso no POST/PATCH acima (PB-02) |
| G05 Enviados | `C GET /comandas/:id` · fallback `K GET /kds/comandas/:id/status-preparo` | `DELETE` item (janela Desfazer) |
| G06 Pedir a conta | — | `C POST /comandas/:id/solicitar-conta` (PB-01) |
| G07 Comandas | `C GET /comandas?status=&mesa=&de=&ate=&limit=&offset=` (filtrar por `garcom_id` do operador) | — |
| G08 Cozinha | `K GET /kds/fila?setor=&status=pronto` (3 s), filtrar `nome_garcom` = operador | `K PATCH /kds/fichas/:id/status {status:'entregue'}` |
| G10 Aviso pronto | mesmo poll de G08 (comparar `pronto_em` com último visto) | — |
| G09 Perfil | — | — |

### 2.3 Caixa
| Tela | Leitura | Escrita |
|---|---|---|
| C01 Venda | `C GET /produtos?ativo=true` · `C GET /comandas/:id` | `C POST /comandas` (mesa `B-<senha>`, garcom "Balcão") · `POST/PATCH/DELETE …/itens` · `POST /comandas/:id/cancelar` |
| C02 Mesas | `C GET /comandas?status=aberta` e `?status=fechada` (5 s) | — |
| C03 Pedidos | `C GET /comandas` com filtros RF09 | — |
| C04 Receber | `C GET /comandas?status=fechada` (5 s) | — |
| C05 Detalhe | `C GET /comandas/:id` · `K GET /kds/comandas/:id/status-preparo` (RF22, timeout 2 s) | — |
| C06 Fechar conta | — | `C POST /comandas/:id/fechar {aplicar_taxa_servico: boolean}` → `200 Comanda(fechada)` |
| C07–C11 Pagamento | `C GET /comandas/:id` · `F GET /fidelidade/clientes/:cpf/resumo` (opcional) | `C POST /comandas/:id/pagar {forma_pagamento, cpf?, pagamentos?}` (PB-04; `cpf` vincula fidelidade) |
| C12 Concluída/Recibo | `C GET /comandas/:id` · `F GET /fidelidade/recibos/:comandaId` (pode atrasar: Módulo 4 é assíncrono — tentar 3×, 2 s) | — |
| C13 Cancelar | — | `C POST /comandas/:id/cancelar` |
| C14 Cliente | `F GET /fidelidade/clientes?documento=` · `F GET /fidelidade/clientes/:cpf/resumo` | `F POST /fidelidade/clientes {nome, cpf, telefone, email?}` |
| C16 Ajustes | `C GET /health` | — |

### 2.4 KDS
| Tela | Leitura | Escrita |
|---|---|---|
| K01 Painel | `K GET /kds/fila?setor=cozinha|bar` (2 s; sem `setor` = ambos) | `K PATCH /kds/fichas/:id/status {status}` |
| K03 Ajustes | — | local (`useUiStore`) |

### 2.5 Gestão
| Tela | Leitura | Escrita |
|---|---|---|
| M01 Visão geral | `B GET /analytics/faturamento?de=&ate=&agrupamento=dia` · `B GET /analytics/produtos/curva-abc?de=&ate=` · `B GET /analytics/estoque/alertas` · `agrupamento=hora` · `K GET /kds/metricas` | — |
| M02–M04 Cardápio | `C GET /produtos?categoria=&ativo=` | `C POST /produtos` · `PATCH /produtos/:id` · `POST /produtos/:id/inativar` (reativar: `PATCH {ativo:true}`) |
| M05–M06 Estoque | `C GET /produtos` · `B GET /analytics/estoque/alertas` · movimentos | `C PATCH /produtos/:id {estoque}` |
| M07–M08 Vendas/Comandas | `C GET /comandas` (RF09) · `C GET /comandas/:id` | — |
| M09 Faturamento | `B GET /analytics/faturamento` | — |
| M10 Curva ABC | `B GET /analytics/produtos/curva-abc?categoria=` | — |
| M11 Garçons | `B GET /analytics/garcons/desempenho?de=&ate=` | — |
| M12–M13 Equipe | `C GET /usuarios?perfil=&ativo=` | `C POST /usuarios` · `PATCH /usuarios/:id` · `POST /usuarios/:id/inativar` |
| M14 Fiscal | — (placeholder de escopo v1) | — |
| M15 Exportar dados | Dados em cache (TanStack Query) | `lib/csv.ts` (client-side Blob) |

### 2.6 Respostas analíticas esperadas (confirmar no OpenAPI)
```ts
Faturamento { periodo:{de,ate}; agrupamento:'dia'|'mes'|'hora';
  total: Dinheiro; subtotal: Dinheiro; taxa_servico: Dinheiro; qtd_comandas: number; ticket_medio: Dinheiro;
  por_forma: { forma: FormaPagamento; total: Dinheiro; percentual: string }[];
  serie: { chave: string /* '2026-10-24' | '2026-10' | '20' */; qtd_comandas: number; total: Dinheiro }[] }
CurvaAbc { itens: { produto_id; nome; categoria; quantidade: number; receita: Dinheiro; participacao: string; acumulado: string; classe: 'A'|'B'|'C' }[] }
DesempenhoGarcom { garcons: { garcom_id; nome; mesas_atendidas: number; total_vendido: Dinheiro; taxa_servico: Dinheiro; ticket_medio: Dinheiro }[] }
AlertaEstoque { itens: { produto_id; nome; estoque: number; estoque_minimo: number; giro_diario: string; ruptura_estimada?: string /* ISO */ }[] }
```
Percentuais chegam como string (`"46.0"`) e **não** são recalculados no cliente.

## 3. Regras de consumo

- **Mesa derivada (P-02/P-03):** unir `aberta` + `fechada` por `mesa`; prioridade: `aberta` > `fechada` mais recente. Mesa sem registro = Livre.
- **Rascunho → itens (P-05):** enviar em série por linha (ordem da lista) para manter a ordem das fichas no KDS. Em erro de uma linha, continuar as demais e marcar a linha com o erro.
- **Ajuste de quantidade com `+`:** atualizar a UI de forma otimista; se `ESTOQUE_INSUFICIENTE`, reverter e mostrar toast.
- **`PATCH` de estoque (M06):** a UI manda o valor **absoluto** final. Para "Entrada de +N", ler o estoque atual imediatamente antes (`GET`) e avisar se mudou ("O estoque mudou para X. Revise o valor.").
- **Pagamento com CPF:** `cpf` só dígitos no corpo; exibição mascarada `***.456.789-**` após vínculo.
- **Avisos de degradação:** `avisos[].servico === 'kds-service'` ⇒ toast `brand` "Cozinha fora do ar. O item foi salvo e será enviado quando ela voltar." (não bloqueia).
- **Conflito (`409`) em mutação:** recarregar a comanda (`invalidate`) e exibir a mensagem do catálogo §4.
- **Paginação:** `limit` 25 (padrão), 50 (máx. na UI); `offset` por página; ordenação do servidor (mais recente primeiro).

## 4. Catálogo de erros → mensagens (pt-BR)

Formato: **título** (linha 1, curta) + **como resolver** (linha 2). Exibir **inline** quando houver campo/linha associada; **toast** `role="alert"` para falha de ação; **diálogo** apenas quando exige decisão.

| Código (HTTP) | Onde ocorre | Mensagem | Ação na UI |
|---|---|---|---|
| `MESA_OCUPADA` (409) | G02, C01 | **Esta mesa já está aberta.** Abra a comanda existente ou escolha outra mesa. | botão "Abrir comanda da mesa"; recarrega salão |
| `GARCOM_INVALIDO` (422) | G02, C01 | **Seu usuário não pode abrir mesas.** Peça ao gerente para conferir seu cadastro. | trocar operador |
| `COMANDA_NAO_ABERTA` (409) | G03, C01, C15 | **Esta comanda já foi fechada.** Não é possível alterar os itens. | recarrega; vai para C05/leitura |
| `COMANDA_IMUTAVEL` (409) | tudo | **Esta comanda não pode mais ser alterada.** Ela já está paga ou cancelada. | recarrega |
| `COMANDA_NAO_FECHADA` (409) | C07 | **Feche a conta antes de receber.** Volte e toque em Fechar conta. | abre C06 |
| `COMANDA_SEM_ITENS` (409) | C06 | **A comanda está vazia.** Adicione itens ou cancele a comanda. | links para C01 / C13 |
| `PRODUTO_INATIVO` (422) | G03, C01 | **{produto} saiu do cardápio.** Escolha outro item. | remove linha do rascunho |
| `ESTOQUE_INSUFICIENTE` (409) | G03, C01 | **Só restam {n} de {produto}.** Ajuste a quantidade. | limita stepper a `n`; "Esgotado" se `0` |
| `VALIDACAO` (400) | formulários | mensagem do campo (ex.: **Informe um valor maior que zero.**) | foco no campo |
| `TRANSICAO_KDS_INVALIDA` (409) | K01, G08 | **Esta ficha já mudou de etapa.** Atualizando… | refetch |
| `SERVICO_INDISPONIVEL` (503) | G03, C05, C12, C14, M01 | **{Serviço} indisponível no momento.** {O que continua funcionando}. Tentar de novo. | ver §5 |
| `SEM_CONEXAO` (cliente) | tudo | **Sem conexão com o servidor.** Verifique o Wi-Fi e tente de novo. Nada foi enviado. | banner X03 |
| `NAO_ENCONTRADO` (404) | detalhes | **Não encontramos este registro.** Ele pode ter sido removido. | voltar |
| `ERRO_INTERNO` (500) | tudo | **Algo deu errado do nosso lado.** Tente de novo. Se continuar, avise o gerente (código {requestId}). | Tentar de novo |
| Timeout do Core | tudo | **O servidor demorou para responder.** Confira se a ação foi concluída antes de repetir. | recarrega item/comanda antes de reenviar |

**Nomes de serviço na UI:** `kds-service` → "Cozinha"; `fidelidade-service` → "Fidelidade"; `analytics-bi-service` → "Relatórios"; `core` → "Servidor".

## 5. Degradação graciosa (RN17) — o que continua funcionando

| Serviço fora | Telas afetadas | Mensagem do banner (X03, `brand`) | Comportamento |
|---|---|---|---|
| Cozinha (KDS) | G03, G05, G08, K01, C05, C06 | "Cozinha fora do ar. Você continua vendendo; os itens são enviados quando ela voltar." | lançar/fechar/pagar seguem; aviso de pendências do KDS some (C06 mostra "Não foi possível consultar a cozinha") |
| Fidelidade | C07, C12, C14 | "Fidelidade fora do ar. O pagamento segue normal; pontos serão creditados depois." | C14 indisponível (botão desabilitado com motivo); C12 mostra recibo "em processamento" |
| Relatórios (BI) | M01, M09–M11 | "Relatórios indisponíveis. Vendas e caixa não são afetados." | cards com `ErrorState` e "Tentar de novo" |
| Servidor (Core) | tudo | banner `danger` "Sem conexão com o servidor" | gravação desabilitada (P-13) |

## 6. Formatação de exibição (derivada da API)

| Dado | Regra de exibição |
|---|---|
| Número do pedido | `String(comanda.numero ?? comanda.id).padStart(4,'0')` → "Pedido 0482" (se `id` não numérico, últimos 4 caracteres em maiúsculas) |
| Identificador do local | mesa numérica → "Mesa 6"; `B-27` → "Balcão 27"; `R-12` (retirada, futuro) → "Retirada 12" |
| Tempo aberto | `agora − aberta_em` → "12 min" · "1h12" · ≥ 24 h → data |
| Cronômetro KDS | `mm:ss` desde `criado_em` (Novos), `iniciado_em` (Em preparo) ou `pronto_em` (Prontos) |
| CPF | `000.000.000-00` com máscara de entrada; exibição mascarada após vínculo |
| Telefone | `(84) 99999-9999` |
| Forma de pagamento | `dinheiro` → Dinheiro · `pix` → Pix · `cartao` → Cartão (e subtipo escolhido na UI: crédito/débito/vale-refeição, **apenas visual**) |
| Status | rótulos de `DESIGN.md §2.3` |
