var mongoose = require("mongoose");
var Schema = require("../models/Postavke");

var fs = require("fs");
const config = require("../config/index");

var popratniListController = {};

// Popratni List

popratniListController.PopratniListPrint = function (req, res) {
  // console.log(req.body.element);

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Site.findOne({
      _id: mongoose.Types.ObjectId(req.body.site),
    })
      .populate("site")
      .exec(function (err, site) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          // console.log(site);

          const fs = require("fs");
          const PDFTransportniList = require("./PDFTransportniList");
          const doc = new PDFTransportniList({
            // layout: "landscape",
            bufferPages: true,
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
          });

          doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
          doc.registerFont("PTSansBold", config.nalaz_ptsansbold);

          doc.pipe(
            fs
              .createWriteStream(
                config.report_path + "popratnice/" + req.body.timestamp + ".pdf"
              )
              .on("finish", function () {
                res.json({
                  success: true,
                  message: "Izvještaj uspješno kreiran",
                  timestamp: req.body.timestamp,
                });
              })
          );

          let code = "";
          code = site.sifra;

          var d = new Date(Date.now());
          var mjesec = d.getMonth() + 1;
          if (mjesec < 10) {
            mjesec = "0" + mjesec;
          }
          var dan = d.getDate();
          if (dan < 10) {
            dan = "0" + dan;
          }
          var god = d.getFullYear();

          // console.log(dan + "." + mjesec + "." + god);

          var sat = d.getHours();
          if (sat < 10) {
            sat = "0" + sat;
          }

          var min = d.getMinutes();
          if (min < 10) {
            min = "0" + min;
          }

          var sec = d.getSeconds();
          if (sec < 10) {
            sec = "0" + sec;
          }

          // console.log(sat + ":" + min + ":" + sec);

          // console.log(site.sifra);

          doc.image(config.nalaz_logo + code + ".jpg", 28, 0, { fit: [240, 80], align: "center", valign: "center" });

          switch (site.sifra) {
            case "A":
              break;

            default:
              break;
          }

          doc
            .fontSize(8)
            .fillColor("#7B8186")
            .moveTo(0, 90)
            .lineTo(650, 90)
            .fillAndStroke("#7B8186", "#7B8186");

          doc.fillColor("#000000");

          doc.moveDown(5);

          doc
            .font("PTSansRegular")
            .fontSize(11)
            .fillColor("#000000")
            .text("Datum: " + req.body.element.datum, 50);

          doc.moveDown(0.3);

          const table2 = {
            headers: ["INFORMACIJA O PACIJENTU", ""],
            rows: [
              [
                "Ime i prezime:",
                req.body.element.ime + " " + req.body.element.prezime,
              ],

              ["Godište:", req.body.element.godiste],
            ],
          };

          doc
            .moveDown()
            .font("PTSansBold")
            .fontSize(8.5)
            .table(table2, 100, doc.y, { width: 300 });

          doc.moveDown(2);

          // console.log("req.body.element.analiti")
          // console.log(req.body.element.analiti)

          doc
            .font("PTSansBold")
            .fontSize(11)
            .text("Zahtjev za laboratorijske pretrage: ", 50);
          doc
            .font("PTSansRegular")
            .fontSize(11)
            .text(req.body.element.analiti, 50);

          doc.moveDown(0.3);

          doc.moveDown(0.3);

          doc
            .font("PTSansRegular")
            .fontSize(11)
            .text(
              "Uzorak zaprimio i identifikaciju pacijenta/klijenta izvršio/la:",
              50,
              350
            );

          doc.moveDown(0.8);

          var Line =
            "Ime i prezime: ___________________________ Potpis: ___________________________";

          doc.font("PTSansRegular").fontSize(11).text(Line, 50);
          doc.moveDown(0.3);
          doc
            .font("PTSansRegular")
            .fontSize(11)
            .text(
              "Vrijeme uzorkovanja: " +
                req.body.element.datum +
                " " +
                req.body.element.time,
              50
            );

          doc.moveDown(1);

          doc.moveDown(2);

          var Sadrzaj =
            "Kao nosilac ličnih podataka, izjavljujem da sam saglasan/a da se u svrhu laboratorijskih ispitivanja shodno ovom zahtjevu mogu obrađivati moji lični podaci iz kojih se može utvrditi moj identitet, a" +
            "posebno se moja izričita saglasnost odnosi na lične podatke o zdravstvenom stanju.\nSaglasan sam da se rezultati laboratorijskih pretraga mogu koristiti u naučno-istraživačke svrhe uz očuvanje mojih ličnih podataka.\n\n" +
            "- Saglasan sam da putem e-maila primam informacije o ponudama i novostima u laboratoriji.\n\n" +
            "- Obaviješten sam da nakon venepunkcije mogu nastati komplikacije kao što je blaga bol i hematom, " +
            "te sam saglasan s provođenjem iste. Saglasan sam da laboratorijsko osoblje uzorkuje onoliko uzoraka krvi koliko je potrebno s obzirom na tražene pretrage.\n\n" +
            "- Saglasan sam da mi rezultate laboratorijskih pretraga isporučite putem e-mail-a.\n\n\n" +
            "\nPotpis pacijenta: ___________________________";

          doc.font("PTSansBold").fontSize(11).text(Sadrzaj, 50);

          const range = doc.bufferedPageRange();

          for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);

            doc
              .fontSize(8)
              .fillColor("#7B8186")
              .moveTo(0, 754 - 15)
              .lineTo(612, 754 - 15)
              .fillAndStroke("#7B8186", "#7B8186");

            doc
              .font("PTSansBold")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("ATOM Laboratory Software", 470 - 5, 760 - 15, {
                lineBreak: false,
              });
            doc
              .font("PTSansRegular")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("by", 470 - 5, 770 - 15, { lineBreak: false });
            doc
              .font("PTSansBold")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("iLab d.o.o. Sarajevo", 480 - 5, 770 - 15, {
                lineBreak: false,
              });
            doc
              .font("PTSansRegular")
              .fontSize(8)
              .fillColor("#000000")
              .text(
                `Stranica ${i + 1} od ${range.count}`,
                doc.page.width / 2 - 25,
                doc.page.height - 25,
                { lineBreak: false }
              );
          }

          doc.end();
        }
      });
  }
};

popratniListController.PopratniListDownload = function (req, res) {
  const file_path =
    config.report_path + "popratnice/" + req.query.timestamp + ".pdf";

  res.setHeader("Content-Type", "writeTheType");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + req.query.timestamp + ".pdf"
  );
  fs.createReadStream(file_path).pipe(res);
};

module.exports = popratniListController;
