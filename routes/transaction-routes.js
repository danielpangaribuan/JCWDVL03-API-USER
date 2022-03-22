const router = require('express').Router();

const { transaction } = require("../controllers");

router.get('/getTransactionStatus/:userID', transaction.getTransactionStatus);
router.post('/addTransaction', transaction.addTransaction);
router.post('/uploadReceipt/:invoice_number', transaction.addUploadReceipt);

module.exports = router;