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

// Proizvodjac
router.post("/inventar/createproizvodjac", inventar.CreateProizvodjac);
router.get("/inventar/listproizvodjac", inventar.ListProizvodjac);
router.post("/inventar/editproizvodjac", inventar.EditProizvodjac);
router.post("/inventar/deleteproizvodjac", inventar.DeleteProizvodjac);

//Produkti
router.post("/inventar/createprodukt", inventar.CreateProdukt);
router.post("/inventar/readprodukt", inventar.ReadProdukt);
router.get("/inventar/produkti", inventar.apiUrlProdukti);
router.get("/inventar/listprodukti", inventar.ListProdukti);

//Produkti
router.post("/inventar/createklijent", inventar.CreateKlijent);
router.get("/inventar/listklijenti", inventar.ListKlijenti);
router.post("/inventar/editklijent", inventar.EditKlijent);
router.post("/inventar/deleteklijent", inventar.DeleteKlijent);

//Cijene Dobavljac
router.post("/inventar/createcijened", inventar.CreateCijeneD);
//router.get("/inventar/listklijenti", inventar.ListKlijenti);
//router.post("/inventar/editklijent", inventar.EditKlijent);
//router.post("/inventar/deleteklijent", inventar.DeleteKlijent);

//Cijene Klijent
router.post("/inventar/createcijenek", inventar.CreateCijeneK);

//Ugovori
router.get("/inventar/ugovori", inventar.apiUrlUgovori);
module.exports = router;