const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.js');

const verifyToken = require('../middlewares/auth.js');
const authorize = require('../middlewares/authorize.js');

router.post('/', [verifyToken, authorize("ADMIN")], menuController.create);
router.get('/:id', verifyToken, menuController.getById);
router.get('/', [verifyToken], menuController.getAll);
router.put('/:id', [verifyToken, authorize("ADMIN")], menuController.update);

module.exports = router;