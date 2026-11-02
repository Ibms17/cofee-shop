const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.js');
const verifyToken = require('../middlewares/auth.js');
const authorize = require('../middlewares/authorize.js');

router.post('/', verifyToken, authorize("KASIR"), paymentController.create);
router.get('/history', verifyToken, authorize("OWNER", "ADMIN", "KASIR"), paymentController.getAll);

module.exports = router; 