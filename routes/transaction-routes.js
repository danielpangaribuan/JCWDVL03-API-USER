const router = require('express').Router();

const { transaction } = require("../controllers");

router.get('/getTransactionStatus/:userID', transaction.getTransactionStatus);
router.post('/addTransaction', transaction.addTransaction);


module.exports = router;