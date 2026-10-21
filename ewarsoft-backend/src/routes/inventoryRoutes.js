const express = require('express');
const controller = require('../controllers/inventoryController');

const router = express.Router();
router.post('/entry', controller.entry);
router.post('/exit', controller.exit);

module.exports = router;
