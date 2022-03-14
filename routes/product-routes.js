const router = require("express").Router();

const { products } = require("../controllers");

router.get("/products", products.getProducts);

module.exports = router;
