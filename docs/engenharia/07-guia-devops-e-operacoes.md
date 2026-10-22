# 07. Guia de DevOps, Implantação em Nuvem e Operações (Runbook)

> **Projeto:** VaptPDV — Ponto de Venda Distribuído para Bares e Lanchonetes  
> **Infraestrutura Alvo:** AWS EC2 (Ubuntu 22.04/24.04 LTS — IaaS), PostgreSQL 16+, PM2, Docker Engine & Docker Compose v2, RabbitMQ 3.13 Management  
> **Público-Alvo:** Desenvolvedores, Engenheiros de Operações (SRE/DevOps) e Avaliadores Acadêmicos

Este documento consolida o manual operacional completo (*Runbook*) do **VaptPDV**, cobrindo desde a execução local em ambiente de desenvolvimento (Windows/Linux) até o deploy direto na máquina virtual **AWS EC2 (Módulos 1 e 2)**, a conteinerização e orquestração multi-container com **Docker Compose (Módulos 3 e 4)** e as análises comparativas arquiteturais exigidas pela disciplina de Sistemas Distribuídos.

---

## 1. Requisitos de Ambiente e Ferramentas

| Componente | Versão Mínima Recomendada | Finalidade no Ecossistema VaptPDV |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` (LTS 20 ou 24) | Runtime JavaScript/TypeScript dos serviços Fastify (`.nvmrc` fixado em `20`). |
| **npm** | `>= 10.0.0` | Gerenciamento de dependências e scripts de build/migração (`npm.cmd` no PowerShell). |
| **PostgreSQL** | `16+` | SGBD relacional para persistência transacional ACID, `DECIMAL(10,2)` e índices parciais. |
| **PM2** | `>= 5.3.0` | Gerenciador de processos em produção para deploy direto na VM IaaS (Módulos 1 e 2). |
| **Docker Engine** | `>= 24.0.0` | Empacotamento e isolamento dos microsserviços em imagens imutáveis (Módulos 3 e 4). |
| **Docker Compose** | `v2.20+` (`docker compose`) | Orquestração local e em nuvem dos containers de aplicação, bancos e RabbitMQ. |
| **RabbitMQ** | `3.13-management-alpine` | Message Broker AMQP 0-9-1 com painel de gerenciamento na porta `15672` (Módulo 4). |

---

## 2. Guia de Execução Local (Desenvolvimento e Testes)

### 2.1. Observação Importante para Windows PowerShell
No Windows PowerShell, a política de execução (`ExecutionPolicy`) frequentemente bloqueia o wrapper `npm.ps1`. Por isso, em ambientes Windows, utilize sempre **`npm.cmd`** e **`npx.cmd`**:

```powershell
# Instalar todas as dependências do projeto
npm.cmd install
```

### 2.2. Configuração de Variáveis de Ambiente (`.env`)
Nunca versione o arquivo `.env` nem exponha credenciais no código. Copie o modelo `.env.example` para `.env`:

```powershell
Copy-Item .env.example .env
```

Conteúdo de referência do `.env` para desenvolvimento local:

```env
# Banco de Dados Principal (PDV Core)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vaptpdv_db?schema=public"

# Configuração do Servidor HTTP
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# URLs dos Microsserviços (Módulo 2+)
USUARIOS_SERVICE_URL="http://localhost:3000"
PRODUTOS_SERVICE_URL="http://localhost:3000"
KDS_SERVICE_URL="http://localhost:3001"
FIDELIDADE_SERVICE_URL="http://localhost:3002"
ANALYTICS_SERVICE_URL="http://localhost:3003"

# Mensageria Assíncrona RabbitMQ (Módulo 4)
RABBITMQ_URL="amqp://vaptpdv:vaptpdv_secret@localhost:5672"
RABBITMQ_EXCHANGE="vaptpdv.eventos"
```

### 2.3. Migrações do Prisma e Geração do Cliente
Com o PostgreSQL local em execução:

```powershell
# 1. Gerar o Prisma Client tipado
npm.cmd run prisma:generate

# 2. Criar/aplicar migrações em ambiente de desenvolvimento
npm.cmd run prisma:migrate

