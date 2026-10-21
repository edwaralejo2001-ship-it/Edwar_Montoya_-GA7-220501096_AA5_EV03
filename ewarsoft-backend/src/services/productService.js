const pool = require('../config/database');
const {
  AppError,
  validateNonNegativeInteger,
  validateNonNegativeNumber,
  validatePositiveInteger,
  validateText
} = require('./errors');

async function createProduct(input) {
  const sku = validateText(input.sku, 'El SKU', 50);
  const name = validateText(input.name, 'El nombre', 150);
  const categoryId = validatePositiveInteger(input.category_id, 'La categoría');
  const supplierId = input.supplier_id === undefined || input.supplier_id === null || input.supplier_id === ''
    ? null
    : validatePositiveInteger(input.supplier_id, 'El proveedor');
  const purchasePrice = validateNonNegativeNumber(input.purchase_price, 'El precio de compra');
  const salePrice = validateNonNegativeNumber(input.sale_price, 'El precio de venta');
  const minStock = input.min_stock === undefined ? 0 : validateNonNegativeInteger(input.min_stock, 'El stock mínimo');
  const description = input.description === undefined ? null : String(input.description).trim();

  const [result] = await pool.execute(
    `INSERT INTO products (sku, name, description, category_id, supplier_id, purchase_price, sale_price, min_stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [sku, name, description, categoryId, supplierId, purchasePrice, salePrice, minStock]
  );
  return getProductById({ id: result.insertId });
}

async function listProducts(input = {}) {
  const includeInactive = input.include_inactive === true;
  const [rows] = await pool.execute(
    `SELECT p.id, p.sku, p.name, p.description, p.category_id, c.name AS category,
            p.supplier_id, s.name AS supplier, p.purchase_price, p.sale_price,
            p.stock, p.min_stock, p.active, p.created_at, p.updated_at
     FROM products p
     JOIN categories c ON c.id = p.category_id
     LEFT JOIN suppliers s ON s.id = p.supplier_id
     ${includeInactive ? '' : 'WHERE p.active = 1'}
     ORDER BY p.id`
  );
  return rows;
}

async function getProductById(input) {
  const id = validatePositiveInteger(input.id, 'El ID del producto');
  const [rows] = await pool.execute(
    `SELECT p.id, p.sku, p.name, p.description, p.category_id, c.name AS category,
            p.supplier_id, s.name AS supplier, p.purchase_price, p.sale_price,
            p.stock, p.min_stock, p.active, p.created_at, p.updated_at
     FROM products p
     JOIN categories c ON c.id = p.category_id
     LEFT JOIN suppliers s ON s.id = p.supplier_id
     WHERE p.id = ?`,
    [id]
  );
  if (rows.length === 0) throw new AppError('Producto no encontrado.', 404);
  return rows[0];
}

async function updateProduct(input) {
  const id = validatePositiveInteger(input.id, 'El ID del producto');
  const fields = input.fields;
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new AppError('Envía un objeto "fields" con los datos que deseas actualizar.');
  }

  const allowed = {
    sku: value => validateText(value, 'El SKU', 50),
    name: value => validateText(value, 'El nombre', 150),
    description: value => value === null ? null : String(value).trim(),
    category_id: value => validatePositiveInteger(value, 'La categoría'),
    supplier_id: value => value === null || value === '' ? null : validatePositiveInteger(value, 'El proveedor'),
    purchase_price: value => validateNonNegativeNumber(value, 'El precio de compra'),
    sale_price: value => validateNonNegativeNumber(value, 'El precio de venta'),
    min_stock: value => validateNonNegativeInteger(value, 'El stock mínimo')
  };
  const entries = Object.entries(fields);
  if (entries.length === 0) throw new AppError('Debes enviar al menos un campo para actualizar.');

  const values = [];
  const assignments = entries.map(([key, value]) => {
    if (!Object.prototype.hasOwnProperty.call(allowed, key)) {
      throw new AppError(`El campo "${key}" no se puede actualizar.`);
    }
    values.push(allowed[key](value));
    return `${key} = ?`;
  });
  values.push(id);
  const [result] = await pool.execute(
    `UPDATE products SET ${assignments.join(', ')} WHERE id = ?`,
    values
  );
  return getProductById({ id });
}

async function deactivateProduct(input) {
  const id = validatePositiveInteger(input.id, 'El ID del producto');
  await pool.execute('UPDATE products SET active = 0 WHERE id = ?', [id]);
  await getProductById({ id });
  return { id, active: false };
}

module.exports = { createProduct, deactivateProduct, getProductById, listProducts, updateProduct };
