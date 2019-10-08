var express = require("express");
var router = express.Router();
var Integration = require("../controllers/IntegrationController.js");

router.post("/post/api", Integration.Post);
router.post("/get/api", Integration.Get);
router.post("/api/bind", Integration.Bind);
router.get("/api/list", Integration.List);

module.exports = router;
