var mongoose = require("mongoose");

var Inventar = require("../models/Inventar");

var OJ = mongoose.model("OJ");
var Dobavljac = mongoose.model("Dobavljac");
var VrstaUgovora = mongoose.model("VrstaUgovora");
var Produkt = mongoose.model("Produkt");
var Ugovor = mongoose.model("Ugovor");

var inventarController = {};

inventarController.CreateOJ = function(req, res) {
  var lokacija = new OJ(req.body.lokacija);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    lokacija.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        OJ.find({})
          .populate("site")
          .exec(function(err, lokacije) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              lokacije.forEach(element => {
                element.site_code = element.site.sifra;
              });

              lokacije = lokacije.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });

              res.json({
                success: true,
                message: "Unos uspješno obavljen.",
                lokacije: lokacije
              });
            }
          });
      }
    });
  }
};

inventarController.ListOJ = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    OJ.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, lista) {
      res.json({
        success: true,
        message: "Lista organizacionih jedinica",
        list: lista
      })
    }) 
  }
};

inventarController.EditOJ = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    OJ.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.lokacija._id) },

      {
        naziv: req.body.lokacija.naziv,
        site: mongoose.Types.ObjectId(req.body.lokacija.site._id),
        __v: req.body.lokacija.__v
      },

      { upsert: false }
    ).exec(function(err, lokacija) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Lokacija.find({})
          .populate("site")
          .exec(function(err, lokacije) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              lokacije.forEach(element => {
                element.site_code = element.site.sifra;
              });

              lokacije = lokacije.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });

              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                lokacija: lokacija
              });
            }
          });
      }
    });
  }
};

inventarController.DeleteOJ = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    OJ.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.lokacija._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          OJ.find({})
            .populate("site")
            .exec(function(err, lokacije) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                lokacije.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                lokacije = lokacije.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  lokacije: lokacije
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreateDob = function(req, res) {
  var dobavljac = new Dobavljac(req.body.dobavljac);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    dobavljac.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Dobavljac.find({})
          .populate("site")
          .exec(function(err, dobavljaci) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(dobavljaci.length){
                dobavljaci.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                dobavljaci = dobavljaci.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  dobavljaci: dobavljaci
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  dobavljaci: []
                });
              }
            }
          });
      }
    });
  }
};
inventarController.ListDob = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Dobavljac.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, lista) {
      res.json({
        success: true,
        message: "Lista organizacionih jedinica",
        dobavljaci: lista
      })
    }) 
  }
};
inventarController.EditDob = function(req, res) {

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Dobavljac.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.dobavljac._id) },

      {
        naziv: req.body.dobavljac.naziv,
        idbroj: req.body.dobavljac.idbroj,
        adresa: req.body.dobavljac.adresa,
        tel: req.body.dobavljac.tel,
        email: req.body.dobavljac.email,
        site: mongoose.Types.ObjectId(req.body.dobavljac.site._id),
        __v: req.body.dobavljac.__v
      },
      { upsert: false }
    ).exec(function(err, dobavljac) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Dobavljac.find({})
          .populate("site")
          .exec(function(err, dobavljaci) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              dobavljaci.forEach(element => {
                element.site_code = element.site.sifra;
              });

              dobavljaci =  dobavljaci.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                dobavljaci: dobavljaci
              });
            }
          });
      }
    });
  }
};

inventarController.DeleteDob = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Dobavljac.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.dobavljac._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Dobavljac.find({})
            .populate("site")
            .exec(function(err, dobavljaci) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                dobavljaci.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                dobavljaci = dobavljaci.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  dobavljaci: dobavljaci
                });
              }
            });
        }
      }
    );
  }
};
inventarController.CreateVrsta = function(req, res) {
  var vrstaugovora = new VrstaUgovora(req.body.vrsta);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    vrstaugovora.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        VrstaUgovora.find({})
          .populate("site")
          .exec(function(err, vrsteugovora) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(vrsteugovora.length){
                vrsteugovora.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                vrsteugovora = vrsteugovora.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  vrsteugovora: vrsteugovora
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  vrsteugovora: []
                });
              }
            }
          });
      }
    });
  }
};
inventarController.ListVrsta = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    VrstaUgovora.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, vrsteugovora) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        vrsteugovora: vrsteugovora
      })
    }) 
  }
};
inventarController.EditVrsta = function(req, res) {
  console.log(req.body)
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    VrstaUgovora.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.vrsta._id) },

      {
        naziv: req.body.vrsta.naziv,
        site: mongoose.Types.ObjectId(req.body.vrsta.site._id),
        __v: req.body.vrsta.__v
      },
      { upsert: false }
    ).exec(function(err, vrsta) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        VrstaUgovora.find({})
          .populate("site")
          .exec(function(err, vrsteugovora) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              vrsteugovora.forEach(element => {
                element.site_code = element.site.sifra;
              });

              vrsteugovora =  vrsteugovora.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                vrsteugovora: vrsteugovora
              });
            }
          });
      }
    });
  }
};
inventarController.DeleteVrsta = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    VrstaUgovora.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.vrsta._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          VrstaUgovora.find({})
            .populate("site")
            .exec(function(err, vrsteugovora) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                vrsteugovora.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                vrsteugovora = vrsteugovora.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  vrsteugovora: vrsteugovora
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreateUgovor = function(req, res) {
  
  req.body.ugovor.created_by = req.body.decoded.user
  var ugovor = new Ugovor(req.body.ugovor);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    ugovor.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Ugovor.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, ugovori) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(ugovori.length){
                ugovori.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                ugovori = ugovori.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  ugovori: ugovori
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  ugovori: []
                });
              }
            }
          });
      }
    });
  }
};

