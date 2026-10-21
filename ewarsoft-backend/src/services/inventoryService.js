const pool = require('../config/database');
const { AppError, validatePositiveInteger } = require('./errors');

async function registerMovement(input, movementType) {
  const productId = validatePositiveInteger(input.product_id, 'El ID del producto');
  const quantity = validatePositiveInteger(input.quantity, 'La cantidad');
  const note = input.note === undefined ? null : String(input.note).trim();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [products] = await connection.execute(
      'SELECT id, stock, active FROM products WHERE id = ? FOR UPDATE',
      [productId]
    );
    if (products.length === 0) throw new AppError('Producto no encontrado.', 404);
    const product = products[0];
    if (!product.active) throw new AppError('No se puede mover inventario de un producto inactivo.', 409);
    if (movementType === 'EXIT' && product.stock < quantity) {
      throw new AppError(`Stock insuficiente. Existencias actuales: ${product.stock}.`, 409);
    }

    const change = movementType === 'ENTRY' ? quantity : -quantity;
    await connection.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [change, productId]);
    const [movement] = await connection.execute(
      'INSERT INTO inventory_movements (product_id, movement_type, quantity, note) VALUES (?, ?, ?, ?)',
      [productId, movementType, quantity, note]
    );
    await connection.commit();
    return {
      movement_id: movement.insertId,
      product_id: productId,
      movement_type: movementType,
      quantity,
      stock_before: product.stock,
      stock_after: product.stock + change
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { registerMovement };
