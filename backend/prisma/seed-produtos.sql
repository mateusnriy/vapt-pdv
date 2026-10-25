-- ============================================================
-- VaptPDV: Script de Carga Inicial de Produtos (Cardápio / PDV)
-- Banco de Dados: PostgreSQL (tabela "produtos")
-- ============================================================

BEGIN;

INSERT INTO "produtos" ("nome", "categoria", "preco", "estoque", "estoque_minimo", "ativo", "criado_em", "atualizado_em")
VALUES
  -- 🍔 LANCHES
  ('X-Burger Artesanal', 'Lanches', 28.00, 45, 10, true, NOW(), NOW()),
  ('X-Bacon Especial', 'Lanches', 34.00, 35, 10, true, NOW(), NOW()),
  ('Smash Burger Duplo', 'Lanches', 32.00, 40, 10, true, NOW(), NOW()),
  ('Sanduíche de Frango Crocante', 'Lanches', 26.00, 30, 8, true, NOW(), NOW()),
  ('Burger Vegetariano de Grão de Bico', 'Lanches', 29.00, 20, 5, true, NOW(), NOW()),

  -- 🍟 PORÇÕES & PETISCOS
  ('Batata Frita Rústica', 'Porções', 24.00, 60, 15, true, NOW(), NOW()),
  ('Batata com Cheddar e Bacon', 'Porções', 32.00, 45, 10, true, NOW(), NOW()),
  ('Isca de Peixe c/ Molho Tártaro', 'Porções', 48.00, 25, 5, true, NOW(), NOW()),
  ('Frango a Passarinho Crocante', 'Porções', 38.00, 30, 8, true, NOW(), NOW()),
  ('Pastelzinho Misto (6 unidades)', 'Porções', 22.00, 40, 10, true, NOW(), NOW()),
  ('Caldinho de Feijão com Bacon', 'Porções', 14.00, 50, 10, true, NOW(), NOW()),

  -- 🍺 BEBIDAS
  ('Chopp Artesanal Pilsen 500ml', 'Bebidas', 14.00, 120, 30, true, NOW(), NOW()),
  ('Chopp Artesanal IPA 500ml', 'Bebidas', 17.00, 80, 20, true, NOW(), NOW()),
  ('Cerveja Long Neck Heineken 330ml', 'Bebidas', 12.00, 96, 24, true, NOW(), NOW()),
  ('Refrigerante Coca-Cola Lata 350ml', 'Bebidas', 6.00, 150, 30, true, NOW(), NOW()),
  ('Refrigerante Guaraná Antarctica Lata', 'Bebidas', 6.00, 120, 24, true, NOW(), NOW()),
  ('Suco Natural de Laranja 400ml', 'Bebidas', 9.00, 40, 10, true, NOW(), NOW()),
  ('Água Mineral sem Gás 500ml', 'Bebidas', 4.50, 100, 20, true, NOW(), NOW()),
  ('Água Mineral com Gás 500ml', 'Bebidas', 5.00, 80, 20, true, NOW(), NOW()),

  -- 🍨 SOBREMESAS
  ('Pudim de Leite Tradicional', 'Sobremesas', 12.00, 25, 5, true, NOW(), NOW()),
  ('Brownie com Sorvete de Baunilha', 'Sobremesas', 18.00, 30, 8, true, NOW(), NOW()),
  ('Petit Gâteau de Chocolate', 'Sobremesas', 22.00, 20, 5, true, NOW(), NOW()),

  -- 🎁 COMBOS
  ('Combo Burger + Fritas + Refri', 'Combos', 42.00, 30, 5, true, NOW(), NOW()),
  ('Combo Petisco + 2 Chopps', 'Combos', 65.00, 20, 5, true, NOW(), NOW());

COMMIT;
