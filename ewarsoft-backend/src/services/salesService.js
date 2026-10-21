const pool = require('../config/database');
const { AppError, validatePositiveInteger } = require('./errors');

async function createSale(input) {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new AppError('La venta debe incluir al menos un producto en "items".');
  }

  const quantitiesById = new Map();
  for (const item of input.items) {
    const id = validatePositiveInteger(item.product_id, 'El ID del producto');
    const quantity = validatePositiveInteger(item.quantity, 'La cantidad');
    quantitiesById.set(id, (quantitiesById.get(id) || 0) + quantity);
  }
  const productIds = [...quantitiesById.keys()].sort((a, b) => a - b);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const placeholders = productIds.map(() => '?').join(', ');
    const [products] = await connection.execute(
      `SELECT id, name, sale_price, stock, active FROM products
       WHERE id IN (${placeholders}) ORDER BY id FOR UPDATE`,
      productIds
    );
    const productsById = new Map(products.map(product => [product.id, product]));
    if (products.length !== productIds.length) throw new AppError('Uno o más productos de la venta no existen.', 404);

    const saleLines = productIds.map(id => {
      const product = productsById.get(id);
      const quantity = quantitiesById.get(id);
      if (!product.active) throw new AppError(`El producto "${product.name}" está inactivo.`, 409);
      if (product.stock < quantity) {
        throw new AppError(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}; solicitado: ${quantity}.`, 409);
      }
      return {
        product_id: id,
        name: product.name,
        quantity,
        unit_price: Number(product.sale_price),
        subtotal: Number((Number(product.sale_price) * quantity).toFixed(2))
      };
    });
    const total = Number(saleLines.reduce((sum, line) => sum + line.subtotal, 0).toFixed(2));
    const [sale] = await connection.execute('INSERT INTO sales (total) VALUES (?)', [total]);

    for (const line of saleLines) {
      await connection.execute(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [sale.insertId, line.product_id, line.quantity, line.unit_price, line.subtotal]
      );
      await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [line.quantity, line.product_id]);
      await connection.execute(
        `INSERT INTO inventory_movements (product_id, movement_type, quantity, note, sale_id)
         VALUES (?, 'SALE', ?, ?, ?)`,
        [line.product_id, line.quantity, `Venta #${sale.insertId}`, sale.insertId]
      );
    }

    await connection.commit();
    return { sale_id: sale.insertId, total, items: saleLines };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { createSale };
