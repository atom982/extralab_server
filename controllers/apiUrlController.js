var mongoose = require("mongoose");

var apiUrlController = {};

apiUrlController.apiUrlPatients = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    var limit = 50000;

    if (!req.query.filter) {
      req.query.filter = "";
      limit = 100;
    }

    if (req.query.filter === "") {
      req.query.filter = "";
      limit = 100;
    } else {
      limit = 50000;
    }

    var uslov = { site: mongoose.Types.ObjectId(req.query.site) };

    switch (parametar) {
      case "ime":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          ime: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };
        break;

      case "prezime":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          prezime: {
            $regex: ".*" + req.query.filter.toUpperCase() + ".*"
          }
        };

        break;

      case "jmbg":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          jmbg: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };

        break;

      default:
        var imeiprezime = req.query.filter.toLowerCase().split(" ");
        if (imeiprezime.length === 2) {
          var name = imeiprezime[0];
          var surname = imeiprezime[1];
          uslov = {
            site: mongoose.Types.ObjectId(req.query.site),
            ime: {
              $regex: ".*" + name.toUpperCase() + ".*"
            },
            prezime: {
              $regex: ".*" + surname.toUpperCase() + ".*"
            }
          };
        }

        if (imeiprezime.length === 1) {
          var name = imeiprezime[0];
          uslov = {
            site: mongoose.Types.ObjectId(req.query.site),

            $or: [
              {
                ime: { $regex: ".*" + name.toUpperCase() + ".*" }
              },
              {
                prezime: { $regex: ".*" + name.toUpperCase() + ".*" }
              }
            ]
          };
        }

        break;
    }

    Patients.find(uslov)
      .sort({ _id: -1 })
      .limit(limit)
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              results = results.filter(function(result) {
                return result.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              results = results.filter(function(result) {
                return result.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "jmbg":
              results = results.filter(function(result) {
                return result.jmbg
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var pacijent = req.query.filter.toLowerCase().split(" ");
              if (pacijent.length === 2) {
                var name = pacijent[0];
                var surname = pacijent[1];
                results = results.filter(function(result) {
                  return (
                    (result.ime.toLowerCase().includes(name) &&
                      result.prezime.toLowerCase().includes(surname)) ||
                    (result.ime.toLowerCase().includes(surname) &&
                      result.prezime.toLowerCase().includes(name))
                  );
                });
              }
              if (pacijent.length === 1) {
                var name = pacijent[0];
                results = results.filter(function(result) {
                  return (
                    result.ime.toLowerCase().includes(name) ||
                    result.prezime.toLowerCase().includes(name)
                  );
                });
              }
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "prijem/pacijenti?sort=" +
            req.query.sort +
            "&page=" +
            (req.query.page + 1) +
            "&per_page=" +
            req.query.per_page;
          var prev_page = null;
          if (json.current_page - 1 !== 0) {
            prev_page = json.current_page - 1;
          }
          json.prev_page_url =
            config.baseURL +
            "prijem/pacijenti?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "ime":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.ime == b.ime ? 0 : +(a.ime > b.ime) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.ime == b.ime ? 0 : +(a.ime < b.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.prezime == b.prezime
                    ? 0
                    : +(a.prezime > b.prezime) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.prezime == b.prezime
                    ? 0
                    : +(a.prezime < b.prezime) || -1;
                });
              }
              break;
            case "jmbg":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.jmbg == b.jmbg ? 0 : +(a.jmbg > b.jmbg) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.jmbg == b.jmbg ? 0 : +(a.jmbg < b.jmbg) || -1;
                });
              }
              break;
            default:
              results.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach(patient => {
            switch (patient.spol) {
              case "MUŠKI":
                var icon =
                  '<span style="font-size: 12px; color:#4ab2e3;" class="fa fa-mars"></span>';
                break;
              case "ŽENSKI":
                var icon =
                  '<span style="font-size: 12px; color:#db76df;" class="fa fa-venus"></span>';
                break;
              default:
                var icon =
                  '<span style="font-size: 12px; color:#f7cc36;" class="fa fa-genderless"></span>';
                break;
            }

            var prijem =
              "<button style='white-space: nowrap;' title='' id='" +
              patient.jmbg +
              "' style='font-size: 11px;' class='btn btn-secondary-info btn-micro'><span id='" +
              patient.jmbg +
              "' style='font-size: 12px;' class='fa fa-flask'></span> <span style='text-transform: none; font-size: 12px;'>Prijem</span></button>";

            var jmbg = "<span>" + patient.jmbg + "</span>";

            if (patient.jmbg.includes("P")) {
              jmbg =
                "<span>" +
                patient.jmbg.slice(0, -1) +
                "<span style='color: #e34a4a;'>" +
                patient.jmbg.slice(-1) +
                "</span></span>";
            }

            var detalji =
              "<button style='white-space: nowrap;' title='' id='" +
              patient._id +
              "' style='text-transform: none; font-size: 12px;' class='btn btn-primary btn-micro'><span id='" +
              patient._id +
              "' class='fa fa-edit'></span> Uredi</button>";

            json.data.push({
              icon: icon,
              ime: patient.ime,
              prezime: patient.prezime,
              prijem: prijem,
              jmbg: jmbg,
              spol: patient.spol,
              detalji: detalji,
              id: patient._id
            });
          });
          res.json(json);
        }
      });
  }
};

