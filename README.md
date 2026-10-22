# VaptPDV — Sistema Distribuído de Ponto de Venda

> **Projeto Incremental da 3ª Unidade — Sistemas Distribuídos (DCC / UERN)**  
> **Módulo 1:** Computação em Nuvem IaaS (AWS EC2 + PostgreSQL Nativo)  
> **Tag de Entrega:** `entrega-1-cloud`  
> **Autores:** Kaio França e Mateus Neri  
> **Docentes:** Profa. Dra. Glaucia Melissa e Profa. Ma. Luiziane Paulino dos Santos

---

## 📌 Evidências de Entrega do Módulo 1 (Nuvem IaaS)

| Item de Avaliação | Informação / Link de Acesso |
| :--- | :--- |
| **URL Pública da Aplicação (AWS EC2)** | `http://<IP_PUBLICO_EC2>:3000` *(substitua pelo IP público atribuído na instância)* |
| **Documentação Interativa OpenAPI / Swagger** | `http://<IP_PUBLICO_EC2>:3000/docs` |
| **Health Check da Aplicação e Banco** | `http://<IP_PUBLICO_EC2>:3000/health` |
| **Vídeo de Demonstração (YouTube)** | `[Vídeo de Demonstração do Módulo 1 — Link do YouTube](https://youtu.be/SEU_VIDEO_AQUI)` |
| **Tag de Versão Git** | [`entrega-1-cloud`](https://github.com/<seu-usuario>/vapt-pdv/tree/entrega-1-cloud) |
| **Documentação de Engenharia (SRS, C4, Contratos)** | [`docs/engenharia/README.md`](docs/engenharia/README.md) |

---

## 🏛️ Justificativa Técnica das Escolhas Arquiteturais

Conforme exigido pelos critérios de avaliação da disciplina (10% da nota), detalhamos as decisões de engenharia adotadas:

1. **Fastify no lugar de Express:**
   - O Fastify oferece desempenho superior e possui validação estrita baseada em JSON Schema em tempo de execução via **TypeBox**.
   - Isso garante validação automática de payloads com resposta padronizada de erro e custo de parse quase nulo.

2. **TypeScript em Todo o Projeto:**
   - Tipagem estática fim a fim reduz drasticamente bugs de runtime, garante aderência estrita aos contratos de API e facilita refatorações seguras entre os módulos da aplicação.

3. **Prisma ORM e Padrão Monetário com `Decimal` (Ponto Fixo):**
   - **Regra Absoluta:** O sistema proíbe o tipo `Float` ou `number` para campos financeiros. Números com ponto flutuante binário sofrem de erros de representação (ex: `0.1 + 0.2 = 0.30000000000000004`), inaceitáveis em PDVs fiscais e comerciais.
   - Todos os preços, taxas e subtotais utilizam `Decimal(10, 2)` mapeados pelo Prisma para o tipo `DECIMAL/NUMERIC` do PostgreSQL e serializados como strings com exatamente 2 casas decimais na API.

4. **Snapshot Pattern no Lançamento de Itens (`RN04`):**
   - Ao lançar um produto na comanda, o sistema copia (`snapshot`) o nome e o preço unitário vigentes naquele instante para o registro do item.
   - Isso blinda as comandas abertas ou fechadas contra alterações futuras no cardápio de produtos.

5. **Índice Único Parcial para Mesa Aberta (`RN07`):**
   - A garantia de que uma mesa só pode ter uma comanda aberta simultaneamente não depende apenas de checagem condicional na aplicação.
   - O banco de dados PostgreSQL impõe a restrição através de um índice único condicional:
     ```sql
     CREATE UNIQUE INDEX "comandas_mesa_aberta_unique_idx" ON "comandas"("mesa") WHERE "status" = 'aberta';
     ```

6. **Arquitetura em Camadas (Layered) com Isolamento de Fronteiras:**
   - Os módulos (`usuarios`, `produtos`, `comandas`) são organizados internamente nas camadas **Controller** (Web/HTTP), **Service** (Regras de Negócio) e **Repository** (Persistência com Prisma).
   - O módulo de comandas nunca acessa as tabelas do Prisma de usuários ou produtos diretamente; o acesso ocorre estritamente por interfaces de serviço, antecipando a migração para microsserviços no Módulo 2.

7. **Deploy em Nuvem IaaS sem Contêineres:**
   - Atendendo à especificação do Módulo 1 da disciplina, a publicação é feita diretamente em máquina virtual AWS EC2 rodando Ubuntu Server, com PostgreSQL nativo na VM e supervisão de processo via **PM2**.

---

## 🚀 Como Executar o Projeto do Zero (Ambiente Local)

### 1. Pré-Requisitos
- **Node.js** `>=20.x` (verifique com `node -v`; o projeto inclui `.nvmrc`)
- **PostgreSQL** instalado e em execução (localmente ou via VM)
- **Git**

### 2. Instalação e Execução

```bash
# 1. Clonar o repositório
git clone https://github.com/<seu-usuario>/vapt-pdv.git
cd vapt-pdv

# 2. Instalar dependências
npm install
# (No Windows PowerShell, use npm.cmd se houver restrição de script)

# 3. Configurar variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env` gerado configurando a string de conexão para a sua instância PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/vaptpdv_db?schema=public"
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

Execute as migrações determinísticas do banco e gere o Prisma Client:
```bash
# 4. Criar o banco e aplicar migrações estruturais
npm run prisma:migrate

# 5. Gerar os clientes de banco do Prisma
npm run prisma:generate
```

### 3. Execução dos Testes Automatizados

O projeto conta com **135 testes automatizados** (unitários e integração de endpoints):

```bash
# Executar a suíte de testes completa
npm test

# Executar checagem estática de tipos TypeScript
npm run typecheck
```

### 4. Inicialização do Servidor

```bash
# Modo de desenvolvimento (com hot-reload)
npm run dev

# Ou modo de produção compilado:
npm run build
npm start
```

Após iniciar, o terminal indicará o servidor ativo na porta configurada:
- **API Base:** `http://localhost:3000`
- **Health Check:** `http://localhost:3000/health`
- **Documentação OpenAPI / Swagger UI:** `http://localhost:3000/docs`

---

## ☁️ Guia de Deploy em Nuvem IaaS (AWS EC2)

1. **Provisionamento da Instância:**
   - **AMI:** Ubuntu Server 22.04 LTS ou 24.04 LTS (`t2.micro` ou `t3.small`).
   - **Security Group (Regras de Entrada):**
     - Porta `22` (SSH) restrita ao seu IP.
     - Porta `3000` (Custom TCP) liberada para `0.0.0.0/0` (API e Swagger).
     - *Atenção:* Manter porta `5432` do PostgreSQL fechada para a internet.

2. **Instalação da Stack na VM (via SSH):**
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git build-essential postgresql postgresql-contrib
   sudo npm install -g pm2
   sudo systemctl enable postgresql && sudo systemctl start postgresql
   ```

3. **Criação do Banco na VM:**
   ```bash
   sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'senha_forte_producao';"
   sudo -u postgres psql -c "CREATE DATABASE vaptpdv_db OWNER postgres;"
   ```

4. **Deploy e Inicialização da Aplicação:**
   ```bash
   git clone https://github.com/<seu-usuario>/vapt-pdv.git
   cd vapt-pdv
   npm install
   cp .env.example .env
   # Configure DATABASE_URL="postgresql://postgres:senha_forte_producao@localhost:5432/vaptpdv_db?schema=public" no .env
   npm run prisma:deploy
   npm run build
   pm2 start dist/server.js --name "vaptpdv-api"
   pm2 startup
   pm2 save
   ```

---

## 🧪 Roteiro de Testes cURL (Ciclo Completo do PDV)

Execute os comandos abaixo substituindo `http://localhost:3000` pelo IP público da AWS (`http://<IP_EC2>:3000`):

```bash
# 1. Health Check
curl -X GET http://localhost:3000/health

# 2. Cadastrar Garçom
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome": "Carlos Garçom", "perfil": "garcom"}'

# 3. Cadastrar Produtos com Estoque e Preço Decimal
curl -X POST http://localhost:3000/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome": "Cerveja Pilsen 600ml", "preco": "14.50", "estoque": 40, "estoque_minimo": 10}'

curl -X POST http://localhost:3000/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome": "Burger da Casa", "preco": "28.00", "estoque": 25, "estoque_minimo": 5}'

# 4. Abrir Comanda na Mesa 10 com Garçom ID 1
curl -X POST http://localhost:3000/comandas \
  -H "Content-Type: application/json" \
  -d '{"mesa": 10, "garcom_id": 1}'

# 5. Prova de Bloqueio de Mesa Ocupada (RN07 - Retorna 409 MESA_OCUPADA)
curl -X POST http://localhost:3000/comandas \
  -H "Content-Type: application/json" \
  -d '{"mesa": 10, "garcom_id": 1}'

# 6. Lançar 2 Cervejas na Comanda ID 1 (Snapshot de Preço Histórico)
curl -X POST http://localhost:3000/comandas/1/itens \
  -H "Content-Type: application/json" \
  -d '{"produto_id": 1, "quantidade": 2}'

# 7. Fechar Comanda com Taxa de Serviço de 10%
curl -X POST http://localhost:3000/comandas/1/fechar \
  -H "Content-Type: application/json" \
  -d '{"aplicar_taxa_servico": true}'

# 8. Pagar Comanda via PIX (Gera baixa atômica de estoque e torna comanda imutável)
curl -X POST http://localhost:3000/comandas/1/pagar \
  -H "Content-Type: application/json" \
  -d '{"forma_pagamento": "pix", "documento_cliente": "123.456.789-00"}'

# 9. Conferir Baixa de Estoque do Produto (Estoque de cerveja cai de 40 para 38)
curl -X GET http://localhost:3000/produtos/1
```

---

## 🏷️ Instruções para Geração da Tag Git de Entrega

Para submeter formalmente a entrega da 3ª Unidade (Módulo 1):

```bash
# 1. Enviar os commits da branch
git push origin develop

# 2. Criar a tag oficial anotada
git tag -a entrega-1-cloud -m "Entrega do Modulo 1: Nuvem IaaS na AWS EC2 com PostgreSQL nativo"

# 3. Enviar a tag para o repositório remoto no GitHub
git push origin entrega-1-cloud
```
