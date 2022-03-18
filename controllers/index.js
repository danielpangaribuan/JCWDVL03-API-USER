const authControllers = require("./auth-controllers");
const productControllers = require("./product-controllers");
const comboControllers = require("./combo-controllers");
const transactionControllers = require("./transaction-controllers");

module.exports = {
  auth: authControllers,
  products: productControllers,
  combo: comboControllers,
  transaction: transactionControllers
};