# 3. (Opcional) Aplicar migrações em modo estrito de produção
npm.cmd run prisma:deploy
```

### 2.4. Execução, Build e Verificação de Qualidade

```powershell
# Iniciar servidor em modo watch (tsx watch) com logs formatados via pino-pretty
npm.cmd run dev

# Executar checagem estática de tipos do TypeScript
npm.cmd run typecheck

# Executar suíte completa de testes automatizados (Vitest)
npm.cmd test

# Compilar para produção (gera pasta dist/) e iniciar o binário compilado
npm.cmd run build
npm.cmd start
```

### 2.5. Verificação Rápida Pós-Inicialização
Com o servidor ativo na porta `3000`, valide a saúde da aplicação e do banco:

```bash
curl -i http://localhost:3000/health
# HTTP/1.1 200 OK
# {"status":"ok"}
```
- **Interface Operacional Web:** `http://localhost:3000/`
- **Documentação OpenAPI / Swagger UI:** `http://localhost:3000/docs`

---

## 3. Guia de Deploy em Nuvem IaaS — AWS EC2 (Módulos 1 e 2)

Nos **Módulos 1 e 2**, a arquitetura é implantada diretamente sobre uma máquina virtual **AWS EC2 (Infraestrutura como Serviço — IaaS)** rodando Ubuntu Server LTS, sem uso de Docker, com o PostgreSQL instalado nativamente na VM e os processos Node.js supervisionados pelo **PM2**.

### 3.1. Provisionamento e Regras de Firewall (AWS Security Group)

Ao criar a instância EC2 (recomendado `t3.small` ou `t2.micro` com Ubuntu 22.04/24.04 LTS), configure as seguintes **Regras de Entrada (*Inbound Rules*)** no **Security Group** da AWS:

| Tipo (Type) | Protocolo | Porta (Port Range) | Origem Recomendada (Source) | Finalidade |
| :--- | :---: | :---: | :--- | :--- |
| **SSH** | TCP | `22` | `Meu IP` (`x.x.x.x/32`) | Acesso administrativo remoto via terminal SSH. |
| **Custom TCP** | TCP | `3000` | `Anywhere-IPv4` (`0.0.0.0/0`) | API Principal do PDV Core, Swagger (`/docs`) e Frontend Web (`/`). |
| **Custom TCP** | TCP | `3001` | `Anywhere-IPv4` (`0.0.0.0/0`) | API do `kds-service` (Cozinha & Bar — Módulo 2+). |
| **Custom TCP** | TCP | `3002` | `Anywhere-IPv4` (`0.0.0.0/0`) | API do `fidelidade-service` (Cashback & Comprovantes — Módulo 2+). |
| **Custom TCP** | TCP | `3003` | `Anywhere-IPv4` (`0.0.0.0/0`) | API do `analytics-bi-service` (Painel Gerencial — Módulo 2+). |
| **Custom TCP** | TCP | `15672` | `Meu IP` (ou `0.0.0.0/0` p/ demo) | Painel Web do RabbitMQ Management (Módulo 4). |

> [!CAUTION]
> **Nunca exponha a porta `5432` (PostgreSQL) ou `5672` (AMQP puro)** para `0.0.0.0/0` no Security Group. O acesso aos bancos de dados deve ocorrer exclusivamente via `localhost` (Módulos 1 e 2) ou via rede interna do Docker (`vaptpdv-net` nos Módulos 3 e 4).

---

### 3.2. Instalação da Stack Base na Instância Ubuntu (EC2)

Conecte-se à instância via SSH (`ssh -i sua-chave.pem ubuntu@<IP_PUBLICO_EC2>`) e execute:

```bash
# 1. Atualizar índices de pacotes do sistema operacional
sudo apt-get update && sudo apt-get upgrade -y

# 2. Instalar Node.js 20 LTS via repositório oficial NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git build-essential

# 3. Instalar e habilitar o PostgreSQL nativo na VM
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 4. Instalar o gerenciador de processos PM2 globalmente
sudo npm install -g pm2

# 5. Confirmar versões instaladas
node -v && npm -v && psql --version && pm2 -v
```

---