apiUrlController.apiUrlObradaPregled = function(req, res) {
  var datum = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .substring(0, 10);

  var datum14 = JSON.stringify(
    new Date(new Date().setDate(new Date().getDate() - 14))
  ).substring(1, 11);

  var datum7 = JSON.stringify(
    new Date(new Date().setDate(new Date().getDate() - 7))
  ).substring(1, 11);

  var from = new Date(datum + "T00:00:00Z");
  var to = new Date(datum + "T23:59:59Z");

  switch (req.query.datum) {
    case "NEDOVRŠENO":
      datum = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 1))
      ).substring(1, 11);

      from = new Date(datum14 + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;

    case "Svi Rezultati":
      from = new Date(datum14 + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;

    case "Mikrobiologija":
      from = new Date(datum7 + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;

    default:
      from = new Date(datum + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;
  }

  var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
  var order = req.query.sort
    .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
    .trim();
  var uslov = {};

  uslov = {
    created_at: {
      $gt: new Date(from.setHours(2)),
      $lt: new Date(to.setHours(25, 59, 59))
    },
    site: mongoose.Types.ObjectId(req.query.site)
  };

  if (!req.query.filter) {
    req.query.filter = "";
  }

  if (
    req.query.dateRangeMin != undefined &&
    req.query.dateRangeMax != undefined
  ) {
    if (req.query.dateRangeMin != "" && req.query.dateRangeMax != "") {
      // console.log('Potrebna korekcija uslova.')
      from = new Date(req.query.dateRangeMin + "T00:00:00");
      to = new Date(req.query.dateRangeMax + "T23:59:59");
      uslov = {
        created_at: {
          $gt: new Date(from.setHours(2)),
          $lt: new Date(to.setHours(25, 59, 59))
        },
        site: mongoose.Types.ObjectId(req.query.site)
      };
      req.query.datum = "Svi Rezultati";
    }
  }

  Results.find(uslov)
    .populate("sample patient rezultati.labassay")
    .sort({
      created_at: -1
    })
    .exec(function(err, rezultati) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultati.length) {
          var Rezultati = [];

          rezultati.forEach(element => {
            if (
              !Rezultati.filter(
                rezultat =>
                  rezultat.id === element.sample.pid &&
                  JSON.stringify(rezultat.date).substring(1, 11) ===
                    JSON.stringify(element.created_at).substring(1, 11)
              ).length > 0
            ) {
              Rezultati.push({
                obrada:
                  "<button style='white-space: nowrap;' id='" +
                  element.patient._id +
                  "' title='' class='btn btn-primary btn-micro'><span class='glyphicon glyphicon-search'></span> PREGLED</button>",
                id: element.sample.pid,
                ime: element.patient.ime,
                prezime: element.patient.prezime,
                jmbg: element.patient.jmbg,
                micro: false,
                barcodes: "",
                racun: "",
                _id: element.patient._id,
                date: element.created_at,

                datum:
                  JSON.stringify(
                    JSON.stringify(element.created_at).substring(1, 11)
                  ).slice(9, 11) +
                  "." +
                  JSON.stringify(
                    JSON.stringify(element.created_at).substring(1, 11)
                  ).slice(6, 8) +
                  "." +
                  JSON.stringify(
                    JSON.stringify(element.created_at).substring(1, 11)
                  ).slice(1, 5),

                time: JSON.stringify(element.created_at).substring(12, 17),

                remove: false
              });
            }
          });

          Rezultati.forEach(newrez => {
            var samples = "";
            var pac = "";
            var check = true;
            var micro = false;
            var verificiran = true;

            rezultati.forEach(rez => {
              if (
                newrez.id === rez.sample.pid &&
                newrez.datum ===
                  JSON.stringify(
                    JSON.stringify(rez.created_at).substring(1, 11)
                  ).slice(9, 11) +
                    "." +
                    JSON.stringify(
                      JSON.stringify(rez.created_at).substring(1, 11)
                    ).slice(6, 8) +
                    "." +
                    JSON.stringify(
                      JSON.stringify(rez.created_at).substring(1, 11)
                    ).slice(1, 5)
              ) {
                samples += rez.id + ",";
                if (!rez.verificiran) {
                  verificiran = false;
                }

                pac = rez.patient._id;

                if (!rez.verificiran) {
                  check = false;
                }

                if (rez.sample.tip.includes("Mikrobiologija")) {
                  micro = true;
                }

                newrez.barcodes +=
                  "<button style='white-space: nowrap;' id='" +
                  rez.id +
                  "' title='" +
                  rez.id +
                  "' class='btn btn-info btn-micro'><span id='" +
                  rez.id +
                  "' class='fa fa-barcode'>&nbsp;</span>" +
                  rez.id[0] +
                  "</button>";
              }
            });

            samples = samples.replace(/(.+),$/, "$1");
            newrez.remove = check;
            newrez.micro = micro;

            newrez.verificiran = verificiran;

            newrez.racun =
              "<button style='white-space: nowrap;' title='' id='" +
              pac +
              "?uzorci=" +
              samples +
              "' class='btn btn-primary btn-micro'><span id='" +
              pac +
              "?uzorci=" +
              samples +
              "' class='fa fa-euro'></span> RAČUN</button>";
          });

          if (req.query.datum === "RADNA LISTA") {
            rezultati = Rezultati.filter(function(rezultat) {
              return rezultat.verificiran === false;
            });
          } else if (req.query.datum === "VERIFICIRAN") {
            rezultati = Rezultati.filter(function(rezultat) {
              return rezultat.verificiran === true;
            });
          } else if (req.query.datum === "NEDOVRŠENO") {
            rezultati = Rezultati.filter(function(rezultat) {
              return rezultat.verificiran === false;
            });
          } else if (req.query.datum === "Mikrobiologija") {
            rezultati = Rezultati.filter(function(rezultat) {
              return rezultat.micro === true && rezultat.verificiran === false;
            });
          } else {
            // console.log('Svi Rezultati')
            rezultati = Rezultati;
          }

          switch (parametar) {
            case "ime":
              rezultati = rezultati.filter(function(rezultat) {
                return rezultat.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              rezultati = rezultati.filter(function(rezultat) {
                return rezultat.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "id":
              rezultati = rezultati.filter(function(rezultat) {
                return rezultat.id.includes(req.query.filter);
              });
              break;
            default:
              var pacijent = req.query.filter.toLowerCase().split(" ");
              if (pacijent.length === 2) {
                var name = pacijent[0];
                var surname = pacijent[1];
                rezultati = rezultati.filter(function(rezultat) {
                  return (
                    (rezultat.ime.toLowerCase().includes(name) &&
                      rezultat.prezime.toLowerCase().includes(surname)) ||
                    (rezultat.ime.toLowerCase().includes(surname) &&
                      rezultat.prezime.toLowerCase().includes(name))
                  );
                });
              }
              if (pacijent.length === 1) {
                var name = pacijent[0];
                rezultati = rezultati.filter(function(rezultat) {
                  return (
                    rezultat.ime.toLowerCase().includes(name) ||
                    rezultat.prezime.toLowerCase().includes(name) ||
                    rezultat.id.includes(req.query.filter)
                  );
                });
              }
              break;
          }
          var json = {};

          json.data = [];

          switch (parametar) {
            case "ime":
              if (order === "asc") {
                rezultati.sort(function(a, b) {
                  return a.ime == b.ime ? 0 : +(a.ime > b.ime) || -1;
                });
              }
              if (order === "desc") {
                rezultati.sort(function(a, b) {
                  return a.ime == b.ime ? 0 : +(a.ime < b.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                rezultati.sort(function(a, b) {
                  return a.prezime == b.prezime
                    ? 0
                    : +(a.prezime > b.prezime) || -1;
                });
              }
              if (order === "desc") {
                rezultati.sort(function(a, b) {
                  return a.prezime == b.prezime
                    ? 0
                    : +(a.prezime < b.prezime) || -1;
                });
              }
              break;
            case "id":
              if (order === "asc") {
                rezultati.sort(function(a, b) {
                  return a.id.localeCompare(b.id, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                rezultati.sort(function(a, b) {
                  return b.id.localeCompare(a.id, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }

              break;
            default:
              rezultati.sort(function(a, b) {
                return Date.parse(a.date) == Date.parse(b.date)
                  ? 0
                  : +(Date.parse(a.date) < Date.parse(b.date)) || -1;
              });
              break;
          }

          json.data = rezultati;
          json.total = json.data.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "obrada/pregled?sort=" +
            req.query.sort +
            "&page=" +
            (req.query.page + 1) +
            "&per_page=" +
            req.query.per_page;
          var prev_page = null;
          if (json.current_page - 1 !== 0) {
            prev_page = json.current_page - 1;
          }
          json.prev_page_url =
            config.baseURL +
            "obrada/pregled?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = json.data.slice(json.from - 1, json.to);
          res.json(json);
        } else {
          res.json({
            success: false,
            message: "Nema pronađenih rezultata"
          });
        }
      }
    });
};

apiUrlController.apiUrlNalaziPregled = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    var danasnjiDatum = new Date();
    danasnjiDatum.setDate(danasnjiDatum.getDate());
    var trenutniMjesec = danasnjiDatum.getMonth() + 1;
    var trenutniDan = danasnjiDatum.getUTCDate();
    if (trenutniDan < 10) {
      trenutniDan = "0" + trenutniDan;
    }
    if (trenutniMjesec < 10) {
      trenutniMjesec = "0" + trenutniMjesec;
    }
    var danasnjiDatum =
      danasnjiDatum.getFullYear() + "-" + trenutniMjesec + "-" + trenutniDan;

    var from = new Date();
    var to = new Date();
    if (req.query.datum === "Svi Rezultati") {
      var doo = new Date();

      var datum190 = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 190))
      ).substring(1, 11);

      var od = new Date(datum190 + "T00:00:00");

      // var od = new Date();
      // od.setFullYear(od.getFullYear() - 1);
      to = doo;
      from = od;
    } else {
      to = danasnjiDatum + "T23:59:59";
      to = new Date(to + "Z");
      from = danasnjiDatum + "T00:00:00";
      from = new Date(from + "Z");
    }
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();
    var uslov = {};
    uslov = {
      updated_at: {
        $gt: from,
        $lt: to
      },
      status: true,
      site: mongoose.Types.ObjectId(req.query.site)
    };

    if (!req.query.filter) {
      req.query.filter = "";
    }

    if (
      req.query.dateRangeMin != undefined &&
      req.query.dateRangeMax != undefined
    ) {
      if (req.query.dateRangeMin != "" && req.query.dateRangeMax != "") {
        // console.log('Potrebna korekcija uslova.')
        from = new Date(req.query.dateRangeMin + "T00:00:00");
        to = new Date(req.query.dateRangeMax + "T23:59:59");
        uslov = {
          created_at: {
            $gt: new Date(from.setHours(2)),
            $lt: new Date(to.setHours(25, 59, 59))
          },
          status: true,
          site: mongoose.Types.ObjectId(req.query.site)
        };
      }
    }

    console.log(uslov)
    console.log(req.query.filter)

    Nalazi.find(uslov)
      .populate("patient")
      .exec(function(err, nalazi) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              nalazi = nalazi.filter(function(result) {
                return result.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              nalazi = nalazi.filter(function(result) {
                return result.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "jmbg":
              nalazi = nalazi.filter(function(result) {
                return result.patient.jmbg
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var pacijent = req.query.filter.toLowerCase().split(" ");
              if (pacijent.length === 2) {
                var name = pacijent[0];
                var surname = pacijent[1];
                nalazi = nalazi.filter(function(result) {
                  return (
                    (result.patient.ime.toLowerCase().includes(name) &&
                      result.patient.prezime.toLowerCase().includes(surname)) ||
                    (result.patient.ime.toLowerCase().includes(surname) &&
                      result.patient.prezime.toLowerCase().includes(name))
                  );
                });
              }
              if (pacijent.length === 1) {
                var name = pacijent[0];
                nalazi = nalazi.filter(function(result) {
                  return (
                    result.patient.ime.toLowerCase().includes(name) ||
                    result.patient.prezime.toLowerCase().includes(name)
                  );
                });
              }
              break;
          }
          switch (parametar) {
            case "ime":
              if (order === "asc") {
                nalazi.sort(function(a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime > b.patient.ime) || -1;
                });
              }
              if (order === "desc") {
                nalazi.sort(function(a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime < b.patient.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                nalazi.sort(function(a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime > b.patient.prezime) || -1;
                });
              }
              if (order === "desc") {
                nalazi.sort(function(a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime < b.patient.prezime) || -1;
                });
              }
              break;
            case "jmbg":
              if (order === "asc") {
                nalazi.sort(function(a, b) {
                  return a.patient.jmbg.localeCompare(
                    b.patient.jmbg,
                    undefined,
                    {
                      numeric: true,
                      sensitivity: "base"
                    }
                  );
                });
              }
              if (order === "desc") {
                nalazi.sort(function(a, b) {
                  return b.patient.jmbg.localeCompare(
                    a.patient.jmbg,
                    undefined,
                    {
                      numeric: true,
                      sensitivity: "base"
                    }
                  );
                });
              }
              break;
            default:
              nalazi.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }
          var i = 0;
          var noviNiz = [];

          nalazi.forEach(element => {
            if (element.status) {
              i++;
              noviNiz.push(element);
            }
          });

          var json = {};
          json.total = noviNiz.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "nalazi/pregled?sort=" +
            req.query.sort +
            "&page=" +
            (req.query.page + 1) +
            "&per_page=" +
            req.query.per_page;
          var prev_page = null;
          if (json.current_page - 1 !== 0) {
            prev_page = json.current_page - 1;
          }
          json.prev_page_url =
            config.baseURL +
            "nalazi/pregled?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];
          noviNiz = noviNiz.slice(json.from - 1, json.to);
          var niz = noviNiz;

          niz.forEach(uzorak => {
            if (uzorak.status || i > 0) {
              if (uzorak.timestamp != "MIGRATED") {
                var nalaz =
                  "<button style='white-space: nowrap;' id='" +
                  uzorak.timestamp +
                  "' class='btn btn-primary btn-micro'><span id='" +
                  uzorak.timestamp +
                  "' class='glyphicon glyphicon-search'></span> NALAZ</button>";
              } else {
                var nalaz =
                  "<button style='white-space: nowrap;' id='" +
                  uzorak._id +
                  "' class='btn btn-primary btn-micro'><span id='" +
                  uzorak._id +
                  "' class='glyphicon glyphicon-search'></span> NALAZ</button>";
              }

              var tmp_time = new Date(
                new Date(uzorak.updated_at).getTime() -
                  new Date(uzorak.updated_at).getTimezoneOffset() * 60000
              ).toISOString();

              var akcija =
                JSON.stringify(uzorak.created_at).slice(9, 11) +
                "." +
                JSON.stringify(uzorak.created_at).slice(6, 8) +
                "." +
                JSON.stringify(uzorak.created_at).slice(1, 5);
              var time = JSON.stringify(tmp_time).substring(12, 17);
              var uzorci = [];
              uzorak.uzorci.forEach(element => {
                uzorci.push(element.sid);
              });

              var pacijent = uzorak.patient.ime + " " + uzorak.patient.prezime;

              if (uzorci.length > 1) {
                var partials =
                  "<i name='" +
                  pacijent +
                  "' id='" +
                  uzorci +
                  "' style='color:#4ae387;' class='vuestic-icon vuestic-icon-files'></i>";
              } else if (uzorci.length == 1) {
                var partials =
                  "<i name='" +
                  pacijent +
                  "' id='" +
                  uzorci +
                  "' style='color:#d9d9d9;' class='vuestic-icon vuestic-icon-files'></i>";
              } else {
                var partials = "";
              }

              var brisanje =
                "<button style='white-space: nowrap;' title='Brisanje nalaza' uzorka' id='" +
                uzorak._id +
                "' class='btn btn-danger btn-micro'><span id='" +
                uzorak._id +
                "' class='fa fa-trash-o'></span> IZBRIŠI</button>";
              json.data.push({
                nalazipregled: nalaz,
                ime: uzorak.patient.ime,
                prezime: uzorak.patient.prezime,
                status: "<strong>VERIFICIRAN</strong>",
                jmbg: uzorak.patient.jmbg,
                uzorci: uzorci,
                partials: partials,

                time: time,
                izmjena: akcija,
                brisanje: brisanje
              });
            }
          });
          res.json(json);
        }
      });
  }
};

apiUrlController.apiUrlNalaziOutbox = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    var danasnjiDatum = new Date();
    danasnjiDatum.setDate(danasnjiDatum.getDate());
    var trenutniMjesec = danasnjiDatum.getMonth() + 1;
    var trenutniDan = danasnjiDatum.getUTCDate();
    if (trenutniDan < 10) {
      trenutniDan = "0" + trenutniDan;
    }
    if (trenutniMjesec < 10) {
      trenutniMjesec = "0" + trenutniMjesec;
    }
    var danasnjiDatum =
      danasnjiDatum.getFullYear() + "-" + trenutniMjesec + "-" + trenutniDan;
    var from = new Date();
    var to = new Date();
    if (req.query.datum === "Svi Rezultati") {
      var doo = new Date();
      var od = new Date();
      od.setFullYear(od.getFullYear() - 1);
      to = doo;
      from = od;
    } else {
      to = danasnjiDatum + "T23:59:59";
      to = new Date(to + "Z");
      from = danasnjiDatum + "T00:00:00";
      from = new Date(from + "Z");
    }
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();
    var uslov = {};
    uslov = {
      created_at: {
        $gt: from,
        $lt: to
      },
      patient: {
        $exists: true
      },
      site: mongoose.Types.ObjectId(req.query.site)
    };

    if (!req.query.filter) {
      req.query.filter = "";
    }

    if (
      req.query.dateRangeMin != undefined &&
      req.query.dateRangeMax != undefined
    ) {
      if (req.query.dateRangeMin != "" && req.query.dateRangeMax != "") {
        // console.log('Potrebna korekcija uslova.')
        from = new Date(req.query.dateRangeMin + "T00:00:00");
        to = new Date(req.query.dateRangeMax + "T23:59:59");
        uslov = {
          created_at: {
            $gt: new Date(from.setHours(2)),
            $lt: new Date(to.setHours(25, 59, 59))
          },
          patient: {
            $exists: true
          },
          site: mongoose.Types.ObjectId(req.query.site)
        };
      }
    }

    Outbox.find(uslov)
      .populate("patient nalaz")
      .exec(function(err, nalazi) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              nalazi = nalazi.filter(function(result) {
                return result.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              nalazi = nalazi.filter(function(result) {
                return result.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "jmbg":
              nalazi = nalazi.filter(function(result) {
                return result.patient.jmbg
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var pacijent = req.query.filter.toLowerCase().split(" ");
              if (pacijent.length === 2) {
                var name = pacijent[0];
                var surname = pacijent[1];
                nalazi = nalazi.filter(function(result) {
                  return (
                    (result.patient.ime.toLowerCase().includes(name) &&
                      result.patient.prezime.toLowerCase().includes(surname)) ||
                    (result.patient.ime.toLowerCase().includes(surname) &&
                      result.patient.prezime.toLowerCase().includes(name))
                  );
                });
              }
              if (pacijent.length === 1) {
                var name = pacijent[0];
                nalazi = nalazi.filter(function(result) {
                  return (
                    result.patient.ime.toLowerCase().includes(name) ||
                    result.patient.prezime.toLowerCase().includes(name)
                  );
                });
              }
              break;
          }
          switch (parametar) {
            case "ime":
              if (order === "asc") {
                nalazi.sort(function(a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime > b.patient.ime) || -1;
                });
              }
              if (order === "desc") {
                nalazi.sort(function(a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime < b.patient.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                nalazi.sort(function(a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime > b.patient.prezime) || -1;
                });
              }
              if (order === "desc") {
                nalazi.sort(function(a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime < b.patient.prezime) || -1;
                });
              }
              break;
            case "jmbg":
              if (order === "asc") {
                nalazi.sort(function(a, b) {
                  return a.patient.jmbg == b.patient.jmbg
                    ? 0
                    : +(a.patient.jmbg > b.patient.jmbg) || -1;
                });
              }
              if (order === "desc") {
                nalazi.sort(function(a, b) {
                  return a.patient.jmbg == b.patient.jmbg
                    ? 0
                    : +(a.patient.jmbg < b.patient.jmbg) || -1;
                });
              }
              break;
            default:
              nalazi.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }
          var i = 0;
          var noviNiz = [];

          nalazi.forEach(element => {
            i++;
            noviNiz.push(element);
          });

          var json = {};
          json.total = noviNiz.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "nalazi/outbox?sort=" +
            req.query.sort +
            "&page=" +
            (req.query.page + 1) +
            "&per_page=" +
            req.query.per_page;
          var prev_page = null;
          if (json.current_page - 1 !== 0) {
            prev_page = json.current_page - 1;
          }
          json.prev_page_url =
            config.baseURL +
            "nalazi/outbox?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];
          noviNiz = noviNiz.slice(json.from - 1, json.to);
          var niz = noviNiz;

          niz.forEach(uzorak => {
            if (uzorak.status || i > 0) {
              if (uzorak.nalaz._id != null && uzorak.nalaz._id != undefined) {
                if (uzorak.timestamp != "MIGRATED") {
                  var nalaz =
                    "<button style='white-space: nowrap;' id='" +
                    uzorak.naziv +
                    "' class='btn btn-primary btn-micro'><span id='" +
                    uzorak.naziv +
                    "' class='fa fa-envelope-o'></span> NALAZ</button>";
                } else {
                  var nalaz =
                    "<button style='white-space: nowrap;' id='" +
                    uzorak.nalaz._id +
                    "' class='btn btn-primary btn-micro'><span id='" +
                    uzorak.nalaz._id +
                    "' class='fa fa-envelope-o'></span> NALAZ</button>";
                }

                var akcija = "<strong>POSLANO</strong>";
                var brisanje =
                  "<button style='white-space: nowrap;' title='Brisanje nalaza' uzorka' name='" +
                  uzorak.nalaz._id +
                  "' id='" +
                  uzorak._id +
                  "' class='btn btn-danger btn-micro'><span name='" +
                  uzorak.nalaz._id +
                  "' id='" +
                  uzorak._id +
                  "' class='fa fa-trash-o'></span> IZBRIŠI</button>";

                var dan = uzorak.created_at.toString().substring(8, 10);
                var mjesec = uzorak.created_at.toString().substring(4, 7);
                var godina = uzorak.created_at.toString().substring(11, 15);

                switch (mjesec) {
                  case "Jan":
                    mjesec = "01";
                    break;
                  case "Feb":
                    mjesec = "02";
                    break;
                  case "Mar":
                    mjesec = "03";
                    break;
                  case "Apr":
                    mjesec = "04";
                    break;
                  case "May":
                    mjesec = "05";
                    break;
                  case "Jun":
                    mjesec = "06";
                    break;
                  case "Jul":
                    mjesec = "07";
                    break;
                  case "Aug":
                    mjesec = "08";
                    break;
                  case "Sep":
                    mjesec = "09";
                    break;
                  case "Oct":
                    mjesec = "10";
                    break;
                  case "Nov":
                    mjesec = "11";
                    break;
                  case "Dec":
                    mjesec = "12";
                    break;
                  default:
                    mjesec = "00";
                    break;
                }

                var datum =
                  dan +
                  "." +
                  mjesec +
                  "." +
                  godina +
                  " " +
                  uzorak.created_at.toString().substring(16, 21);

                // console.log(datum);

                json.data.push({
                  outbox: nalaz,
                  ime: uzorak.patient.ime,
                  prezime: uzorak.patient.prezime,
                  jmbg: uzorak.patient.jmbg,
                  izmjena: datum,
                  brisanjeOutbox: brisanje,
                  to: uzorak.to,
                  datum: datum
                });
              }
            }
          });
          res.json(json);
        }
      });
  }
};

apiUrlController.apiUrlLabAssays = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    if (!req.query.filter) {
      req.query.filter = "";
    }

    var uslov = { disabled: false, active: true, test_type: "default" };

    LabAssays.find(uslov).exec(function(err, results) {
      if (err) {
        console.log("Greška:", err);
      } else {
        switch (parametar) {
          case "sifra":
            results = results.filter(function(result) {
              return result.sifra
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "naziv":
            results = results.filter(function(result) {
              return result.naziv
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "analit":
            results = results.filter(function(result) {
              return result.analit
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "sekcija":
            results = results.filter(function(result) {
              return result.sekcija
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "order":
            results = results.filter(function(result) {
              return result.grouporder
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;

          default:
            results = results.filter(function(result) {
              return (
                result.naziv
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase()) ||
                result.analit
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase())
              );
            });
            break;
        }

        var json = {};
        json.total = results.length;
        json.per_page = req.query.per_page;
        json.current_page = req.query.page;
        json.last_page = Math.ceil(json.total / json.per_page);
        json.next_page_url =
          config.baseURL +
          "assays/lab?sort=" +
          req.query.sort +
          "&page=" +
          (req.query.page + 1) +
          "&per_page=" +
          req.query.per_page;
        var prev_page = null;
        if (json.current_page - 1 !== 0) {
          prev_page = json.current_page - 1;
        }
        json.prev_page_url =
          config.baseURL +
          "assays/lab?sort=" +
          req.query.sort +
          "&page=" +
          prev_page +
          "&per_page=" +
          req.query.per_page;
        json.from = (json.current_page - 1) * 10 + 1;
        json.to = (json.current_page - 1) * 10 + 10;
        json.data = [];

        switch (parametar) {
          case "sifra":
            if (order === "asc") {
              results = results.sort(function(a, b) {
                return a.sifra.localeCompare(b.sifra, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            if (order === "desc") {
              results = results.sort(function(a, b) {
                return b.sifra.localeCompare(a.sifra, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            break;
          case "naziv":
            if (order === "asc") {
              results = results.sort(function(a, b) {
                return a.naziv.localeCompare(b.naziv, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            if (order === "desc") {
              results = results.sort(function(a, b) {
                return b.naziv.localeCompare(a.naziv, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            break;
          case "analit":
            if (order === "asc") {
              results = results.sort(function(a, b) {
                return a.analit.localeCompare(b.analit, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            if (order === "desc") {
              results = results.sort(function(a, b) {
                return b.analit.localeCompare(a.analit, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            break;
          case "sekcija":
            if (order === "asc") {
              results = results.sort(function(a, b) {
                return a.sekcija.localeCompare(b.sekcija, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            if (order === "desc") {
              results = results.sort(function(a, b) {
                return b.sekcija.localeCompare(a.sekcija, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            break;
          case "order":
            if (order === "asc") {
              results.sort(function(a, b) {
                return a.grouporder == b.grouporder
                  ? 0
                  : +(a.grouporder > b.grouporder) || -1;
              });
            }
            if (order === "desc") {
              results.sort(function(a, b) {
                return a.grouporder == b.grouporder
                  ? 0
                  : +(a.grouporder < b.grouporder) || -1;
              });
            }
            break;
          default:
            results = results.sort(function(a, b) {
              return a.naziv.localeCompare(b.naziv, undefined, {
                numeric: true,
                sensitivity: "base"
              });
            });
            break;
        }

        var niz = results.slice(json.from - 1, json.to);

        niz.forEach(labassay => {
          var multi = "";
          var icon = "";

          if (labassay.multi) {
            multi =
              '<button class="btn btn-primary btn-micro"><span class="fa fa-gears"></span></button>';
          } else if (!labassay.multi) {
            multi =
              '<button class="btn btn-pale btn-micro"><span class="fa fa-ban"></span></button>';
          } else {
          }

          if (req.query.access < 1) {
            if (!labassay.manual && !labassay.calculated) {
              icon =
                '<span style="color: #4ae387; font-size: 12px;" class="vuestic-icon vuestic-icon-settings"></span>';
            } else if (labassay.manual) {
              icon =
                '<span style="color: #d9d9d9; font-size: 12px;" class="vuestic-icon vuestic-icon-settings"></span>';
            } else if (!labassay.manual && labassay.calculated) {
              icon =
                '<span style="color: #f7cc36; font-size: 12px;" class="vuestic-icon vuestic-icon-settings"></span>';
            } else {
            }
          } else {
            if (!labassay.manual && !labassay.calculated) {
              icon = '<span class="circle badge-primary"></span>';
            } else if (labassay.manual) {
              icon = '<span class="circle badge-pale"></span>';
            } else if (!labassay.manual && labassay.calculated) {
              icon = '<span class="circle badge-warning"></span>';
            } else {
            }
          }

          var edit =
            '<button class="btn btn-warning btn-micro"><span class="glyphicon glyphicon-edit"></span></button>';
          var akcija =
            '<button class="btn btn-danger btn-micro"><span class="fa fa-trash-o"></span></button>';
          // var akcija = '<span style="color:#e34a4a;" class="fa fa-trash-o"></span>';

          json.data.push({
            labassay: labassay,
            id: labassay._id,
            icon: icon,
            sifra: labassay.sifra,
            naziv: labassay.naziv,
            analit: labassay.analit,
            jedinica: labassay.jedinica,
            multi: multi,
            order: labassay.grouporder,
            sekcija: labassay.sekcija,
            uredi: edit,
            akcija: akcija
          });
        });
        res.json(json);
      }
    });
  }
};

apiUrlController.apiUrlAnaAssays = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    if (!req.query.filter) {
      req.query.filter = "";
    }

    var uslov = {
      disabled: false,
      active: true,
      site: mongoose.Types.ObjectId(req.query.site)
    };

    AnaAssays.find(uslov)
      .populate("test aparat")
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "kod":
              results = results.filter(function(result) {
                return (
                  result.kod.includes(req.query.filter) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "naziv":
              results = results.filter(function(result) {
                return (
                  result.test.naziv
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "analit":
              results = results.filter(function(result) {
                return (
                  result.test.analit
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "sekcija":
              results = results.filter(function(result) {
                return (
                  result.sekcija
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;

            default:
              results = results.filter(function(result) {
                return (
                  (result.test.naziv
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                    result.test.test_type === "default") ||
                  (result.test.analit
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                    result.test.test_type === "default")
                );
              });
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "assays/ana?sort=" +
            req.query.sort +
            "&page=" +
            (req.query.page + 1) +
            "&per_page=" +
            req.query.per_page;
          var prev_page = null;
          if (json.current_page - 1 !== 0) {
            prev_page = json.current_page - 1;
          }
          json.prev_page_url =
            config.baseURL +
            "assays/ana?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "kod":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.kod.localeCompare(b.kod, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.kod.localeCompare(a.kod, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;
            case "naziv":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.test.naziv.localeCompare(b.test.naziv, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.test.naziv.localeCompare(a.test.naziv, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;
            case "analit":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.test.analit.localeCompare(b.test.analit, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.test.analit.localeCompare(a.test.analit, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;
            case "sekcija":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.sekcija.localeCompare(b.sekcija, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.sekcija.localeCompare(a.sekcija, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;

            default:
              results = results.sort(function(a, b) {
                return a.test.naziv.localeCompare(b.test.naziv, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach(anaassay => {
            var kod = anaassay.kod;
            var naziv = anaassay.test.naziv;
            var analit = anaassay.test.analit;
            var tip = anaassay.tipoviUzorka[0];
            var analizator = anaassay.aparat.ime;
            var metoda = anaassay.metoda;
            var sekcija = anaassay.sekcija;

            if (anaassay.reference.length) {
              var reference =
                '<button class="btn btn-primary btn-micro"><span class="glyphicon glyphicon-stats"></span></button>';
            } else {
              var reference =
                '<button class="btn btn-pale btn-micro"><span class="glyphicon glyphicon-stats"></span></button>';
            }

            var uredi =
              '<button class="btn btn-warning btn-micro"><span class="glyphicon glyphicon-edit"></span></button>';
            var akcija =
              '<button class="btn btn-danger btn-micro"><span class="fa fa-trash-o"></span></button>';

            json.data.push({
              anaassay: anaassay,
              id: anaassay._id,
              kod: kod,
              naziv: naziv,
              analit: analit,
              tip: tip,
              analizator: analizator,
              metoda: metoda,
              sekcija: sekcija,
              reference: reference,
              uredi: uredi,
              akcija: akcija
            });
          });
          res.json(json);
        }
      });
  }
};

apiUrlController.apiUrlControlEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    if (!req.query.filter) {
      req.query.filter = "";
    }

    var uslov = {
      disabled: false,
      active: true,
      site: mongoose.Types.ObjectId(req.query.site)
    };

    AnaAssays.find(uslov)
      .populate("test aparat")
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "kod":
              results = results.filter(function(result) {
                return (
                  result.kod.includes(req.query.filter) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "naziv":
              results = results.filter(function(result) {
                return (
                  result.test.naziv
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "analit":
              results = results.filter(function(result) {
                return (
                  result.test.analit
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "sekcija":
              results = results.filter(function(result) {
                return (
                  result.sekcija
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;

            default:
              results = results.filter(function(result) {
                return (
                  (result.test.naziv
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                    result.test.test_type === "default") ||
                  (result.test.analit
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                    result.test.test_type === "default")
                );
              });
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "assays/ana?sort=" +
            req.query.sort +
            "&page=" +
            (req.query.page + 1) +
            "&per_page=" +
            req.query.per_page;
          var prev_page = null;
          if (json.current_page - 1 !== 0) {
            prev_page = json.current_page - 1;
          }
          json.prev_page_url =
            config.baseURL +
            "assays/ana?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "kod":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.kod.localeCompare(b.kod, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.kod.localeCompare(a.kod, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;
            case "naziv":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.test.naziv.localeCompare(b.test.naziv, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.test.naziv.localeCompare(a.test.naziv, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;
            case "analit":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.test.analit.localeCompare(b.test.analit, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.test.analit.localeCompare(a.test.analit, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;
            case "sekcija":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.sekcija.localeCompare(b.sekcija, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.sekcija.localeCompare(a.sekcija, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;

            default:
              results = results.sort(function(a, b) {
                return a.test.naziv.localeCompare(b.test.naziv, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach(anaassay => {
            var kod = anaassay.kod;
            var naziv = anaassay.test.naziv;
            var analit = anaassay.test.analit;
            var tip = anaassay.tipoviUzorka[0];
            var analizator = anaassay.aparat.ime;
            var metoda = anaassay.metoda;
            var sekcija = anaassay.sekcija;

            if (anaassay.reference.length) {
              var reference =
                '<button class="btn btn-primary btn-micro"><span class="glyphicon glyphicon-stats"></span></button>';
            } else {
              var reference =
                '<button class="btn btn-pale btn-micro"><span class="glyphicon glyphicon-stats"></span></button>';
            }

            var uredi =
              '<button class="btn btn-warning btn-micro"><span class="glyphicon glyphicon-edit"></span></button>';
            var akcija =
              '<button class="btn btn-danger btn-micro"><span class="fa fa-trash-o"></span></button>';

            json.data.push({
              anaassay: anaassay,
              id: anaassay._id,
              kod: kod,
              naziv: naziv,
              analit: analit,
              tip: tip,
              analizator: analizator,
              metoda: metoda,
              sekcija: sekcija,
              reference: reference,
              uredi: uredi,
              akcija: akcija
            });
          });
          res.json(json);
        }
      });
  }
};

apiUrlController.apiUrlControlClone = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    if (!req.query.filter) {
      req.query.filter = "";
    }

    var uslov = {
      disabled: false,
      active: true,
      site: mongoose.Types.ObjectId(req.query.site)
    };

    AnaAssays.find(uslov)
      .populate("test aparat")
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "kod":
              results = results.filter(function(result) {
                return (
                  result.kod.includes(req.query.filter) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "naziv":
              results = results.filter(function(result) {
                return (
                  result.test.naziv
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "analit":
              results = results.filter(function(result) {
                return (
                  result.test.analit
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "sekcija":
              results = results.filter(function(result) {
                return (
                  result.sekcija
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;

            default:
              results = results.filter(function(result) {
                return (
                  (result.test.naziv
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                    result.test.test_type === "default") ||
                  (result.test.analit
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                    result.test.test_type === "default")
                );
              });
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "assays/ana?sort=" +
            req.query.sort +
            "&page=" +
            (req.query.page + 1) +
            "&per_page=" +
            req.query.per_page;
          var prev_page = null;
          if (json.current_page - 1 !== 0) {
            prev_page = json.current_page - 1;
          }
          json.prev_page_url =
            config.baseURL +
            "assays/ana?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "kod":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.kod.localeCompare(b.kod, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.kod.localeCompare(a.kod, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;
            case "naziv":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.test.naziv.localeCompare(b.test.naziv, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.test.naziv.localeCompare(a.test.naziv, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;
            case "analit":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.test.analit.localeCompare(b.test.analit, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.test.analit.localeCompare(a.test.analit, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;
            case "sekcija":
              if (order === "asc") {
                results = results.sort(function(a, b) {
                  return a.sekcija.localeCompare(b.sekcija, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function(a, b) {
                  return b.sekcija.localeCompare(a.sekcija, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              break;

            default:
              results = results.sort(function(a, b) {
                return a.test.naziv.localeCompare(b.test.naziv, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach(anaassay => {
            var kod = anaassay.kod;
            var naziv = anaassay.test.naziv;
            var analit = anaassay.test.analit;
            var tip = anaassay.tipoviUzorka[0];
            var analizator = anaassay.aparat.ime;
            var metoda = anaassay.metoda;
            var sekcija = anaassay.sekcija;

            if (anaassay.reference.length) {
              var reference =
                '<button class="btn btn-primary btn-micro"><span class="glyphicon glyphicon-stats"></span></button>';
            } else {
              var reference =
                '<button class="btn btn-pale btn-micro"><span class="glyphicon glyphicon-stats"></span></button>';
            }

            var uredi =
              '<button class="btn btn-warning btn-micro"><span class="glyphicon glyphicon-edit"></span></button>';
            var akcija =
              '<button class="btn btn-danger btn-micro"><span class="fa fa-trash-o"></span></button>';

            json.data.push({
              anaassay: anaassay,
              id: anaassay._id,
              kod: kod,
              naziv: naziv,
              analit: analit,
              tip: tip,
              analizator: analizator,
              metoda: metoda,
              sekcija: sekcija,
              reference: reference,
              uredi: uredi,
              akcija: akcija
            });
          });
          res.json(json);
        }
      });
  }
};

module.exports = apiUrlController;
