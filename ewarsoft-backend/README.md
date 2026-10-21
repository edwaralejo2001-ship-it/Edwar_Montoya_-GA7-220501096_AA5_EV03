# EwuarSoft - API backend

Backend para el inventario y las ventas de **Tienda y Licores La Farra**. Está construido con Node.js, Express y MySQL. No incluye frontend; las solicitudes se pueden probar con Postman.

## 1. Requisitos

- Node.js 18 o superior y npm.
- MySQL 8 o compatible.
- Postman (opcional, para probar manualmente).

## 2. Crear y configurar la base de datos

1. Abre MySQL Workbench o una consola de MySQL.
2. Ejecuta el contenido de [`sql/database.sql`](./sql/database.sql). Este script crea la base de datos `ewarsoft` y sus tablas: `categories`, `suppliers`, `products`, `sales`, `sale_items` e `inventory_movements`.
3. En una terminal, entra a la carpeta `ewarsoft-backend` y ejecuta:

   ```bash
   npm install
   ```

4. Copia `.env.example` como `.env` y completa la configuración local. Por ejemplo, cambia `DB_USER`, `DB_PASSWORD` y `DB_NAME` según tu instalación de MySQL. No subas `.env` a GitHub.
5. Inicia el servidor:

   ```bash
   npm run dev
   ```

   Para usarlo sin recarga automática: `npm start`.

La API queda disponible en `http://localhost:3000`. `GET http://localhost:3000/health` es una comprobación técnica; todas las operaciones de negocio se realizan con `POST`.

## 3. Convenciones para Postman

- URL base: `http://localhost:3000/api`.
- Método para todas las operaciones de negocio: `POST`.
- En **Headers**, agrega `Content-Type` con valor `application/json`.
- En **Body**, selecciona **raw** y **JSON**.
- Las solicitudes correctas devuelven `{ "success": true, "message": "...", "data": ... }`.
- Los errores devuelven `{ "success": false, "error": "..." }` y el código HTTP correspondiente.
- Los importes son calculados/leídos por el backend; el cliente no envía el total de una venta.
- Al crear productos, registra primero una categoría y usa el `id` recibido. El stock inicial es cero: utiliza una entrada de inventario para aumentarlo.

## 4. Endpoints y ejemplos

Los fragmentos de respuesta muestran las propiedades más importantes; los campos de fechas se generan al ejecutar la solicitud.

### Categorías

**Registrar categoría**

- URL: `POST http://localhost:3000/api/categories/create`
- Body:
  ```json
  { "name": "Aguardiente", "description": "Aguardientes nacionales" }
  ```
- Correcta (`201`):
  ```json
  { "success": true, "message": "Categoría registrada.", "data": { "id": 1, "name": "Aguardiente", "description": "Aguardientes nacionales" } }
  ```
- Error (`400`, por ejemplo nombre vacío):
  ```json
  { "success": false, "error": "El nombre de la categoría es obligatorio y debe tener máximo 100 caracteres." }
  ```

**Consultar categorías**

- URL: `POST http://localhost:3000/api/categories/list`
- Body: `{}`.
- Correcta (`200`):
  ```json
  { "success": true, "message": "Operación realizada correctamente.", "data": [{ "id": 1, "name": "Aguardiente", "description": "Aguardientes nacionales" }] }
  ```
- Error (`500`, por ejemplo falla de conexión con MySQL):
  ```json
  { "success": false, "error": "Error interno del servidor. Revisa la configuración y los registros." }
  ```

### Proveedores

**Registrar proveedor**

- URL: `POST http://localhost:3000/api/suppliers/create`
- Body:
  ```json
  { "name": "Distribuciones Central", "contact": "Ana Pérez", "phone": "3001234567", "email": "ventas@example.com" }
  ```
- Correcta (`201`): `{"success":true,"message":"Proveedor registrado.","data":{"id":1,"name":"Distribuciones Central","contact":"Ana Pérez","phone":"3001234567","email":"ventas@example.com"}}`
- Error (`400`, correo inválido): `{"success":false,"error":"El correo del proveedor no tiene un formato válido."}`

**Consultar proveedores**

- URL: `POST http://localhost:3000/api/suppliers/list`
- Body: `{}`.
- Correcta (`200`): `{"success":true,"message":"Operación realizada correctamente.","data":[{"id":1,"name":"Distribuciones Central","contact":"Ana Pérez","phone":"3001234567","email":"ventas@example.com"}]}`
- Error (`500`, error de base de datos): `{"success":false,"error":"Error interno del servidor. Revisa la configuración y los registros."}`