### 3.3. Criação dos Bancos de Dados Lógicos no PostgreSQL da VM

O VaptPDV adota o padrão **Database-per-Service** (isolamento lógico por contexto delimitado) sobre a instância PostgreSQL da VM:

```bash
sudo -u postgres psql << 'EOF'
ALTER USER postgres WITH PASSWORD 'troque_por_senha_forte_producao';

-- 1. Banco Transacional do Núcleo Operacional (PDV Core — :3000)
CREATE DATABASE vaptpdv_db;

-- 2. Bancos Dedicados dos 3 Microsserviços Satélites (Database-per-Service — Módulo 2+)
CREATE DATABASE kds_db;
CREATE DATABASE fidelidade_db;
CREATE DATABASE analytics_db;
\l
EOF
```

---

### 3.4. Build, Migração e Execução com PM2

```bash
# 1. Clonar o repositório e acessar a pasta
git clone https://github.com/<seu-usuario>/vapt-pdv.git
cd vapt-pdv

# 2. Instalar dependências
npm install

# 3. Configurar o arquivo .env de produção
cp .env.example .env
nano .env
```

Ajuste o `.env` na VM com os valores de produção:
```env
DATABASE_URL="postgresql://postgres:troque_por_senha_forte_producao@localhost:5432/vaptpdv_db?schema=public"
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

Aplique as migrações determinísticas do Prisma (incluindo o índice único parcial `comandas_mesa_aberta_unique_idx` que garante a regra RN07 no banco) e gere o build:

```bash
# 4. Aplicar migrações de produção no PostgreSQL
npm run prisma:deploy

# 5. Gerar cliente Prisma e compilar TypeScript para dist/
npm run build
```

#### Inicialização no Módulo 1 (Processo Único na Porta 3000)
```bash
pm2 start dist/server.js --name vaptpdv-api
pm2 startup
# (Execute a linha 'sudo env PATH=...' exibida pelo comando acima)
pm2 save
```

#### Inicialização no Módulo 2 (Múltiplos Microsserviços via `ecosystem.config.cjs`)
No Módulo 2, o PM2 gerencia todos os microsserviços simultaneamente na VM:

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'pdv-core-api',
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'postgresql://postgres:senha@localhost:5432/vaptpdv_db?schema=public',
        KDS_SERVICE_URL: 'http://localhost:3001',
        FIDELIDADE_SERVICE_URL: 'http://localhost:3002',
        ANALYTICS_SERVICE_URL: 'http://localhost:3003',
      },
    },
    {
      name: 'kds-service',
      script: 'services/kds-service/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://postgres:senha@localhost:5432/kds_db?schema=public',
      },
    },
    {
      name: 'fidelidade-service',
      script: 'services/fidelidade-service/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        DATABASE_URL: 'postgresql://postgres:senha@localhost:5432/fidelidade_db?schema=public',
      },
    },
    {
      name: 'analytics-bi-service',
      script: 'services/analytics-bi-service/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        DATABASE_URL: 'postgresql://postgres:senha@localhost:5432/analytics_db?schema=public',
      },
    },
  ],
};
```

Comandos operacionais do PM2:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
pm2 logs --lines 100
```

---

## 4. Guia de Conteinerização e Orquestração (Módulos 3 e 4)

A partir do **Módulo 3**, toda a infraestrutura (aplicações, bancos de dados PostgreSQL e, no Módulo 4, o broker RabbitMQ) é empacotada em containers Docker e orquestrada via **`docker-compose.yml`**.

### 4.1. Arquitetura do `Dockerfile` Multi-Stage (`node:20-alpine`)

Cada serviço utiliza um `Dockerfile` **multi-stage** em dois estágios (`builder` e `runner`) baseado em `node:20-alpine`, reduzindo a superfície de ataque, removendo devDependencies e compiladores TypeScript da imagem final e executando sob usuário não-root (`node`):

```dockerfile
# ============================================================================
# Estágio 1: Builder (Instalação de dependências, geração Prisma e build TS)
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# OpenSSL é necessário para os binários do Prisma Engine no Alpine Linux
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json ./
COPY src ./src/

RUN npx prisma generate && npm run build
RUN npm prune --omit=dev

