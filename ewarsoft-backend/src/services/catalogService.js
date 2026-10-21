const pool = require('../config/database');
const { AppError, validateText } = require('./errors');

async function createCategory(input) {
  const name = validateText(input.name, 'El nombre de la categoría', 100);
  const description = input.description === undefined ? null : String(input.description).trim();
  const [[existing]] = await pool.execute(
    'SELECT id FROM categories WHERE name = ?',
    [name]
  );
  if (existing) throw new AppError(`Ya existe una categoría con el nombre "${name}".`, 409);
  const [result] = await pool.execute(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description]
  );
  return { id: result.insertId, name, description };
}

async function listCategories() {
  const [rows] = await pool.execute(
    'SELECT id, name, description, created_at FROM categories ORDER BY name'
  );
  return rows;
}

async function createSupplier(input) {
  const name = validateText(input.name, 'El nombre del proveedor', 150);
  const contact = input.contact === undefined ? null : String(input.contact).trim();
  const phone = input.phone === undefined ? null : String(input.phone).trim();
  const email = input.email === undefined ? null : String(input.email).trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('El correo del proveedor no tiene un formato válido.');
  }
  const [[existing]] = await pool.execute(
    'SELECT id FROM suppliers WHERE name = ?',
    [name]
  );
  if (existing) throw new AppError(`Ya existe un proveedor con el nombre "${name}".`, 409);
  const [result] = await pool.execute(
    'INSERT INTO suppliers (name, contact, phone, email) VALUES (?, ?, ?, ?)',
    [name, contact, phone, email]
  );
  return { id: result.insertId, name, contact, phone, email };
}

async function listSuppliers() {
  const [rows] = await pool.execute(
    'SELECT id, name, contact, phone, email, created_at FROM suppliers ORDER BY name'
  );
  return rows;
}

module.exports = { createCategory, createSupplier, listCategories, listSuppliers };