### Productos

**Registrar producto**

- URL: `POST http://localhost:3000/api/products/create`
- Body:
  ```json
  {
    "sku": "AGU-001",
    "name": "Aguardiente 750 ml",
    "description": "Botella de 750 ml",
    "category_id": 1,
    "supplier_id": 1,
    "purchase_price": 32000,
    "sale_price": 42000,
    "min_stock": 5
  }
  ```
- Correcta (`201`): `{"success":true,"message":"Producto registrado.","data":{"id":1,"sku":"AGU-001","name":"Aguardiente 750 ml","category_id":1,"supplier_id":1,"purchase_price":32000,"sale_price":42000,"stock":0,"min_stock":5,"active":1}}`
- Error (`409`, SKU repetido): `{"success":false,"error":"Ya existe un registro con ese valor único (por ejemplo, el SKU)."}`

**Listar productos activos**

- URL: `POST http://localhost:3000/api/products/list`
- Body: `{}`. Para incluir los inactivos envía `{"include_inactive":true}`.
- Correcta (`200`): `{"success":true,"message":"Operación realizada correctamente.","data":[{"id":1,"sku":"AGU-001","name":"Aguardiente 750 ml","stock":0,"min_stock":5,"active":1}]}`
- Error (`500`, error de base de datos): `{"success":false,"error":"Error interno del servidor. Revisa la configuración y los registros."}`

**Consultar producto por ID**

- URL: `POST http://localhost:3000/api/products/get`
- Body: `{"id":1}`.
- Correcta (`200`): `{"success":true,"message":"Operación realizada correctamente.","data":{"id":1,"sku":"AGU-001","name":"Aguardiente 750 ml","stock":0,"active":1}}`
- Error (`404`, ID inexistente): `{"success":false,"error":"Producto no encontrado."}`

**Actualizar producto**

- URL: `POST http://localhost:3000/api/products/update`
- Envía el ID y dentro de `fields` solo los campos que deseas cambiar. Se permiten `sku`, `name`, `description`, `category_id`, `supplier_id`, `purchase_price`, `sale_price` y `min_stock`.
- Body:
  ```json
  { "id": 1, "fields": { "sale_price": 43000, "min_stock": 8 } }
  ```
- Correcta (`200`): `{"success":true,"message":"Producto actualizado.","data":{"id":1,"sku":"AGU-001","name":"Aguardiente 750 ml","sale_price":43000,"min_stock":8}}`
- Error (`400`, campo no permitido): `{"success":false,"error":"El campo \"stock\" no se puede actualizar."}`

**Desactivar producto (baja lógica)**

- URL: `POST http://localhost:3000/api/products/deactivate`
- Body: `{"id":1}`.
- Correcta (`200`): `{"success":true,"message":"Producto desactivado.","data":{"id":1,"active":false}}`
- Error (`404`, ID inexistente): `{"success":false,"error":"Producto no encontrado."}`

### Inventario

**Registrar entrada de mercancía**

- URL: `POST http://localhost:3000/api/inventory/entry`
- Body: `{"product_id":1,"quantity":10,"note":"Compra factura 1001"}`. `note` es opcional.
- Correcta (`201`): `{"success":true,"message":"Entrada de inventario registrada.","data":{"movement_id":1,"product_id":1,"movement_type":"ENTRY","quantity":10,"stock_before":0,"stock_after":10}}`
- Error (`400`, cantidad inválida): `{"success":false,"error":"La cantidad debe ser un entero mayor que cero."}`

**Registrar salida manual**

- URL: `POST http://localhost:3000/api/inventory/exit`
- Body: `{"product_id":1,"quantity":2,"note":"Producto averiado"}`.
- Correcta (`201`): `{"success":true,"message":"Salida de inventario registrada.","data":{"movement_id":2,"product_id":1,"movement_type":"EXIT","quantity":2,"stock_before":10,"stock_after":8}}`
- Error (`409`, no alcanza el inventario): `{"success":false,"error":"Stock insuficiente. Existencias actuales: 1."}`

Las entradas y salidas bloquean la fila del producto durante la transacción. Las cantidades deben ser enteros positivos y una salida nunca deja el stock negativo.

### Ventas

**Registrar venta**

- URL: `POST http://localhost:3000/api/sales/create`
- Body:
  ```json
  {
    "items": [
      { "product_id": 1, "quantity": 2 }
    ]
  }
  ```
