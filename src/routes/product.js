const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.js');

const verifyToken = require('../middlewares/auth.js');
const authorize = require('../middlewares/authorize.js');

router.post('/', [verifyToken, authorize("ADMIN")], productController.create);
router.get('/:id', verifyToken, productController.getById);
router.get('/', [verifyToken], productController.getAll);
router.put('/:id', [verifyToken, authorize("ADMIN")], productController.update);
router.delete('/:id', [verifyToken, authorize("ADMIN")], productController.destroy);

module.exports = router;