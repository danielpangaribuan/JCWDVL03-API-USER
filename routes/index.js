const router = require("express").Router();
const userRoutes = require("./user-routes");
const authRoutes = require("./auth-routes");
const productRoutes = require("./product-routes");

//HOME ROUTES
router.get("/", (req, res) => {
  res.status(200).send(`<h1>Welcome to My APIs</h1>`);
});

module.exports = { home_route: router, userRoutes, authRoutes, productRoutes };