# ============================================================================
# Estágio 2: Runner (Imagem enxuta de produção)
# ============================================================================
FROM node:20-alpine AS runner

WORKDIR /app
RUN apk add --no-cache openssl wget

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

---

### 4.2. Especificação Completa de Referência — `docker-compose.yml` (Módulos 3 e 4)

Abaixo está a topologia completa de orquestração contendo os bancos PostgreSQL isolados com volumes persistentes, o broker **RabbitMQ** com painel gerencial, os **healthchecks** de prontidão e a rede interna isolada `vaptpdv-net`:

```yaml
name: vapt-pdv

services:
  # ==========================================================================
  # CAMADA DE DADOS E MENSAGERIA (INFRAESTRUTURA)
  # ==========================================================================
  postgres-core:
    image: postgres:16-alpine
    container_name: vaptpdv-postgres-core
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres_secret}
      POSTGRES_DB: vaptpdv_db
    volumes:
      - pgdata_core:/var/lib/postgresql/data
      - ./docker/postgres/init-multi-db.sql:/docker-entrypoint-initdb.d/init-multi-db.sql:ro
    networks:
      - vaptpdv-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER:-postgres} -d vaptpdv_db"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    container_name: vaptpdv-rabbitmq
    restart: unless-stopped
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER:-vaptpdv}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASS:-vaptpdv_secret}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - vaptpdv-net
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 20s

  # ==========================================================================
  # CAMADA DE APLICAÇÃO (PDV CORE + 3 MICROSSERVIÇOS COMPLEMENTARES)
  # ==========================================================================
  pdv-core:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: vaptpdv-core-api
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      LOG_LEVEL: info
      DATABASE_URL: "postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres_secret}@postgres-core:5432/vaptpdv_db?schema=public"
      KDS_SERVICE_URL: "http://kds-service:3001"
      FIDELIDADE_SERVICE_URL: "http://fidelidade-service:3002"
      ANALYTICS_SERVICE_URL: "http://analytics-bi-service:3003"
      RABBITMQ_URL: "amqp://${RABBITMQ_USER:-vaptpdv}:${RABBITMQ_PASS:-vaptpdv_secret}@rabbitmq:5672"
      RABBITMQ_EXCHANGE: "vaptpdv.eventos"
    depends_on:
      postgres-core:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - vaptpdv-net

  kds-service:
    build:
      context: ./services/kds-service
      dockerfile: Dockerfile
    container_name: vaptpdv-kds-service
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      LOG_LEVEL: info
      DATABASE_URL: "postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres_secret}@postgres-core:5432/kds_db?schema=public"
      RABBITMQ_URL: "amqp://${RABBITMQ_USER:-vaptpdv}:${RABBITMQ_PASS:-vaptpdv_secret}@rabbitmq:5672"
      RABBITMQ_EXCHANGE: "vaptpdv.eventos"
    depends_on:
      postgres-core:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - vaptpdv-net

  fidelidade-service:
    build:
      context: ./services/fidelidade-service
      dockerfile: Dockerfile
    container_name: vaptpdv-fidelidade-service
    restart: unless-stopped
    ports:
      - "3002:3002"
    environment:
      NODE_ENV: production
      PORT: 3002
      LOG_LEVEL: info
      DATABASE_URL: "postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres_secret}@postgres-core:5432/fidelidade_db?schema=public"
      RABBITMQ_URL: "amqp://${RABBITMQ_USER:-vaptpdv}:${RABBITMQ_PASS:-vaptpdv_secret}@rabbitmq:5672"
      RABBITMQ_EXCHANGE: "vaptpdv.eventos"
    depends_on:
      postgres-core:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - vaptpdv-net

  analytics-bi-service:
    build:
      context: ./services/analytics-bi-service
      dockerfile: Dockerfile
    container_name: vaptpdv-analytics-service
    restart: unless-stopped
    ports:
      - "3003:3003"
    environment:
      NODE_ENV: production
      PORT: 3003
      LOG_LEVEL: info
      DATABASE_URL: "postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres_secret}@postgres-core:5432/analytics_db?schema=public"
      RABBITMQ_URL: "amqp://${RABBITMQ_USER:-vaptpdv}:${RABBITMQ_PASS:-vaptpdv_secret}@rabbitmq:5672"
      RABBITMQ_EXCHANGE: "vaptpdv.eventos"
    depends_on:
      postgres-core:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - vaptpdv-net

networks:
  vaptpdv-net:
    driver: bridge

volumes:
  pgdata_core:
  rabbitmq_data:
```

