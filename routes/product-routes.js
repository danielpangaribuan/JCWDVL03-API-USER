const router = require('express').Router();

const { products } = require('../controllers');

router.get('/products', products.getProducts);
router.get('/productsDetail/:id', products.getProductDetail)

router.get('/category', products.getCategory);
router.get('/warehouseLocation', products.getWarehouseLocation);

module.exports = router;
