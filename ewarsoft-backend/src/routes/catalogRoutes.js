const express = require('express');
const controller = require('../controllers/catalogController');

const router = express.Router();
router.post('/categories/create', controller.createCategory);
router.post('/categories/list', controller.listCategories);
router.post('/suppliers/create', controller.createSupplier);
router.post('/suppliers/list', controller.listSuppliers);

module.exports = router;