---

### 4.3. Roteiro Prático para Comprovar Persistência de Dados (Exigência do Módulo 3)

Durante a avaliação do Módulo 3, é obrigatório demonstrar que a destruição e recriação dos containers não apaga os produtos, usuários, comandas ou saldos de estoque cadastrados:

```bash
# 1. Subir toda a pilha em background construindo as imagens
docker compose up -d --build

# 2. Verificar que todos os containers estão 'healthy' / 'running'
docker compose ps

# 3. Cadastrar um produto e um usuário via API (dados gravados no volume pgdata_core)
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome": "Garçom Teste Volume", "perfil": "garcom"}'

# 4. Derrubar e remover todos os containers e a rede virtual (SEM usar -v)
docker compose down

# 5. Subir novamente os containers
docker compose up -d

# 6. Consultar a API e comprovar que o registro permanece intacto
curl -s http://localhost:3000/usuarios | grep "Garçom Teste Volume"
```

---

## 5. Análises Comparativas Técnicas (Exigência dos Módulos 3 e 4)

### 5.1. Deploy Direto na VM (IaaS / PM2) vs. Deploy via Containers (Docker)

Esta análise compara a experiência prática de operar o VaptPDV diretamente no sistema operacional da instância AWS EC2 (Módulos 1 e 2) frente à operação conteinerizada com Docker e Docker Compose (Módulos 3 e 4).

| Dimensão de Análise | Deploy Direto na VM (IaaS + Node/PM2 + PostgreSQL Nativo) | Deploy Baseado em Containers (Docker + Docker Compose) |
| :--- | :--- | :--- |
| **Configuração Inicial e Provisionamento** | **Alta fricção manual.** Exige instalar manualmente o repositório NodeSource, versão exata do Node.js, pacotes de sistema (`build-essential`, `openssl`), configurar `pg_hba.conf` do PostgreSQL e registrar o `systemd` do PM2. | **Declarativo e automatizado.** A VM requer apenas o Docker Engine instalado. Um único comando (`docker compose up -d --build`) instancia runtime, bancos, broker e rede na versão exata. |
| **Portabilidade e Paridade Dev/Prod** | **Baixa.** Sujeito ao problema *"funciona na minha máquina"* por diferenças entre Windows (dev local) e Ubuntu Linux (EC2), versões de `glibc`, OpenSSL do Prisma ou variáveis de ambiente globais. | **Máxima.** A imagem construída a partir do `Dockerfile` (`node:20-alpine`) embute exatamente a mesma árvore de dependências, binários do Prisma Engine e sistema de arquivos em qualquer host. |
| **Isolamento de Recursos e Dependências** | **Fraco.** Todos os serviços compartilham o mesmo *userspace* do sistema operacional, mesma versão global do Node.js e disputam portas e variáveis diretamente no host. | **Forte.** Cada microsserviço roda em seu próprio *namespace* de processos, sistema de arquivos (`overlayfs`) e interface de rede virtual (`vaptpdv-net`), permitindo limitar CPU/RAM individualmente. |
| **Consumo de Recursos (Overhead)** | **Mínimo.** Não há camada de virtualização de rede bridge do Docker nem múltiplos daemons; ideal quando a VM possui apenas 1 GB de RAM (`t2.micro`). | **Leve a Moderado.** Containers compartilham o kernel Linux do host (muito mais leves que VMs tradicionais), mas cada container adiciona ~25–40 MB de footprint base e overhead de NAT na rede bridge. |
| **Escalabilidade Horizontal e Rollback** | **Complexa e propensa a erro.** Escalar ou reverter uma versão exige `git checkout`, `npm install`, `npm run build` no próprio servidor em produção, causando janela de instabilidade. | **Imediata e Imutável.** Escalar instâncias (`docker compose up --scale`) ou voltar para uma tag anterior de imagem (`vaptpdv-core:entrega-2`) ocorre em segundos sem recompilar código em produção. |

