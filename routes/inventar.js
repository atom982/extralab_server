var express = require("express");
var router = express.Router();

var inventar = require("../controllers/InventarController.js");

// OJ
router.post("/inventar/createoj", inventar.CreateOJ);
router.get("/inventar/listoj", inventar.ListOJ);
router.post("/inventar/editoj", inventar.EditOJ);
router.post("/inventar/deleteoj", inventar.DeleteOJ);

//Dobavljac
router.post("/inventar/createdobavljac", inventar.CreateDob);
router.get("/inventar/listdobavljac", inventar.ListDob);
router.post("/inventar/editdobavljac", inventar.EditDob);
router.post("/inventar/deletedobavljac", inventar.DeleteDob);

// Vrsta
router.post("/inventar/createvrsta", inventar.CreateVrsta);
router.get("/inventar/listvrsta", inventar.ListVrsta);
router.post("/inventar/editvrsta", inventar.EditVrsta);
router.post("/inventar/deletevrsta", inventar.DeleteVrsta);
module.exports = router;