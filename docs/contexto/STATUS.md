# STATUS — VaptPDV (Controle de Progresso para Agentes e Desenvolvedores)

> **Propósito:** Ponto único de retomada para qualquer desenvolvedor ou agente de IA ao abrir o repositório em outra máquina ou nova sessão. Atualize este arquivo e `_bmad-output/implementation-artifacts/sprint-status.yaml` sempre que uma story mudar de estado.

**Última atualização:** 2026-10-22
**Módulo atual:** Módulo 1 — Computação em Nuvem (`entrega-1-cloud`) — **CONCLUÍDO (`done`)**
**Próximo Módulo:** Módulo 2 — Serviços / Microsserviços (`entrega-2-microsservicos`, prazo: 30/10/2026)
**Status do Épico 1:** Todas as 9 stories concluídas com 135 testes passando, build `dist/` gerado e documentação de deploy e entrega finalizada.

---

## 1. Como retomar o trabalho em outra máquina / sessão

1. Leia [`AGENTS.md`](AGENTS.md) na raiz (carregado automaticamente pelos agentes).
2. Consulte este [`STATUS.md`](STATUS.md) e [`_bmad-output/implementation-artifacts/sprint-status.yaml`](_bmad-output/implementation-artifacts/sprint-status.yaml) para saber qual story está ativa.
3. Para continuar a próxima story no BMad (Story 10 - Módulo 2), invoque a skill `bmad-build` apontando para a Story 10 em `stories.yaml`.

---

## 2. Artefatos de Planejamento e Especificação Concluídos

### Documentação Oficial de Engenharia de Software (docs/engenharia/)
- [x] Índice Mestre da Suite Documental: [`docs/engenharia/README.md`](docs/engenharia/README.md)
- [x] Visão e Escopo: [`docs/engenharia/01-visao-e-escopo.md`](docs/engenharia/01-visao-e-escopo.md)
- [x] Especificação de Requisitos SRS (IEEE 830): [`docs/engenharia/02-especificacao-requisitos-srs.md`](docs/engenharia/02-especificacao-requisitos-srs.md)
- [x] Arquitetura C4 Model & Kruchten 4+1: [`docs/engenharia/03-arquitetura-c4-model.md`](docs/engenharia/03-arquitetura-c4-model.md)
- [x] Modelo de Domínio e Dados (DER dos 4 Bancos): [`docs/engenharia/04-modelo-dados-e-dominio.md`](docs/engenharia/04-modelo-dados-e-dominio.md)
- [x] Contrato de APIs REST e Mensageria AMQP: [`docs/engenharia/05-contrato-apis-e-eventos.md`](docs/engenharia/05-contrato-apis-e-eventos.md)
- [x] Plano de Testes e Qualidade (TEA BMad): [`docs/engenharia/06-plano-de-testes-e-qualidade.md`](docs/engenharia/06-plano-de-testes-e-qualidade.md)
- [x] Guia de DevOps, AWS EC2, Docker e Runbook: [`docs/engenharia/07-guia-devops-e-operacoes.md`](docs/engenharia/07-guia-devops-e-operacoes.md)
- [x] UX/UI Design Frontend (Garçom, Caixa, KDS): [`docs/engenharia/08-ux-e-experiencia-frontend.md`](docs/engenharia/08-ux-e-experiencia-frontend.md)
- [x] Relatório de Auditoria e Revisão Cruzada BMad: [`docs/engenharia/09-relatorio-revisao-bmad.md`](docs/engenharia/09-relatorio-revisao-bmad.md)
- [x] Guia de Deploy IaaS AWS EC2: [`docs/deploy-aws-ec2.md`](docs/deploy-aws-ec2.md)
- [x] Roteiro de Testes e Prova cURL: [`docs/roteiro-testes-curl-modulo-1.md`](docs/roteiro-testes-curl-modulo-1.md) e [`test/e2e-curl-modulo-1.sh`](test/e2e-curl-modulo-1.sh)

