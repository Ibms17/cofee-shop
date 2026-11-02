const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.js");

const verifyToken = require("../middlewares/auth.js");
const authorize = require('../middlewares/authorize.js');


router.patch("/admin/:id/approve", [verifyToken, authorize("OWNER")], userController.approveAdmin);
router.patch("/kasir/:id/approve", [verifyToken, authorize("OWNER")], userController.approveKasir);
router.patch("/barista/:id/approve", [verifyToken, authorize("OWNER")], userController.approveBarista);

module.exports = router;