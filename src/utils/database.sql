-- ============================
-- TABLE DES LISTES
-- ============================
CREATE TABLE shopping_lists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- TABLE DES MEMBRES DE LISTE
-- ============================
-- Un user appartient à UNE seule liste
-- Une liste peut avoir plusieurs users (DEMO)
CREATE TABLE shopping_list_members (
  list_id INT NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  PRIMARY KEY (list_id, user_id)
);

-- ============================
-- TABLE DES PRODUITS
-- ============================
-- Les produits appartiennent à une liste
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  list_id INT NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- TABLE DES ITEMS
-- ============================
-- Les items appartiennent à une liste
-- Chaque item pointe vers un produit de la même liste
CREATE TABLE shopping_list_items (
  id SERIAL PRIMARY KEY,
  list_id INT NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  to_buy BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- INSERTION DES 2 LISTES FIXES
-- ============================
INSERT INTO shopping_lists (name) VALUES ('DEMO');
INSERT INTO shopping_lists (name) VALUES ('FAMILLE');