### Contrato Canônico e Artefatos BMad
- [x] Especificação Canônica Atualizada: [`_bmad-output/specs/spec-vapt-pdv/SPEC.md`](_bmad-output/specs/spec-vapt-pdv/SPEC.md) e [`.memlog.md`](_bmad-output/specs/spec-vapt-pdv/.memlog.md)
- [x] Companions do SPEC: [`architecture-and-stack.md`](_bmad-output/specs/spec-vapt-pdv/architecture-and-stack.md), [`domain-and-state-machine.md`](_bmad-output/specs/spec-vapt-pdv/domain-and-state-machine.md), [`api-contract.md`](_bmad-output/specs/spec-vapt-pdv/api-contract.md), [`academic-deliverables.md`](_bmad-output/specs/spec-vapt-pdv/academic-deliverables.md) e [`requirements-traceability.md`](_bmad-output/specs/spec-vapt-pdv/requirements-traceability.md)
- [x] Artefatos Executivos de Planejamento: [`_bmad-output/planning-artifacts/product-brief.md`](_bmad-output/planning-artifacts/product-brief.md), [`prd.md`](_bmad-output/planning-artifacts/prd.md), [`architecture.md`](_bmad-output/planning-artifacts/architecture.md), [`ux-design.md`](_bmad-output/planning-artifacts/ux-design.md) e [`_bmad-output/test-artifacts/test-design/test-plan.md`](_bmad-output/test-artifacts/test-design/test-plan.md)
- [x] Documentos fonte originais em [`docs/Projeto incremental- 3ª UNIDADE-SD.md`](docs/Projeto%20incremental-%203%C2%AA%20UNIDADE-SD.md) e [`docs/VaptPDV Documentação do Sistema.md`](docs/VaptPDV%20Documenta%C3%A7%C3%A3o%20do%20Sistema.md)
- [x] Contexto de Agentes e Git: [`AGENTS.md`](AGENTS.md) e [`.gitignore`](.gitignore)

---

## 3. Backlog e Progresso das Stories

### Épico 1 — Módulo 1: Computação em Nuvem (`entrega-1-cloud` · Concluído)

| ID (`stories.yaml`) | Chave (`sprint-status.yaml`) | Título | Status | Spec da Story |
| :--- | :--- | :--- | :--- | :--- |
| `"1"` | `1-1-esqueleto-da-api-e-infraestrutura-base` | Esqueleto da API e infraestrutura base | `done` | [`stories/1-esqueleto-da-api-e-infraestrutura-base.md`](_bmad-output/specs/spec-vapt-pdv/stories/1-esqueleto-da-api-e-infraestrutura-base.md) |
| `"2"` | `1-2-crud-de-usuarios-com-perfil` | CRUD de usuários com perfil | `done` | [`stories/2-crud-de-usuarios-com-perfil.md`](_bmad-output/specs/spec-vapt-pdv/stories/2-crud-de-usuarios-com-perfil.md) |
| `"3"` | `1-3-crud-de-produtos-com-estoque` | CRUD de produtos com estoque | `done` | [`stories/3-crud-de-produtos-com-estoque.md`](_bmad-output/specs/spec-vapt-pdv/stories/3-crud-de-produtos-com-estoque.md) |
| `"4"` | `1-4-abertura-e-consulta-de-comandas` | Abertura e consulta de comandas | `done` | [`stories/4-abertura-e-consulta-de-comandas.md`](_bmad-output/specs/spec-vapt-pdv/stories/4-abertura-e-consulta-de-comandas.md) |
| `"5"` | `1-5-lancamento-ajuste-e-remocao-de-itens` | Lançamento, ajuste e remoção de itens | `done` | [`stories/5-lancamento-ajuste-e-remocao-de-itens.md`](_bmad-output/specs/spec-vapt-pdv/stories/5-lancamento-ajuste-e-remocao-de-itens.md) |
| `"6"` | `1-6-fechamento-com-taxa-de-servico-e-cancelamento` | Fechamento com taxa de serviço e cancelamento | `done` | [`stories/6-fechamento-com-taxa-de-servico-e-cancelamento.md`](_bmad-output/specs/spec-vapt-pdv/stories/6-fechamento-com-taxa-de-servico-e-cancelamento.md) |
| `"7"` | `1-7-pagamento-com-baixa-de-estoque-transacional` | Pagamento com baixa de estoque transacional | `done` | [`stories/7-pagamento-com-baixa-de-estoque-transacional.md`](_bmad-output/specs/spec-vapt-pdv/stories/7-pagamento-com-baixa-de-estoque-transacional.md) |
| `"8"` | `1-8-deploy-em-nuvem-com-banco-gerenciado` | Deploy em nuvem com banco gerenciado | `done` | [`stories/8-deploy-em-nuvem-com-banco-gerenciado.md`](_bmad-output/specs/spec-vapt-pdv/stories/8-deploy-em-nuvem-com-banco-gerenciado.md) |
| `"9"` | `1-9-documentacao-e-prova-de-entrega-do-modulo-1` | Documentação e prova de entrega do Módulo 1 | `done` | [`stories/9-documentacao-e-prova-de-entrega-do-modulo-1.md`](_bmad-output/specs/spec-vapt-pdv/stories/9-documentacao-e-prova-de-entrega-do-modulo-1.md) |

