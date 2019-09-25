var express = require("express");
var router = express.Router();

var kontrole = require("../controllers/KontroleController.js");

router.post("/kontrole/aparat/list", kontrole.ListByAnalyser);
router.post("/kontrole/tip/aparat/list", kontrole.ListByTypeandAnalyser);
router.post("/kontrole/aparat/testovi/list", kontrole.ListTestsByAnalyser);
router.post("/kontrole/uzorci/save", kontrole.KontrolaSave);
router.post("/kontrole/uzorci/delete", kontrole.KontrolaDelete);
router.post("/kontrole/pregled/delete", kontrole.KontrolaPregledDelete);
router.get("/kontrole/list", kontrole.List);
router.post("/kontrole/pregled/levey", kontrole.KontrolaLevey);
router.post("/kontrole/pregled/lotovi", kontrole.KontrolaLotovi);
router.post("/kontrole/pregled/:id", kontrole.Show);
router.post("/kontrole/manual/create/:id", kontrole.ManualCreate);
router.post("/kontrole/rezultat/update/:id", kontrole.RezultatUpdate);

module.exports = router;
