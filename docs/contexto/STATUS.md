# STATUS — VaptPDV (Controle de Progresso para Agentes e Desenvolvedores)

> **Propósito:** Ponto único de retomada para qualquer desenvolvedor ou agente de IA ao abrir o repositório em outra máquina ou nova sessão. Atualize este arquivo e `_bmad-output/implementation-artifacts/sprint-status.yaml` sempre que uma story mudar de estado.

**Última atualização:** 2026-10-23  
**Módulo atual:** Módulo 1 — Computação em Nuvem (`entrega-1-cloud`) — **EM FINALIZAÇÃO (`in-progress`)**  
**Próximo Passo:** Implementação da Story 10 — Interface Web/PWA do PDV Core e homologação na AWS EC2  
**Status do Épico 1:** Backend em camadas 100% concluído com 135 testes passando; Infraestrutura AWS EC2 provisionada pelos discentes; Story 10 (Frontend Web/PWA — Modo Garçom e Modo Caixa) planejada e pronta para desenvolvimento (`ready-for-dev`).

---

## 1. Como retomar o trabalho em outra máquina / sessão

1. Leia [`AGENTS.md`](AGENTS.md) na raiz (carregado automaticamente pelos agentes).
2. Consulte este [`STATUS.md`](STATUS.md) e [`_bmad-output/implementation-artifacts/sprint-status.yaml`](_bmad-output/implementation-artifacts/sprint-status.yaml) para saber qual story está ativa.
3. Para implementar o front-end agora, execute a Story 10 via `bmad-build` / `bmad-agent-dev` apontando para [`stories/10-interface-web-pwa-do-pdv-core.md`](_bmad-output/specs/spec-vapt-pdv/stories/10-interface-web-pwa-do-pdv-core.md).

---

## 2. Divisão de Responsabilidades Registrada

- **Discentes (Kaio França e Mateus Neri):** Responsáveis por toda a infraestrutura e computação distribuída prática (instância AWS EC2, Security Groups, liberação de portas, SO, PM2, subida prática dos bancos/serviços/containers e RabbitMQ, além dos vídeos de entrega e tags Git).
- **Agente BMad (Equipe de Agentes - PM, Architect, Dev, TEA):** Responsável pelo planejamento, documentação formal de engenharia/sprint/arquitetura, especificação de UX/UI, e construção do código da aplicação VaptPDV (Fastify, Prisma, TypeScript, camadas desacopladas, interfaces, gateways, Frontend Web/PWA integrado), preparando o software de forma limpa e modular para encaixar perfeitamente em cada arquitetura dos 4 módulos da disciplina.

---

## 3. Artefatos de Planejamento e Especificação Concluídos

### Documentação Oficial de Engenharia de Software (docs/engenharia/)
- [x] Índice Mestre da Suite Documental: [`docs/engenharia/README.md`](docs/engenharia/README.md)
- [x] Visão e Escopo: [`docs/engenharia/01-visao-e-escopo.md`](docs/engenharia/01-visao-e-escopo.md)
- [x] Especificação de Requisitos SRS (IEEE 830): [`docs/engenharia/02-especificacao-requisitos-srs.md`](docs/engenharia/02-especificacao-requisitos-srs.md)
- [x] Arquitetura C4 Model & Kruchten 4+1: [`docs/engenharia/03-arquitetura-c4-model.md`](docs/engenharia/03-arquitetura-c4-model.md)
- [x] Modelo de Domínio e Dados (DER dos 4 Bancos): [`docs/engenharia/04-modelo-dados-e-dominio.md`](docs/engenharia/04-modelo-dados-e-dominio.md)
- [x] Contrato de APIs REST e Mensageria AMQP: [`docs/engenharia/05-contrato-apis-e-eventos.md`](docs/engenharia/05-contrato-apis-e-eventos.md)
- [x] UX/UI Design Frontend (Garçom, Caixa, KDS): [`docs/engenharia/08-ux-e-experiencia-frontend.md`](docs/engenharia/08-ux-e-experiencia-frontend.md)
- [x] Plano de Testes e Qualidade (TEA BMad): [`_bmad-output/test-artifacts/test-design/test-plan.md`](_bmad-output/test-artifacts/test-design/test-plan.md)

