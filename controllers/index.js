const authControllers = require("./auth-controllers");
const productControllers = require("./product-controllers");
const comboControllers = require("./combo-controllers");
const transactionControllers = require("./transaction-controllers");
const userControllers = require("./user-controllers");

module.exports = {
  auth: authControllers,
  products: productControllers,
  combo: comboControllers,
  transaction: transactionControllers,
  users: userControllers
};
