const express = require('express');
const controller = require('../controllers/productController');

const router = express.Router();
router.post('/create', controller.create);
router.post('/list', controller.list);
router.post('/get', controller.get);
router.post('/update', controller.update);
router.post('/deactivate', controller.deactivate);

module.exports = router;
