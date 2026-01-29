const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin_controller");
const auth = require("../middleware/auth");


router.get("/contacts", auth, adminController.getContacts);
router.get("/subscribers", auth, adminController.getSubscribers);


router.post("/add-user", auth, adminController.addUser);


router.get("/organization", auth, adminController.getOrganization);

router.get("/users", auth, adminController.getUsers);
router.put("/users/:id", auth, adminController.updateUser);


module.exports = router;
