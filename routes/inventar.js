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

// Ugovor
router.post("/inventar/createugovor", inventar.CreateUgovor);
router.get("/inventar/listugovor", inventar.ListUgovor);
router.post("/inventar/editugovor", inventar.EditUgovor);
router.post("/inventar/deleteugovor", inventar.DeleteUgovor);

// Klasa
router.post("/inventar/createklasa", inventar.CreateKlasa);
router.get("/inventar/listklasa", inventar.ListKlasa);
router.post("/inventar/editklasa", inventar.EditKlasa);
router.post("/inventar/deleteklasa", inventar.DeleteKlasa);

// Program
router.post("/inventar/createprogram", inventar.CreateProgram);
router.get("/inventar/listprogram", inventar.ListProgram);
router.post("/inventar/editprogram", inventar.EditProgram);
router.post("/inventar/deleteprogram", inventar.DeleteProgram);

// Platforma
router.post("/inventar/createplatforma", inventar.CreatePlatforma);
router.get("/inventar/listplatforma", inventar.ListPlatforma);
router.post("/inventar/editplatforma", inventar.EditPlatforma);
router.post("/inventar/deleteplatforma", inventar.DeletePlatforma);
module.exports = router;