### Contrato Canônico e Artefatos BMad
- [x] Especificação Canônica Atualizada: [`_bmad-output/specs/spec-vapt-pdv/SPEC.md`](_bmad-output/specs/spec-vapt-pdv/SPEC.md) e [`.memlog.md`](_bmad-output/specs/spec-vapt-pdv/.memlog.md)
- [x] Companions do SPEC: [`architecture-and-stack.md`](_bmad-output/specs/spec-vapt-pdv/architecture-and-stack.md), [`domain-and-state-machine.md`](_bmad-output/specs/spec-vapt-pdv/domain-and-state-machine.md), [`api-contract.md`](_bmad-output/specs/spec-vapt-pdv/api-contract.md), [`academic-deliverables.md`](_bmad-output/specs/spec-vapt-pdv/academic-deliverables.md) e [`requirements-traceability.md`](_bmad-output/specs/spec-vapt-pdv/requirements-traceability.md)
- [x] Artefatos Executivos de Planejamento: [`_bmad-output/planning-artifacts/product-brief.md`](_bmad-output/planning-artifacts/product-brief.md), [`prd.md`](_bmad-output/planning-artifacts/prd.md), [`architecture.md`](_bmad-output/planning-artifacts/architecture.md), [`ux-design.md`](_bmad-output/planning-artifacts/ux-design.md)
- [x] Contexto de Agentes e Git: [`AGENTS.md`](AGENTS.md) e [`.gitignore`](.gitignore)

---

## 4. Backlog e Progresso das Stories

### Épico 1 — Módulo 1: Computação em Nuvem (`entrega-1-cloud` · Em Finalização)

| ID (`stories.yaml`) | Chave (`sprint-status.yaml`) | Título | Status | Spec da Story |
| :--- | :--- | :--- | :--- | :--- |
| `"1"` | `1-1-esqueleto-da-api-e-infraestrutura-base` | Esqueleto da API e infraestrutura base | `done` | [`stories/1-esqueleto-da-api-e-infraestrutura-base.md`](_bmad-output/specs/spec-vapt-pdv/stories/1-esqueleto-da-api-e-infraestrutura-base.md) |
| `"2"` | `1-2-crud-de-usuarios-com-perfil` | CRUD de usuários com perfil | `done` | [`stories/2-crud-de-usuarios-com-perfil.md`](_bmad-output/specs/spec-vapt-pdv/stories/2-crud-de-usuarios-com-perfil.md) |
| `"3"` | `1-3-crud-de-produtos-com-estoque` | CRUD de produtos com estoque | `done` | [`stories/3-crud-de-produtos-com-estoque.md`](_bmad-output/specs/spec-vapt-pdv/stories/3-crud-de-produtos-com-estoque.md) |
| `"4"` | `1-4-abertura-e-consulta-de-comandas` | Abertura e consulta de comandas | `done` | [`stories/4-abertura-e-consulta-de-comandas.md`](_bmad-output/specs/spec-vapt-pdv/stories/4-abertura-e-consulta-de-comandas.md) |
| `"5"` | `1-5-lancamento-ajuste-e-remocao-de-itens` | Lançamento, ajuste e remoção de itens | `done` | [`stories/5-lancamento-ajuste-e-remocao-de-itens.md`](_bmad-output/specs/spec-vapt-pdv/stories/5-lancamento-ajuste-e-remocao-de-itens.md) |
| `"6"` | `1-6-fechamento-com-taxa-de-servico-e-cancelamento` | Fechamento com taxa de serviço e cancelamento | `done` | [`stories/6-fechamento-com-taxa-de-servico-e-cancelamento.md`](_bmad-output/specs/spec-vapt-pdv/stories/6-fechamento-com-taxa-de-servico-e-cancelamento.md) |
| `"7"` | `1-7-pagamento-com-baixa-de-estoque-transacional` | Pagamento com baixa de estoque transacional | `done` | [`stories/7-pagamento-com-baixa-de-estoque-transacional.md`](_bmad-output/specs/spec-vapt-pdv/stories/7-pagamento-com-baixa-de-estoque-transacional.md) |
| `"8"` | `1-8-deploy-em-nuvem-com-banco-gerenciado` | Deploy em nuvem com banco gerenciado (AWS EC2) | `done` | [`stories/8-deploy-em-nuvem-com-banco-gerenciado.md`](_bmad-output/specs/spec-vapt-pdv/stories/8-deploy-em-nuvem-com-banco-gerenciado.md) |
| `"9"` | `1-9-documentacao-e-prova-de-entrega-do-modulo-1` | Documentação e prova de entrega do Módulo 1 | `done` | [`stories/9-documentacao-e-prova-de-entrega-do-modulo-1.md`](_bmad-output/specs/spec-vapt-pdv/stories/9-documentacao-e-prova-de-entrega-do-modulo-1.md) |
| `"10"` | `1-10-interface-web-pwa-do-pdv-core` | Interface Web/PWA do PDV Core (Modo Garçom e Modo Caixa) | `ready-for-dev` | [`stories/10-interface-web-pwa-do-pdv-core.md`](_bmad-output/specs/spec-vapt-pdv/stories/10-interface-web-pwa-do-pdv-core.md) |

