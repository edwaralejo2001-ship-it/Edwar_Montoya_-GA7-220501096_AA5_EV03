const pool = require('../config/database');
const { AppError, validateNonNegativeInteger } = require('./errors');

async function getInventory() {
  const [rows] = await pool.execute(
    `SELECT p.id, p.sku, p.name, c.name AS category, p.stock, p.min_stock, p.sale_price, p.active
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.active = 1 ORDER BY p.name`
  );
  return rows;
}

async function getLowStock(input = {}) {
  const threshold = input.threshold === undefined
    ? null
    : validateNonNegativeInteger(input.threshold, 'El umbral');
  const [rows] = await pool.execute(
    `SELECT id, sku, name, stock, min_stock
     FROM products
     WHERE active = 1 AND stock <= ${threshold === null ? 'min_stock' : '?'}
     ORDER BY stock, name`,
    threshold === null ? [] : [threshold]
  );
  return rows;
}

async function getSales(input = {}) {
  const from = input.from || null;
  const to = input.to || null;
  if ((from && Number.isNaN(Date.parse(from))) || (to && Number.isNaN(Date.parse(to)))) {
    throw new AppError('"from" y "to" deben ser fechas válidas (YYYY-MM-DD).');
  }
  if (from && to && from > to) throw new AppError('"from" no puede ser posterior a "to".');
  const conditions = [];
  const values = [];
  if (from) {
    conditions.push('s.created_at >= ?');
    values.push(`${from} 00:00:00`);
  }
  if (to) {
    conditions.push('s.created_at < DATE_ADD(?, INTERVAL 1 DAY)');
    values.push(`${to} 00:00:00`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute(
    `SELECT s.id AS sale_id, s.total, s.created_at,
            si.product_id, p.name AS product, si.quantity, si.unit_price, si.subtotal
     FROM sales s JOIN sale_items si ON si.sale_id = s.id
     JOIN products p ON p.id = si.product_id
     ${where}
     ORDER BY s.created_at DESC, s.id, si.id`,
    values
  );
  return rows;
}

module.exports = { getInventory, getLowStock, getSales };
