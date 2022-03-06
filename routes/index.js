const router = require("express").Router();
const user_routes = require("./user-routes");
const auth_routes = require("./auth-routes");

//HOME ROUTES
router.get("/", (req, res) => {
  res.status(200).send(`<h1>Welcome to My APIs</h1>`);
});

module.exports = { home_route: router, user_routes, auth_routes };
