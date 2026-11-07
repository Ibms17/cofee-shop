const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.js');
const verifyToken = require('../middlewares/auth.js');
const authorize = require('../middlewares/authorize.js');

router.post('/', verifyToken, authorize("KASIR"), orderController.create);
router.get('/history', verifyToken, orderController.getAll);
router.patch('/:id/status', verifyToken, authorize("OWNER", "ADMIN"), orderController.update);
module.exports = router; 