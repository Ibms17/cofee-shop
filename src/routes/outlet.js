const express = require('express');
const router = express.Router();
const outletController = require('../controllers/outlet.js');

const verifyToken = require('../middlewares/auth.js');
const authorize = require('../middlewares/authorize.js');

router.post('/', [verifyToken, authorize("OWNER")], outletController.create);
router.get('/', [verifyToken, authorize("OWNER")], outletController.getAll);
router.get('/:id', [verifyToken, authorize("OWNER")], outletController.getById);
router.put('/:id', [verifyToken, authorize("OWNER")], outletController.update);

module.exports = router;