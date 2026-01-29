const router = require("express").Router();
const controller = require("../controllers/contact_controller");

router.post("/", controller.create);
 

module.exports = router;