const express = require('express');
const controller = require('../controllers/salesController');

const router = express.Router();
router.post('/create', controller.create);

module.exports = router;
