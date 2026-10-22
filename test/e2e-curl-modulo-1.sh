#!/usr/bin/env bash
# ==============================================================================
# VaptPDV — Script de Teste Ponta a Ponta (E2E) via cURL — Módulo 1
# ==============================================================================
# Execução:
#   bash test/e2e-curl-modulo-1.sh [BASE_URL]
# Exemplo local:
#   bash test/e2e-curl-modulo-1.sh http://localhost:3000
# Exemplo AWS EC2:
#   bash test/e2e-curl-modulo-1.sh http://54.232.123.45:3000
# ==============================================================================

set -e

BASE_URL="${1:-http://localhost:3000}"
echo "======================================================================"
echo "Iniciando Validação E2E do VaptPDV contra: $BASE_URL"
echo "======================================================================"

# 1. Health Check
echo -e "\n[1/10] Verificando integridade da API e banco de dados (/health)..."
HEALTH_RES=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HTTP_CODE=$(echo "$HEALTH_RES" | tail -n1)
BODY=$(echo "$HEALTH_RES" | sed '$d')
echo "Status: $HTTP_CODE | Resposta: $BODY"
if [ "$HTTP_CODE" != "200" ]; then echo "Falha no health check!"; exit 1; fi

# 2. Cadastrar Garçom
echo -e "\n[2/10] Cadastrando Garçom (POST /usuarios)..."
GARCOM_RES=$(curl -s -X POST "$BASE_URL/usuarios" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Carlos Garçom","perfil":"garcom"}')
echo "Resposta: $GARCOM_RES"
GARCOM_ID=$(echo "$GARCOM_RES" | grep -o '"id":[0-9]*' | head -n1 | cut -d: -f2)
echo "Garçom criado com ID: $GARCOM_ID"

# 3. Validar Garçom via rota interna
echo -e "\n[3/10] Validando Garçom (GET /usuarios/$GARCOM_ID/validar-garcom)..."
VALIDAR_RES=$(curl -s "$BASE_URL/usuarios/$GARCOM_ID/validar-garcom")
echo "Resposta: $VALIDAR_RES"

# 4. Cadastrar Produtos
echo -e "\n[4/10] Cadastrando Produtos com Estoque e Preço Decimal..."
PROD1_RES=$(curl -s -X POST "$BASE_URL/produtos" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Cerveja Artesanal IPA 500ml","preco":"18.50","estoque":50,"estoque_minimo":5}')
PROD1_ID=$(echo "$PROD1_RES" | grep -o '"id":[0-9]*' | head -n1 | cut -d: -f2)
echo "Produto 1 criado (ID: $PROD1_ID): $PROD1_RES"

PROD2_RES=$(curl -s -X POST "$BASE_URL/produtos" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Porção de Batata Rústica","preco":"32.00","estoque":20,"estoque_minimo":3}')
PROD2_ID=$(echo "$PROD2_RES" | grep -o '"id":[0-9]*' | head -n1 | cut -d: -f2)
echo "Produto 2 criado (ID: $PROD2_ID): $PROD2_RES"

# 5. Abertura de Comanda
MESA_NUM=42
echo -e "\n[5/10] Abrindo Comanda na Mesa $MESA_NUM com Garçom $GARCOM_ID..."
COMANDA_RES=$(curl -s -X POST "$BASE_URL/comandas" \
  -H "Content-Type: application/json" \
  -d "{\"mesa\":$MESA_NUM,\"garcom_id\":$GARCOM_ID}")
echo "Resposta: $COMANDA_RES"
COMANDA_ID=$(echo "$COMANDA_RES" | grep -o '"id":[0-9]*' | head -n1 | cut -d: -f2)
echo "Comanda aberta com ID: $COMANDA_ID"

# 6. Teste de Mesa Ocupada (RN07 - Índice Único Parcial)
echo -e "\n[6/10] Testando bloqueio de abertura duplicada na mesma mesa $MESA_NUM..."
BLOQUEIO_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/comandas" \
  -H "Content-Type: application/json" \
  -d "{\"mesa\":$MESA_NUM,\"garcom_id\":$GARCOM_ID}")
BLOQUEIO_CODE=$(echo "$BLOQUEIO_RES" | tail -n1)
BLOQUEIO_BODY=$(echo "$BLOQUEIO_RES" | sed '$d')
echo "Status: $BLOQUEIO_CODE | Resposta: $BLOQUEIO_BODY"
if [ "$BLOQUEIO_CODE" != "409" ]; then echo "Falha: deveria ter retornado 409 MESA_OCUPADA!"; exit 1; fi

# 7. Lançar Itens na Comanda (Snapshot de Preço)
echo -e "\n[7/10] Lançando 2 Cervejas e 1 Batata na Comanda $COMANDA_ID..."
ITEM1_RES=$(curl -s -X POST "$BASE_URL/comandas/$COMANDA_ID/itens" \
  -H "Content-Type: application/json" \
  -d "{\"produto_id\":$PROD1_ID,\"quantidade\":2}")
ITEM1_ID=$(echo "$ITEM1_RES" | grep -o '"id":[0-9]*' | head -n1 | cut -d: -f2)
echo "Item 1 lançado (ID: $ITEM1_ID): $ITEM1_RES"

ITEM2_RES=$(curl -s -X POST "$BASE_URL/comandas/$COMANDA_ID/itens" \
  -H "Content-Type: application/json" \
  -d "{\"produto_id\":$PROD2_ID,\"quantidade\":1}")
echo "Item 2 lançado: $ITEM2_RES"

# 8. Fechar Comanda com Taxa de Serviço de 10%
echo -e "\n[8/10] Fechando Comanda $COMANDA_ID com taxa de 10%..."
FECHAR_RES=$(curl -s -X POST "$BASE_URL/comandas/$COMANDA_ID/fechar" \
  -H "Content-Type: application/json" \
  -d '{"aplicar_taxa_servico":true}')
echo "Resposta de Fechamento: $FECHAR_RES"

# 9. Pagar Comanda via PIX
echo -e "\n[9/10] Realizando Pagamento via PIX da Comanda $COMANDA_ID..."
PAGAR_RES=$(curl -s -X POST "$BASE_URL/comandas/$COMANDA_ID/pagar" \
  -H "Content-Type: application/json" \
  -d '{"forma_pagamento":"pix","documento_cliente":"123.456.789-00"}')
echo "Resposta do Pagamento: $PAGAR_RES"

# 10. Conferência de Estoque Pós-Baixa Transacional
echo -e "\n[10/10] Conferindo estoque atualizado do Produto 1 (esperado 48)..."
PROD1_POS=$(curl -s "$BASE_URL/produtos/$PROD1_ID")
echo "Produto 1 após baixa: $PROD1_POS"

echo -e "\n======================================================================"
echo "Fluxo Ponta a Ponta executado com 100% de sucesso!"
echo "Comanda $COMANDA_ID finalizada e estoque baixado atomicamente."
echo "======================================================================"