### Épico 2 — Módulo 2: Serviços / Microsserviços (`entrega-2-microsservicos` · Prazo: 30/10)

| ID (`stories.yaml`) | Chave (`sprint-status.yaml`) | Título | Status | Spec da Story |
| :--- | :--- | :--- | :--- | :--- |
| `"10"` | `2-1-extrair-usuarios-service` | Extrair `usuarios-service` | `backlog` | — |
| `"11"` | `2-2-extrair-produtos-service` | Extrair `produtos-service` | `backlog` | — |
| `"12"` | `2-3-extrair-comandas-service-com-chamadas-http-resilientes` | Extrair `comandas-service` com chamadas HTTP resilientes | `backlog` | — |
| `"13"` | `2-4-deploy-diagrama-e-documentacao-do-modulo-2` | Deploy, diagrama e documentação do Módulo 2 | `backlog` | — |

### Épico 3 — Módulo 3: Containers (`entrega-3-containers` · Prazo: 06/11)

| ID (`stories.yaml`) | Chave (`sprint-status.yaml`) | Título | Status | Spec da Story |
| :--- | :--- | :--- | :--- | :--- |
| `"14"` | `3-1-dockerfile-enxuto-por-servico` | Dockerfile enxuto por serviço | `backlog` | — |
| `"15"` | `3-2-docker-compose-com-bancos-e-persistencia` | Docker Compose com bancos e persistência | `backlog` | — |
| `"16"` | `3-3-documentacao-comparativa-e-prova-do-modulo-3` | Documentação comparativa e prova do Módulo 3 | `backlog` | — |

### Épico 4 — Módulo 4: Mensageria e Streaming (`entrega-4-mensageria` · Prazo: 13/11)

| ID (`stories.yaml`) | Chave (`sprint-status.yaml`) | Título | Status | Spec da Story |
| :--- | :--- | :--- | :--- | :--- |
| `"17"` | `4-1-rabbitmq-em-container-e-produtor-do-evento-comanda-paga` | RabbitMQ em container e produtor do evento `comanda.paga` | `backlog` | — |
| `"18"` | `4-2-consumidor-em-produtos-service-com-baixa-idempotente` | Consumidor em `produtos-service` com baixa idempotente | `backlog` | — |
| `"19"` | `4-3-comparativo-mensageria-vs-streaming-e-prova-do-modulo-4` | Comparativo mensageria vs. streaming e prova do Módulo 4 | `backlog` | — |

---

## 4. Ações Humanas Pendentes (Fora do Alcance dos Agentes)

- [ ] Inicializar repositório Git (`git init`) e conectar ao repositório remoto no GitHub.
- [ ] Disponibilizar um banco PostgreSQL (local ou na instância **AWS EC2**) e configurar a `DATABASE_URL` no `.env` para rodar as migrations a partir da Story 2.
- [ ] (Story 8) Configurar a instância **AWS EC2** (Node.js 20+, PostgreSQL local na VM, `.env`, PM2/systemd e liberação da porta HTTP no Security Group).
- [ ] (Story 9) Gravar vídeo curto demonstrando a API pública na AWS EC2, publicar como **Não listado** no YouTube, inserir link no `README.md` e criar a tag `entrega-1-cloud`.

---

## 5. Decisões / Perguntas em Aberto (Não bloqueiam o Módulo 1)

1. Confirmar com as professoras se cada entrega vence no dia da respectiva aula prática (21/10, 30/10, 06/11, 13/11).
2. Confirmar se nos Módulos 2 e 3 (antes do RabbitMQ no Módulo 4) o pagamento em `comandas-service` baixa o estoque via chamada HTTP síncrona em `produtos-service` (necessário antes de iniciar a Story 11/12).
