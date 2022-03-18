const router = require('express').Router();

const { combo } = require('../controllers');

router.get('/comboBank', combo.getComboBank);

module.exports = router;