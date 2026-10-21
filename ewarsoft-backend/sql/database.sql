CREATE DATABASE IF NOT EXISTS ewarsoft
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ewarsoft;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS suppliers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  contact VARCHAR(150) NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sku VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(500) NULL,
  category_id INT UNSIGNED NOT NULL,
  supplier_id INT UNSIGNED NULL,
  purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  sale_price DECIMAL(12,2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  min_stock INT UNSIGNED NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_sku (sku),
  KEY idx_products_category (category_id),
  KEY idx_products_supplier (supplier_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sales (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  total DECIMAL(14,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sale_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sale_id BIGINT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(14,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_sale_items_sale (sale_id),
  KEY idx_sale_items_product (product_id),
  CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) REFERENCES sales (id),
  CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  movement_type ENUM('ENTRY', 'EXIT', 'SALE') NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  note VARCHAR(500) NULL,
  sale_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_movements_product_created (product_id, created_at),
  KEY idx_movements_sale (sale_id),
  CONSTRAINT fk_movements_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT fk_movements_sale FOREIGN KEY (sale_id) REFERENCES sales (id)
) ENGINE=InnoDB;
