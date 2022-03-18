const router = require("express").Router();

const { users } = require("../controllers")

// define routes
router.get("/users");
router.post("/addAddress", users.addAddress);

// export router
module.exports = router;