- Correcta (`201`): `{"success":true,"message":"Venta registrada.","data":{"sale_id":1,"total":86000,"items":[{"product_id":1,"name":"Aguardiente 750 ml","quantity":2,"unit_price":43000,"subtotal":86000} ]}}`
- Error (`409`, inventario insuficiente): `{"success":false,"error":"Stock insuficiente para \"Aguardiente 750 ml\". Disponible: 1; solicitado: 2."}`

El precio unitario se obtiene de `products.sale_price`. La venta, sus detalles, los movimientos y el descuento de stock se guardan en una única transacción. Si algo falla, no se confirma ninguna parte de la venta.

### Reportes

**Consultar inventario disponible**

- URL: `POST http://localhost:3000/api/reports/inventory`
- Body: `{}`.
- Correcta (`200`): `{"success":true,"message":"Operación realizada correctamente.","data":[{"id":1,"sku":"AGU-001","name":"Aguardiente 750 ml","stock":8,"min_stock":5,"active":1}]}`
- Error (`500`, error de base de datos): `{"success":false,"error":"Error interno del servidor. Revisa la configuración y los registros."}`

**Consultar productos con bajo stock**

- URL: `POST http://localhost:3000/api/reports/low-stock`
- Body: `{}` compara cada existencia con el mínimo configurado. Opcionalmente envía `{"threshold":5}` para usar un umbral general.
- Correcta (`200`): `{"success":true,"message":"Operación realizada correctamente.","data":[{"id":1,"sku":"AGU-001","name":"Aguardiente 750 ml","stock":3,"min_stock":5}]}`
- Error (`400`, umbral negativo): `{"success":false,"error":"El umbral debe ser un entero mayor o igual a cero."}`

**Consultar ventas registradas**

- URL: `POST http://localhost:3000/api/reports/sales`
- Body: `{}` devuelve todas las líneas vendidas. Para filtrar por fecha, envía por ejemplo `{"from":"2026-01-01","to":"2026-01-31"}`.
- Correcta (`200`): `{"success":true,"message":"Operación realizada correctamente.","data":[{"sale_id":1,"total":86000,"product_id":1,"product":"Aguardiente 750 ml","quantity":2,"unit_price":43000,"subtotal":86000}]}`
- Error (`400`, fechas invertidas): `{"success":false,"error":"\"from\" no puede ser posterior a \"to\"."}`

## 5. Códigos HTTP

- `200`: consulta o actualización realizada.
- `201`: registro creado.
- `400`: datos incorrectos o referencia inválida.
- `404`: producto o ruta no encontrados.
- `405`: método diferente de POST en una ruta de negocio.
- `409`: valor duplicado, producto inactivo o stock insuficiente.
- `413`: body mayor a 1 MB.
- `415`: falta `Content-Type: application/json`.
- `500`: error interno; consulta la terminal del servidor para el detalle técnico.

## 6. Organización de archivos

- `src/app.js`: configura Express, rutas, validación del body y manejo centralizado de errores.
- `src/server.js`: carga variables de entorno, comprueba MySQL e inicia el servidor.
- `src/config/database.js`: crea el pool de conexiones de MySQL.
- `src/routes/`: define las rutas POST de cada módulo.
- `src/controllers/`: recibe las solicitudes y estructura las respuestas HTTP.
- `src/services/`: contiene validaciones, consultas y reglas de negocio.
- `sql/database.sql`: crea la base de datos y sus tablas con relaciones e índices.
- `.env.example`: plantilla de configuración local sin credenciales reales.
- `.gitignore`: excluye `.env`, dependencias y archivos temporales.
- `package.json`: dependencias y comandos del proyecto.

Las consultas usan parámetros de `mysql2`; los únicos fragmentos dinámicos de actualización están limitados a campos permitidos por una lista blanca.

## 7. Git y GitHub

Desde la carpeta del proyecto, inicia Git, registra el primer cambio y enlaza el repositorio remoto creado previamente en GitHub:

```bash
git init
git add .
git commit -m "Crear backend inicial de EwuarSoft"
git branch -M main
git remote add origin https://github.com/USUARIO/ewarsoft-backend.git
git push -u origin main
```

Para cambios posteriores:

```bash
git add .
git commit -m "Describir el cambio"
git push
```

Sustituye `USUARIO` por el nombre de tu cuenta y la URL por la de tu repositorio. No agregues `.env`, contraseñas ni credenciales de MySQL. El archivo `.gitignore` evita que `.env` se incluya accidentalmente.
