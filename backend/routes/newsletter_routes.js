const router = require("express").Router();
const controller = require("../controllers/newsletter_controller");

router.post("/", controller.subscribe);


module.exports = router;