**Conclusão Arquitetural para o VaptPDV:**  
No **Módulo 1** (monolito modular), o deploy direto com PM2 foi produtivo por exigir menos abstrações iniciais. Contudo, a partir do **Módulo 2 e 3**, com 4 serviços HTTP independentes, múltiplos esquemas de banco e o broker RabbitMQ, a manutenção manual via PM2 torna-se frágil e difícil de reproduzir. O **Docker Compose** eliminou desvios de configuração entre os desenvolvedores e transformou o processo de deploy na AWS EC2 em uma operação determinística de comando único.

---

### 5.2. Mensageria com Filas (RabbitMQ / AMQP) vs. Streaming de Eventos (Apache Kafka / Redpanda)

No **Módulo 4**, escolheu-se o **RabbitMQ (AMQP 0-9-1)** como backbone de comunicação assíncrona. A tabela a seguir fundamenta tecnicamente essa decisão em comparação a plataformas de *Event Streaming* distribuído como **Apache Kafka** (ou **Redpanda**).

| Critério Técnico | Mensageria Baseada em Filas (RabbitMQ / AMQP 0-9-1) | Streaming de Log Distribuído (Apache Kafka / Redpanda) |
| :--- | :--- | :--- |
| **Modelo Arquitetural** | *Smart Broker / Dumb Consumer*. O broker gerencia roteamento rico via *Exchanges* (`direct`, `topic`, `fanout`), controle de entrega por mensagem, retentativas, TTL e *Dead Letter Queues* (DLQ) nativas. | *Dumb Broker / Smart Consumer*. Log distribuído *append-only* particionado em disco; consumidores controlam seu próprio *offset* de leitura. |
| **Semântica de Consumo e Retenção** | **Fila transitória orientada a tarefas/eventos:** a mensagem é removida da fila assim que o consumidor confirma o processamento (`basic.ack`). | **Retenção baseada em tempo/tamanho:** os eventos permanecem gravados em disco por dias ou semanas mesmo após serem lidos, permitindo *Event Replay* histórico completo. |
| **Roteamento e Flexibilidade** | **Altíssima.** Com uma única Topic Exchange (`vaptpdv.eventos`), o RabbitMQ entrega seletivamente `item.lancado` ao KDS, `comanda.paga` a Produtos e Fidelidade, e `#` (todos os eventos) ao serviço de Analytics. | **Por Tópico/Partição.** Não possui roteamento por curinga de *routing key* dentro de um tópico; exige criar múltiplos tópicos ou filtrar mensagens no código do consumidor. |
| **Garantia de Ordem** | Ordem FIFO preservada por fila única; com múltiplos *workers* concorrentes (`prefetch > 1`) e reentrega (`nack`), a ordem pode variar, exigindo idempotência no consumidor. | Ordem estritamente garantida dentro de uma mesma **Partição** usando uma chave de particionamento (ex.: `comanda_id`). |
| **Latência e Throughput** | Latência **sub-milissegundo a poucos milissegundos**, ideal para dezenas de milhares de msg/s — mais que suficiente para PDVs de bares e restaurantes. | Projetado para **centenas de milhares a milhões de eventos/segundo** (telemetria massiva, IoT, clickstream). |
| **Custo Operacional na AWS EC2** | **Muito baixo (~100–180 MB de RAM)** na imagem `rabbitmq:3.13-management-alpine`. Roda confortavelmente na mesma instância EC2 da disciplina. | **Alto no Kafka tradicional** (JVM pesada + KRaft, exigindo tipicamente $\ge 2$ GB de RAM só para o broker). |

