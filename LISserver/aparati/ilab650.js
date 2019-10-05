module.exports = {

    parsaj_rezultat: function (record, io,serijski) {
  
      var mongoose = require("mongoose");
  
      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");
  
      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");
  
      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");
  
      var ControlSamples = require("../../models/Postavke");
      var ControlSamples = mongoose.model("ControlSamples");
  
      var Kontrole = require("../../models/Postavke");
      var Kontrole = mongoose.model("Kontrole");
  
      var calculated = require("../../funkcije/calculated/calculated");
  
  
      var sn = '';
      var sifra_p = '';
      var vrijeme_prijenosa = '';
      var gender = '';
      var sid = '';
      var qc = false
      var type_of_r = '';
      var dilucija = '';
      var reagens_lot = '';
      var reagens_sn = '';
      var rezultat_f = '';
      var jedinice_f = '';
      var vrijeme_rezultata = '';
      var module_sn = '';
  
      var spol = '';
      var jmbg = '';
      var tpsa = "";
      var fe = "";

        console.log('usao u iLab650 fajl')
        //console.log(record)
      record.forEach(function (element) {
        record_type = element.charAt(0);
        switch (record_type) {
          case 'H':
            console.log("Header: ");
            var header = element.split("|");
            var sender = header[4].split("^");
            sn = sender[2];
            vrijeme_prijenosa = Date.now();
            console.log("Vrijeme prenosa: " + vrijeme_prijenosa);
            break;

          case 'R':
            console.log("Rezultati iLab650: ");
            // • Accept.
            // <STX>M<FS>A<FS><FS>E2<ETX>
            // • Reject because computer is out of memory.
            // <STX>M<FS>R<FS>1<FS>24<ETX>
            dRezultati = element.substring(element.indexOf("\u0002") + 1, element.indexOf("\u0003"))
            
            //var dRezultati = element.split("\u001c");
            var fRezultati  =[]
            var nrTests = 0
            console.log(dRezultati)
            sid = dRezultati.substring(6,18).trim()
            nrTests =dRezultati.substring(23,25)

            // 11 pozicija broj testova dRezultati[10]
            for (let index = 0; index < nrTests; index++) {
                fRezultati.push({
                    test:dRezultati.substring(26+index*22,26+index*22+3),
                    rezultat_f:dRezultati.substring(26+index*22+6,26+index*22+14),
                    errorcode:dRezultati.substring(26+index*22+14,26+index*22+22)
                })
            }        
            console.log('SID:'+sid)
            console.log(fRezultati)
            console.log('broj testova:'+nrTests)

                Samples.findOne({ id: sid }).populate('patient tests.labassay').exec(function (err, uzorak) {
                  if (err) {
                    console.log("Greška:", err);
                  }
                  else {                  
                    if (uzorak === null) {
                      console.log('U LIS-u ne postoji definisan order za uzorak broj: ' + sid);
                    } else {
                      var sekc = uzorak.tests[0].labassay.sekcija
                      console.log("Uzorak pronađen");
                      if (uzorak.status != "REALIZOVAN") {
                        fRezultati.forEach(rezRe => {

                      
                        AnaAssays.findOne({ kod: rezRe.test,aparat:mongoose.Types.ObjectId(serijski) }).populate('test').lean().exec(function (err, test) {
                          if (err) {
                            console.log("Greška:", err);
                          }
                          else {
                            // console.log(test)
                            if (test === null) {
                              console.log('U LIS-u ne postoji definisan test sa sifrom:' + sifra_p + ' ni na jednom aparatu' + sn);
                            } else {
                              uzorak.tests.forEach(elementu => {
  
                                if ((elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "U OBRADI") || (elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_r)) {
                                  console.log('Match Found')
                                  // console.log(elementu)
                                  elementu.status_t = "REALIZOVAN"
                                  elementu.status_r = false
                                  var rezultat = {};
                                  rezultat.anaassay = test
                                  rezultat.sn = sn
                                  rezultat.vrijeme_prijenosa = vrijeme_prijenosa
                                  rezultat.vrijeme_rezultata = Date.now()
                                  rezultat.dilucija = 'dilucija'
                                  rezultat.module_sn = sn
                                  rezultat.reagens_lot = 'reagens_lot'
                                  rezultat.reagens_sn = 'reagens_sn'
                                  var rezF = ''
                                  fRezultati.forEach(temp => {
                                        if(temp.test ===test.kod){
                                            rezF = temp.rezultat_f
                                        }
                                  })
                                  if(rezF.trim() ===""){
                                    rezF = "-----"
                                  }
                                  rezultat.rezultat_f = rezF.trim()

                                  rezultat.jedinice_f = test.test.jedinica
                                  rezultat.rezultat_p = 'rezultat_p'
                                  rezultat.jedinice_p = 'jedinice_p'
                                  rezultat.rezultat_i = 'rezultat_i'
                                  rezultat.odobren = false
                                  var json = {};
                                  json.labassay = test.test
                                  json.rezultat = []
                                  json.rezultat.push(rezultat)
                                  Results.findOne({ id: uzorak.id }).populate('rezultati rezultati.labassay patient').exec(function (err, result) {
                                    if (err) {
                                      console.log("Greška:", err)
                                    }
                                    else {
                                      if (result.created_at === null) {
                                        result.created_at = Date.now()
                                      }
                                      spol = result.patient.spol
                                      jmbg = result.patient.jmbg
                                      // console.log(result)
                                      var counter = 0
                                      result.rezultati.forEach(element => {
                                        counter++
                                        if ((element.labassay.sifra === test.test.sifra) && (element.retest = true)) {
  
                                          element.retest = false // Ne postavljati ovdje, nego kada dođe rezultat.
                                          result.updated_at = Date.now()
                                          element.rezultat.push(rezultat)
  
                                          uzorak.status = "U OBRADI"
                                          if (element.rezultat.length < 1) {
                                            element.status = "NIJE ODOBREN"
                                          }
                                          if (element.status != "ODOBREN") {
                                            element.status = "NIJE ODOBREN"
                                            uzorak.save()
                                            var received = elementu.labassay.naziv
                                            console.log(':: Dosao test sa AU480: ' + elementu.labassay.naziv)
  
                                            result.save(function (err, novi) {
                                              if (err) {
                                                console.log("Greška:", err);
                                              } else {
                                                console.log("Rezultat sačuvan.")
                                                var komplet = true
                                                var formula = []
                                                var tocalculate = ''
  
                                                novi.rezultati.forEach(element => {
                                                  if (!element.rezultat.length) {
                                                    komplet = false
                                                  }
                                                  if ((element.retest)) {
                                                    komplet = false
                                                  }
                                                  if (element.labassay.calculated) {
                                                    var match = false
                                                    element.labassay.calculatedTests.forEach(required => {
                                                      if (test.test._id.equals(mongoose.Types.ObjectId(required.labassay))) {
                                                        match = true
                                                        console.log(':: Ima kalkulisani test koji zavisi od rezultata testa: ' + received)
                                                        
                                                      }
                                                    })
                                                    if (match) {
                                                      console.log(':: Kalkulisani test: ' + 'not defined here.')
  
  
                                                      element.labassay.calculatedTests.forEach(required => {
                                                        novi.rezultati.forEach(rez => {
                                                          if (rez.labassay.equals(mongoose.Types.ObjectId(required.labassay))) {                                                          
                                                            formula = element.labassay.calculatedFormula
                                                            if (rez.rezultat.length > 0) {
                                                              // arr.forEach((o, i, a) => a[i] = myNewVal) 
                                                              formula.forEach((clan, i, array) => {
                                                                if (clan.length > 10) {
                                                                  if (rez.labassay.equals(mongoose.Types.ObjectId(clan))) {                                                                  
                                                                    array[i] = rez.rezultat[rez.rezultat.length - 1].rezultat_f
                                                                  }
                                                                }
                                                              });
                                                              var calculatedComp = true
                                                              var final = ''
                                                              var j = 0
                                                              
                                                              formula.forEach(broj => {
                                                                j++
                                                                final += broj
                                                                // Izračunavanje, pod uslovom da su pristigli svi testovi
                                                                if (broj.length > 15) {
                                                                  calculatedComp = false
                                                                }
                                                                if (broj.trim() === "") {
                                                                  calculatedComp = false
                                                                }
                                                              })
  
                                                              if (calculatedComp && j === formula.length) {
                                                                
                                                                AnaAssays.findOne({ test: element.labassay._id }).populate('aparat test').exec(function (err, testap) {
                                                                  if (err) {
                                                                    console.log("Greška:", err);
                                                                  }
                                                                  else {
                                                                    console.log(testap.test.naziv)
                                                                    tocalculate = testap.test.naziv
                                                                    console.log('Računam kalkulisani test: ' + tocalculate)
                                                                    console.log('Formula za kalkulisani test: ' + tocalculate)
                                                                    console.log(final)                                                                  
                                                                    element.status = "NIJE ODOBREN"
                                                                    element.rezultat = []
                                                                    element.rezultat.push({
                                                                      anaassay: testap._id,
                                                                      // rezultat_f:eval(final).toFixed(2),
                                                                      rezultat_f: calculated.rezultat(final, spol, jmbg, tocalculate, tpsa, fe, uzorak.id, 'Olympus AU400'),
                                                                      jedinice_f: element.labassay.jedinica,
                                                                      vrijeme_prijenosa: Date.now(),
                                                                      vrijeme_rezultata: Date.now(),
                                                                      odobren: false,
                                                                    })
                                                                    uzorak.tests.forEach(elementup => {
                                                                      if (elementup.labassay.equals(element.labassay._id)) {
                                                                        elementup.status_t = "REALIZOVAN"
                                                                      }
                                                                    })
                                                                    uzorak.save()
                                                                    novi.save()
                                                                    console.log('Izvršeno.')
                                                                  }
                                                                })
  
                                                              }
                                                            }
                                                          }
                                                        })
                                                      })
                                                      match = false
                                                    }
                                                  }
                                                });
                                                if (komplet) {
                                                  io.emit('kompletiran', novi.id, uzorak.site, sekc)
                                                }
                                              }
                                            })
                                          }
                                        }
                                      });
                                    }
                                  });
                                }
                              })
                            }
                          }
                        })
                        // for 
                      })
                      }
                    }
                  }
                })
              
          
            break;
          default:
            console.log("Nepoznat Type of Frame!");
        }
      });
    },
  
    parsaj_query: function (record,callback) {
  
      var mongoose = require("mongoose");
      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");
      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");
      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");
      var cs = require('../funkcije');
  
      var record_type = '';
      var json = {};
      var testovi = [];
      var recordret = [];
      var dilution = ''
      console.log('Ulazak u DimensionXpand plus query ');
      console.log(record);
      record.forEach(function (element) {
        record_type = element.charAt(0);
        switch (record_type) {
          case 'H':
            console.log("Header: ");
            var header = element.split("|");
            var sender = header[4].split("^");
            json.sn = sender[2];
            json.vrijeme_prijenosa = Date.now();
            break;

          case 'I':
            console.log("Query: ");
            var niz = element.split('\u001c')

            json.sid = niz[1];
            console.log('SID:'+json.sid)

              var testovi = [];
              Samples.findOne({ id: json.sid }).populate('tests.labassay').exec(function (err, uzorak) {
                if (err) {
                  console.log("Greška:", err);
                }
                else {
                  if (uzorak === null) {
                    console.log("U LIS-u ne postoji uzorak sa brojem: " + json.sid);
                    recordret.push('N\u001c'+'6A');
                    callback(recordret);
                  } else {
                    var tests = '';
                    var counter = 0;
                    var FS='\u001c'
                    switch (uzorak.type) {
                        case 'Krv':json.stype='W'         
                            break;
                        case 'Plazma':json.stype='2'         
                            break;
                        case 'Urin':json.stype='3'         
                            break;                   
                        default:
                        json.stype='1'
                            break;
                    }
                    var serijski='5c71b6f5c599d9279717a334'
                    AnaAssays.find({aparat:mongoose.Types.ObjectId(serijski)}).populate('aparat test').lean().exec(function (err, anaassays) {
                      uzorak.tests.forEach(function (test) {
                        anaassays.forEach(function (anaassay) {
                          if ((anaassay.aparat.sn === json.sn) && (anaassay.test.sifra === test.labassay.sifra) && (anaassay.test.calculated)) {
                            test.status_t = "U OBRADI"
                          }
                          if (((anaassay.test.sifra === test.labassay.sifra) && (test.status_r === true) ) || ((anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "ZAPRIMLJEN"))) {
                            testovi.push(anaassay.kod)
  
                            test.status_t = "U OBRADI"
                          }
                        })
                      })
                      testovi.forEach(element => {
                        counter++
                        tests += element+FS 
                      });
                      Results.findOne({ 'id': uzorak.id }).populate('patient rezultati.labassay').exec(function (err, rezultat) {
  
                        if (testovi.length < 1) {
                            console.log("Za uzorak :" + json.sid + " ne postoji niti jedan rerun zahtjev!");
                            recordret.push('N\u001c'+'6A');
                            callback(recordret);
                        } else {
                          rezultat.status = "U OBRADI"
                          uzorak.status = "U OBRADI"
                          rezultat.save(function (err) {
                            if (err) {
                              console.log("Greška:", err);
  
                            } else {
  
                            }
                          });
                          uzorak.save()
                          console.log("Kreiram Record: ");
                          var imipr = rezultat.patient.ime+' '+rezultat.patient.prezime
                        
                          imipr = imipr.replace(/Ć/g,'C')
                          imipr= imipr.replace(/Č/g,'C')
                          imipr = imipr.replace(/Š/g,'S')
                          imipr = imipr.replace(/Đ/g,'D')
                          imipr= imipr.replace(/Ž/g,'Z')
                          imipr = imipr.replace(/č/g,'c')
                          imipr = imipr.replace(/ć/g,'c')
                          imipr = imipr.replace(/š/g,'s')
                          imipr = imipr.replace(/đ/g,'d')
                          imipr = imipr.replace(/ž/g,'z')
                          //           D <FS> 0 <FS> 0 <FS> A <FS>106  <FS>0305041 <FS>     1    <FS><FS>1<FS>  1<FS>  ** <FS> 1 <FS> 1 <FS>GLU<FS>94<ETX>
                          var order = 'D'+FS+'0'+FS+'0'+FS+'A'+FS+imipr+FS+json.sid+FS+json.stype+FS+FS+'1'+FS+'1'+FS+'**'+FS+'1'+FS+counter+FS+tests
                          var checksum = cs.kreiraj_checksumXpand(order)
                          recordret.push(order+checksum); 
                          callback(recordret);
                        }
  
                      })
                    })
                  } // else if uzorak null
  
                }
              });
            
            break;
          default:
  
            console.log("Nepoznat Type of Frame!");
  
        }
      });
    },
  
  };
  