inventarController.ListUgovor = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Ugovor.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site vrsta dobavljac oj').exec(function (err, ugovori) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        ugovori: ugovori
      })
    }) 
  }
};

inventarController.EditUgovor = function(req, res) {

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Ugovor.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.ugovor._id) },

      {
        naziv: req.body.ugovor.naziv,
        vrijednost:req.body.ugovor.vrijednost,
        vazi_od:req.body.ugovor.vazi_od,
        vazi_do:req.body.ugovor.vazi_do,
        created_at:req.body.ugovor.created_at,
        updated_at:req.body.ugovor.updated_at,
        created_by:req.body.ugovor.created_by,
        vrsta:mongoose.Types.ObjectId(req.body.ugovor.vrsta._id),
        dobavljac:mongoose.Types.ObjectId(req.body.ugovor.dobavljac._id),
        oj:mongoose.Types.ObjectId(req.body.ugovor.oj._id),
        site: mongoose.Types.ObjectId(req.body.ugovor.site._id),
        __v: req.body.ugovor.__v
      },
      { upsert: false }
    ).exec(function(err, ugovor) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Ugovor.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, ugovori) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              ugovori.forEach(element => {
                element.site_code = element.site.sifra;
              });

              ugovori =  ugovori.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                ugovori: ugovori
              });
            }
          });
      }
    });
  }
};

inventarController.DeleteUgovor = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Ugovor.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.ugovor._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Ugovor.find({})
            .populate("site vrsta dobavljac oj")
            .exec(function(err, ugovori) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                ugovori.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                ugovori = ugovori.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  ugovori: ugovori
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreateKlasa = function(req, res) {
  

  var klasa = new Klasa(req.body.klasa);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    klasa.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Klasa.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, klase) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(klase.length){
                klase.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                klase = klase.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  klase: klase
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  ugovori: []
                });
              }
            }
          });
      }
    });
  }
};
inventarController.ListKlasa = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Klasa.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, klase) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        klase: klase
      })
    }) 
  }
};

inventarController.EditKlasa = function(req, res) {
 
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Klasa.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.klasa._id) },

      {
        naziv: req.body.klasa.naziv,
        site: mongoose.Types.ObjectId(req.body.klasa.site._id),
        __v: req.body.klasa.__v
      },
      { upsert: false }
    ).exec(function(err, klasa) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Klasa.find({})
          .populate("site")
          .exec(function(err, klase) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              klase.forEach(element => {
                element.site_code = element.site.sifra;
              });

              klase =  klase.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                klase: klase
              });
            }
          });
      }
    });
  }
};
inventarController.DeleteKlasa = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Klasa.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.klasa._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Klasa.find({})
            .populate("site vrsta dobavljac oj")
            .exec(function(err, klase) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                klase.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                klase = klase.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  klase: klase
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreateProgram = function(req, res) {
  

  var program = new Program(req.body.program);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    program.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Program.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, programi) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(programi.length){
                programi.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                programi = programi.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  programi: programi
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  programi: []
                });
              }
            }
          });
      }
    });
  }
};

inventarController.ListProgram = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Program.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, programi) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        programi: programi
      })
    }) 
  }
};

inventarController.EditProgram = function(req, res) {
 
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Program.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.program._id) },

      {
        naziv: req.body.program.naziv,
        site: mongoose.Types.ObjectId(req.body.program.site._id),
        __v: req.body.program.__v
      },
      { upsert: false }
    ).exec(function(err, program) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Program.find({})
          .populate("site")
          .exec(function(err, programi) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              programi.forEach(element => {
                element.site_code = element.site.sifra;
              });

              programi =  programi.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                programi: programi
              });
            }
          });
      }
    });
  }
};

inventarController.DeleteProgram = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Program.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.program._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Program.find({})
            .populate("site vrsta dobavljac oj")
            .exec(function(err, programi) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                programi.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                programi = programi.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  programi: programi
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreatePlatforma = function(req, res) {
  

  var platforma = new Platforma(req.body.platforma);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    platforma.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Platforma.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, platforme) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(platforme.length){
                platforme.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                platforme = platforme.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  platforme: platforme
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  platforme: []
                });
              }
            }
          });
      }
    });
  }
};

inventarController.ListPlatforma = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Platforma.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, platforme) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        platforme: platforme
      })
    }) 
  }
};

inventarController.EditPlatforma = function(req, res) {
 
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Platforma.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.platforma._id) },

      {
        naziv: req.body.platforma.naziv,
        site: mongoose.Types.ObjectId(req.body.platforma.site._id),
        __v: req.body.platforma.__v
      },
      { upsert: false }
    ).exec(function(err, platforma) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Platforma.find({})
          .populate("site")
          .exec(function(err, platforme) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              platforme.forEach(element => {
                element.site_code = element.site.sifra;
              });

              platforme =  platforme.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                platforme: platforme
              });
            }
          });
      }
    });
  }
};

inventarController.DeletePlatforma = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Platforma.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.platforma._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Platforma.find({})
            .populate("site vrsta dobavljac oj")
            .exec(function(err, platforme) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                platforme.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                platforme = platforme.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  platforme: platforme
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreateProdukt = function(req, res) {
  
  var platforma = new Platforma(req.body.platforma);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    platforma.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Platforma.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, platforme) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(platforme.length){
                platforme.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                platforme = platforme.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  platforme: platforme
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  platforme: []
                });
              }
            }
          });
      }
    });
  }
};
module.exports = inventarController;
