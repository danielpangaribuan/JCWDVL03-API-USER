const router = require("express").Router();

// import controller
const { auth } = require("../controllers");

// routes
router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/keeplogin", auth.keeplogin);
router.post("/otp/verification", auth.verifyOTP);

module.exports = router;
