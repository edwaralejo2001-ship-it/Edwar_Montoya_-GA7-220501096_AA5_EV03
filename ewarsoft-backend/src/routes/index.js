const express = require('express');

const router = express.Router();
router.use('/products', require('./productRoutes'));
router.use('/', require('./catalogRoutes'));
router.use('/inventory', require('./inventoryRoutes'));
router.use('/sales', require('./salesRoutes'));
router.use('/reports', require('./reportRoutes'));

module.exports = router;