### Épico 2 — Módulo 2: Serviços / Microsserviços (`entrega-2-microsservicos` · Prazo: 30/10)

| ID (`stories.yaml`) | Chave (`sprint-status.yaml`) | Título | Status | Spec da Story |
| :--- | :--- | :--- | :--- | :--- |
| `"11"` | `2-1-extrair-usuarios-service` | Extrair `usuarios-service` | `backlog` | — |
| `"12"` | `2-2-extrair-produtos-service` | Extrair `produtos-service` | `backlog` | — |
| `"13"` | `2-3-extrair-comandas-service-com-chamadas-http-resilientes` | Extrair `comandas-service` com chamadas HTTP resilientes | `backlog` | — |
| `"14"` | `2-4-deploy-diagrama-e-documentacao-do-modulo-2` | Deploy, diagrama e documentação do Módulo 2 | `backlog` | — |

### Épico 3 — Módulo 3: Containers (`entrega-3-containers` · Prazo: 06/11)

| ID (`stories.yaml`) | Chave (`sprint-status.yaml`) | Título | Status | Spec da Story |
| :--- | :--- | :--- | :--- | :--- |
| `"15"` | `3-1-dockerfile-enxuto-por-servico` | Dockerfile enxuto por serviço | `backlog` | — |
| `"16"` | `3-2-docker-compose-com-bancos-e-persistencia` | Docker Compose com bancos e persistência | `backlog` | — |
| `"17"` | `3-3-documentacao-comparativa-e-prova-do-modulo-3` | Documentação comparativa e prova do Módulo 3 | `backlog` | — |

### Épico 4 — Módulo 4: Mensageria e Streaming (`entrega-4-mensageria` · Prazo: 13/11)

| ID (`stories.yaml`) | Chave (`sprint-status.yaml`) | Título | Status | Spec da Story |
| :--- | :--- | :--- | :--- | :--- |
| `"18"` | `4-1-rabbitmq-em-container-e-produtor-do-evento-comanda-paga` | RabbitMQ em container e produtor do evento `comanda.paga` | `backlog` | — |
| `"19"` | `4-2-consumidor-em-produtos-service-com-baixa-idempotente` | Consumidor em `produtos-service` com baixa idempotente | `backlog` | — |
| `"20"` | `4-3-comparativo-mensageria-vs-streaming-e-prova-do-modulo-4` | Comparativo mensageria vs. streaming e prova do Módulo 4 | `backlog` | — |

---

## 5. Ações Humanas (Discentes)

- [x] **Infraestrutura Cloud IaaS:** Instância **AWS EC2** provisionada com Ubuntu LTS, Node.js e banco **PostgreSQL** local instalado na VM e testado com sucesso por Kaio e Mateus.
- [ ] **Homologação Final M1:** Subir a versão com o Frontend Web/PWA (Story 10) na VM AWS EC2.
- [ ] **Gravação e Tag Git:** Gravar vídeo curto demonstrando o PDV Core funcionando na AWS EC2, publicar no YouTube (Não listado), inserir URL no `README.md` e criar a tag `entrega-1-cloud`.
