// Popratni list
var express = require("express");
var router = express.Router();

var popratnice = require("../controllers/PopratniListController.js");

// Popratni List

router.get("/popratnice/list/download", popratnice.PopratniListDownload);
router.post("/popratnice/list/print", popratnice.PopratniListPrint);

module.exports = router;
