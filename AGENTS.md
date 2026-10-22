<!-- bmad:context -->
<!-- Verified 2026-10-20 against no commit (repositório sem git init; código ainda não existe). Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## vapt-pdv

VaptPDV: PDV para bares e lanchonetes (comanda, itens, pagamento, estoque), projeto da 3ª unidade de Sistemas Distribuídos. TypeScript/Node, Fastify, Prisma, PostgreSQL, RabbitMQ, Docker; deploy em nuvem IaaS na AWS EC2 com PostgreSQL na própria VM. Contrato vigente: `_bmad-output/specs/spec-vapt-pdv/SPEC.md` (mais companions listados no frontmatter); fontes originais em `docs/`.

## Policy

- Leia `SPEC.md` e os companions antes de implementar; divergência com o contrato se resolve alterando o SPEC pelo `bmad-spec`, não só no código. Nunca edite `SPEC.md` à mão: é derivado de `.memlog.md`.
- Nunca grave segredo, `DATABASE_URL` ou credencial no repositório; use variáveis de ambiente e atualize `.env.example` sem valores reais. Nunca versione `.env`.
- Nunca apague produto ou usuário fisicamente; inative (`ativo=false`).
- Nunca use `Float`/`number` para dinheiro; `Decimal` no banco, string de 2 casas na API.
- Nunca faça commit, tag ou push sem o usuário pedir. Tags de entrega (`entrega-1-cloud`, `entrega-2-microsservicos`, `entrega-3-containers`, `entrega-4-mensageria`) são criadas pelo usuário.
- Não adicione ao escopo da disciplina: frontend/PWA, autenticação, relatórios, alerta de estoque, Kubernetes (ver Non-goals do SPEC).

## Where things are

- Progresso e retomada entre sessões/máquinas: `docs/contexto/STATUS.md` (visão geral humana/agente) e `_bmad-output/implementation-artifacts/sprint-status.yaml` (rastreamento oficial do `bmad-sprint-planning` e `bmad-build`). Atualize ambos ao concluir ou mudar o estado de uma story.
- Ordem de trabalho: `_bmad-output/specs/spec-vapt-pdv/stories.yaml` (execução de cima para baixo) e specs detalhadas por story em `_bmad-output/specs/spec-vapt-pdv/stories/`.
- Rotas, erros e cálculo da comanda: `_bmad-output/specs/spec-vapt-pdv/api-contract.md`. Estados e regras RN01–RN13: `domain-and-state-machine.md`. Entregas e avaliação por módulo: `academic-deliverables.md`.
- Passos que só o usuário faz (acesso SSH e Security Group na AWS EC2, vídeo no YouTube, tag, push) ficam como checklist em `docs/`.
- Módulo 1 (código): `src/modules/{usuarios,produtos,comandas,saude}`, `src/shared/{erros.ts,prisma.ts}`, `src/config/env.ts`, `src/app.ts` e `src/server.ts`; no Módulo 2 vira uma pasta por serviço em `services/`.

## Running and verifying

- Node: `engines.node >=20` (`.nvmrc` em `20`; local com Node 24). No PowerShell do Windows use `npm.cmd` (pois `npm.ps1` é bloqueado por ExecutionPolicy):
  - Instalar: `npm.cmd install`
  - Dev (watch): `npm.cmd run dev`
  - Build: `npm.cmd run build` (gera `dist/`) e `npm.cmd start` (`node dist/server.js`)
  - Typecheck: `npm.cmd run typecheck`
  - Testes (Vitest): `npm.cmd test`
  - Prisma: `npm.cmd run prisma:generate`, `npm.cmd run prisma:migrate` (dev) e `npm.cmd run prisma:deploy` (produção)
- Banco local e nuvem (IaaS): PostgreSQL com `DATABASE_URL` no `.env`; na instância AWS EC2, PostgreSQL instalado diretamente na VM (com três bancos lógicos `comandas_db`, `produtos_db`, `usuarios_db` a partir do Módulo 2).
- Verifique a disponibilidade da API e do banco chamando `GET /health` antes de testar ou gravar o vídeo.

## Conventions that differ from defaults

- Fronteira entre contextos desde o Módulo 1: `comandas` acessa usuários e produtos só por interface de serviço (`EstoqueGateway` e equivalentes), nunca pelo Prisma ou tabelas do outro módulo; no Módulo 2 a interface vira cliente HTTP sem mudar a regra de negócio.
- Item da comanda copia `nome` e `preco` do produto no lançamento; cálculo de total, taxa (10% opcional) e estoque só no backend.
- Baixa de estoque acontece uma única vez, no pagamento, idempotente por `comanda_id`; no Módulo 4 passa a ser consumo do evento `comanda.paga`, e a baixa síncrona deve ser removida para não duplicar.
- Mesa livre é garantida por índice único parcial no banco (`status = 'aberta'`), não só por checagem em código.
- Erros seguem o formato `{ "erro": { codigo, mensagem, detalhes } }` do `api-contract.md`; dependência fora do ar é 503 `SERVICO_INDISPONIVEL`.
- Documentação e mensagens ao usuário em português (pt-br); identificadores de domínio em português snake_case como em `api-contract.md`.

## Known pitfalls

- O cronograma é apertado (Módulo 1 vence em 21/10/2026): implemente primeiro o fluxo mínimo (abrir, lançar, fechar, pagar), depois taxa e baixa de estoque, conforme a ordem das stories.
- Módulo 1 é deploy direto do código na instância AWS EC2 (IaaS), sem Docker e sem dividir em serviços; Docker só entra no Módulo 3.

<!-- /bmad:context -->
