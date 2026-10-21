const express = require('express');
const controller = require('../controllers/reportController');

const router = express.Router();
router.post('/inventory', controller.inventory);
router.post('/low-stock', controller.lowStock);
router.post('/sales', controller.sales);

module.exports = router;
