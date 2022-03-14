const authControllers = require("./auth-controllers");
const productControllers = require("./product-controllers");

module.exports = {
  auth: authControllers,
  products: productControllers,
};
