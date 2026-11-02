const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.js');
const authorize = require('../middlewares/authorize.js');
const verifyToken = require('../middlewares/auth.js');

router.post('/', [verifyToken, authorize("OWNER")], categoryController.create);
router.get('/', categoryController.getAll);
router.put('/', authorize, categoryController.update);
router.delete('/', authorize, categoryController.destroy);

module.exports = router;