**Conclusão Aplicada ao Cenário VaptPDV:**  
Para o domínio de um PDV de bar e lanchonete, as necessidades primordiais são **baixa latência ponta a ponta** (uma ficha de bebida lançada pelo garçom deve aparecer no monitor do bar imediatamente), **roteamento flexível por tópico** (`item.lancado`, `comanda.paga`, `estoque.movimentado`), **confirmação individual com Dead Letter Queue automática** para não perder baixas de estoque e **baixo consumo de memória na VM AWS EC2**. O **RabbitMQ** atende a todos esses requisitos com excelência e simplicidade operacional. O **Apache Kafka** só se justificaria caso o VaptPDV evoluísse para uma plataforma SaaS multi-tenant nacional processando milhões de comandas simultâneas ou precisasse reprocessar todo o histórico de eventos desde o início da operação (*Event Sourcing / Replay*).

---

## 6. Tabela de Monitoramento e Troubleshooting Operacional

| Sintoma Observado | Causa Mais Provável | Diagnóstico Rápido | Ação Corretiva Passo a Passo |
| :--- | :--- | :--- | :--- |
| **`GET /health` retorna `503 SERVICO_INDISPONIVEL`** | O serviço PostgreSQL está parado, credenciais no `.env` estão incorretas ou o banco `vaptpdv_db` não foi criado. | `sudo systemctl status postgresql` (IaaS) ou `docker compose logs postgres-core` (Docker). | 1. Inicie o banco (`sudo systemctl start postgresql` ou `docker compose restart postgres-core`).<br>2. Verifique `DATABASE_URL` no `.env`.<br>3. Execute `npm run prisma:deploy`. |
| **Timeout ao acessar `http://<IP_EC2>:3000` pelo navegador/Postman** | Porta `3000` bloqueada no **Security Group** da AWS EC2 ou processo parado no PM2/Docker. | Conecte via SSH e teste localmente: `curl -i http://localhost:3000/health`. | Se funcionar via `localhost`, acesse o Console AWS $\rightarrow$ EC2 $\rightarrow$ Security Groups $\rightarrow$ Inbound Rules e libere `Custom TCP 3000` para `0.0.0.0/0`. |
| **PM2 exibe status `errored` ou reinicializações em loop** | O comando `npm run build` não foi executado (`dist/server.js` ausente) ou variável obrigatória ausente no `.env`. | `pm2 logs vaptpdv-api --lines 50` | 1. Execute `npm run build`.<br>2. Verifique se o `.env` existe na raiz.<br>3. Reinicie com `pm2 restart vaptpdv-api`. |
| **Erro `409 MESA_OCUPADA` ao tentar abrir comanda em mesa aparentemente livre** | Já existe uma comanda com `status = "aberta"` para aquela mesa (garantido pelo índice único parcial no banco). | `GET /comandas?mesa=12&status=aberta` | Feche e pague a comanda aberta existente na mesa ou cancele-a via `POST /comandas/:id/cancelar` caso tenha sido aberta por engano. |
| **Erro `503 SERVICO_INDISPONIVEL` ao abrir comanda ou lançar item (Módulo 2+)** | O `usuarios-service`, `produtos-service` ou `kds-service` está fora do ar ou com URL incorreta configurada. | Verifique `detalhes.servico` no JSON de erro retornado pela API e consulte `docker compose ps`. | Suba o serviço dependente (`docker compose up -d <servico>`) e valide seu `/health` individual nas portas `3001..3003`. |
| **Eventos `comanda.paga` não baixam estoque no Módulo 4** | Consumidor desconectado do RabbitMQ ou mensagens rejeitadas e enviadas para a Dead Letter Queue (`.dlq`). | Acesse o RabbitMQ Management em `http://<IP_EC2>:15672` $\rightarrow$ aba **Queues** e verifique `produtos.comanda.paga` e `produtos.comanda.paga.dlq`. | 1. Inspecione os logs do consumidor (`docker compose logs pdv-core`).<br>2. Corrija a causa raiz e reencaminhe (*Move messages*) da `.dlq` para a fila principal pelo painel do RabbitMQ. |
| **Erro `PrismaClientInitializationError` dentro do container Alpine** | Biblioteca `openssl` ausente na imagem `node:20-alpine` ou `prisma generate` não executado no build. | `docker compose logs pdv-core` | Certifique-se de que o `Dockerfile` contém `RUN apk add --no-cache openssl` nos estágios `builder` e `runner` e reconstrua com `docker compose up -d --build`. |
