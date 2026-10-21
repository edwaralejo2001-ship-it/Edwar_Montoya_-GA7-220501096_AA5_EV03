require('dotenv').config();

const app = require('./app');
const pool = require('./config/database');

const port = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await pool.query('SELECT 1');
    app.listen(port, () => console.log(`EwuarSoft API escuchando en http://localhost:${port}`));
  } catch (error) {
    console.error('No fue posible conectar con MySQL. Verifica el archivo .env y que MySQL esté activo:', error.message);
    process.exitCode = 1;
  }
}

startServer();
