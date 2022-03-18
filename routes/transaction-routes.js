const router = require('express').Router();

const { transaction } = require("../controllers");

router.post('/addTransaction', transaction.addTransaction);

module.exports = router;