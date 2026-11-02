const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.js');
const verifyToken = require('../middlewares/auth.js');
const authorize = require('../middlewares/authorize.js');

router.post('/', verifyToken, authorize("KASIR"), orderController.create);
router.get('/history', verifyToken, orderController.getAll);

module.exports = router; 