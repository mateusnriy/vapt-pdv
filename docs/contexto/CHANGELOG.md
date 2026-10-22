# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo, organizadas pelas entregas incrementais da disciplina de Sistemas Distribuídos (DCC/UERN).

## [0.1.0] — 2026-10-22 — Módulo 1: Nuvem IaaS (`entrega-1-cloud`)

### Adicionado
- **Deploy em Nuvem IaaS na AWS EC2:**
  - Guia de provisionamento e checklist devops em [`docs/deploy-aws-ec2.md`](docs/deploy-aws-ec2.md) com script de instalação de Node.js 20 LTS, PostgreSQL nativo e PM2.
  - Regras de segurança de firewall no Security Group (portas 22 e 3000 liberadas; porta 5432 isolada em `localhost`).
  - Roteiro de testes ponta a ponta e script automatizado cURL em [`test/e2e-curl-modulo-1.sh`](test/e2e-curl-modulo-1.sh) e [`docs/roteiro-testes-curl-modulo-1.md`](docs/roteiro-testes-curl-modulo-1.md).
- **Módulo de Comandas (`src/modules/comandas`):**
  - Abertura de comanda (`POST /comandas`) com validação de garçom via interface `ServicoUsuarios`.
  - Bloqueio de mesa ocupada com índice único condicional no PostgreSQL (`CREATE UNIQUE INDEX "comandas_mesa_aberta_unique_idx" ON "comandas"("mesa") WHERE "status" = 'aberta'`) retornando `409 MESA_OCUPADA`.
  - Lançamento de itens (`POST /comandas/:id/itens`) com cópia de snapshot do nome e preço unitário do produto (`RN04`).
  - Ajuste de quantidade (`PATCH /comandas/:id/itens/:itemId`) e remoção de itens (`DELETE /comandas/:id/itens/:itemId`).
  - Fechamento com cálculo de subtotal e taxa de serviço opcional de 10% com arredondamento seguro (`POST /comandas/:id/fechar`).
  - Cancelamento de comanda aberta sem impacto no estoque (`POST /comandas/:id/cancelar`).
  - Pagamento com seleção de forma de pagamento (`POST /comandas/:id/pagar`), gravação de data UTC de quitação e baixa de estoque atômica e idempotente via `ServicoProdutos.baixarEstoque`.
  - Listagem com filtros combinados (`status`, `mesa`, `de`, `ate`, `limit`, `offset`) e ordenação decrescente (`GET /comandas`).
  - Detalhamento de comanda com lista completa de itens (`GET /comandas/:id`).
- **Módulo de Produtos e Estoque (`src/modules/produtos`):**
  - CRUD completo de produtos: cadastro (`POST /produtos`), listagem paginada (`GET /produtos`), detalhamento (`GET /produtos/:id`), atualização parcial (`PATCH /produtos/:id`) e inativação idempotente (`POST /produtos/:id/inativar`).
  - Modelo financeiro estrito com `Decimal(10, 2)` (Prisma Decimal / PostgreSQL NUMERIC).
  - Consulta interna de disponibilidade (`GET /produtos/:id/disponibilidade`) para congelamento no lançamento de itens.
  - Baixa de estoque transacional e idempotente por `comanda_id` (`POST /produtos/baixa-estoque`) com histórico contábil na tabela `movimentos_estoque`.
- **Módulo de Usuários (`src/modules/usuarios`):**
  - CRUD completo de usuários com enum de perfil (`garcom`, `caixa`, `gerente`) e inativação lógica idempotente (`POST /usuarios/:id/inativar`).
  - Validação interna de garçom ativo (`GET /usuarios/:id/validar-garcom`).
- **Infraestrutura Base e Qualidade:**
  - Fastify com TypeBox e tratamento uniforme de erros em `{ "erro": { "codigo", "mensagem", "detalhes" } }`.
  - Health check da aplicação e conectividade com banco via `SELECT 1` em `GET /health`.
  - Documentação interativa OpenAPI/Swagger UI em `GET /docs`.
  - 135 testes automatizados com Vitest cobrindo 100% da matriz de requisitos do Módulo 1.
