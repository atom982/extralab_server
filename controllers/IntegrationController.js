const jwt = require("jsonwebtoken"),
  config = require("../config/index");

var mongoose = require("mongoose");
var User = require("../models/User");
var Audit = require("../models/Audit");
var fs = require("fs");
var User = mongoose.model("User");
var Audit = mongoose.model("Audit_Login");
var prijem = require("../controllers/SampleController.js");

var IntegrationController = {};

// AuthController.js
IntegrationController.Bind = function(req, res) {
    console.log(req.body.integration)
    var integration = new Integration(req.body.integration);
    integration.save(function(err,bond) {
        if (err) {
          console.log("Greška:", err);
        } else {
          res.json({
            success: true,
            message: "Analiza uspješno uvezana",
            bond: bond
          });
        }
      });
},
IntegrationController.List = function(req, res) {
  console.log('Lista route')
  var lista = ''
  Integration.find({}).populate('local_id').exec(function (err, lista) {
    res.json({
      success: true,
      message: "Lista integracijskih kodova",
      list: lista
    })
    lista.forEach(test => {
      
    });
  })

},
IntegrationController.Post = function(req, res) {
  User.findOne({ email: req.body.email }, (error, user) => {
    if (error) throw error;
    if (!user)
                res.json({
                  success: false,
                  message: "Greška 1"
                });
    else {
      user.comparePassword(req.body.password, (error, matches) => {
        if (matches && !error) {
          //---------------------------------

  IntegrationRaw.findOne({ protokol: req.body.protokol }, (error, slog) => {
    if (error) throw error;
    if (!slog){

        var protokol = new IntegrationRaw(req.body)
        protokol.save(function (err, protokol) {
          if (err) {
            res.json({ success: false, message: 'Greška 2s:'+err })
          } else {
            req.body.created_at = Date.now()
            req.body.created_by = req.body.email
            req.body.duhan='NEPOZNATO'
            req.body.dijabetes='NEPOZNATO'
            req.body.telefon= 'NEPOZNATO'
            req.body.email='NEPOZNATO'
            req.body.adresa='NEPOZNATO'  
            req.body.ime= req.body.pime.toUpperCase()
            req.body.prezime= req.body.pprez.toUpperCase()
            req.body.jmbg=req.body.jmbg7.trim()+String(Math.random()*100000).substring(0,5)+'P'
            req.body.ime_oca= req.body.imeo.toUpperCase()
            req.body.spol = req.body.spol.toUpperCase()
            req.body.site= '5c69f68c338fe912f99f833b'
            var pacijent = new Patients(req.body)
            pacijent.save(function (err, pacijent) {
                if (err) {
                  res.json({ success: false, message: 'Greška 3s:'+err })
                } else {
                  console.log(req.body.analize)
                  var order={}
                  order.site='5c69f68c338fe912f99f833b'
                  order.timestamp= Date.now()
                  order.siteCode= 'S'
                  
                  order.uzorci=[ {tip: 'Serum 1',testovi:[]}, {tip: 'Serum 2',testovi:[]}, {tip: 'Serum 3',testovi:[]},{tip: 'Serum 4',testovi:[]},{tip: 'kapilarna krv',testovi:[]},{tip: 'Krv 1',testovi:[]},{tip: 'Krv 2',testovi:[]},{tip: 'Krv EDTA',testovi:[]},{tip: 'Plazma 1',testovi:[]},{tip: 'Plazma ABO',testovi:[]},{tip: 'Plazma EDTA',testovi:[]},{tip: 'Plazma Citrat',testovi:[]},{tip: 'Plazma Heparin',testovi:[]}, {tip: 'Plazma NaF',testovi:[]},{tip: 'Urin 1',testovi:[]},{tip: 'Urin 24h',testovi:[]},{tip: 'Feces 1',testovi:[]},{tip: 'Bris 1',testovi:[]},{tip: 'Ejakulat',testovi:[]}]
                  order.lokacija ='5c713f63cfe109792dfbdc9b'
                  order.drstanje = 'NE'
                  order.anticoag = 'NE'
                  order.protokol = req.body.protokol
                  var counter = 0
                  var temp =""
                  req.body.analize.forEach(remote => {
                    console.log(remote)
                    temp = remote.toString().trim()
                    Integration.findOne({remote_id:temp}).populate('local_id').exec(function (err, local) {
                      counter++
                      if(local){

                      order.uzorci.forEach(uzorak => {
                         if(uzorak.tip === local.local_id.tip){
                           uzorak.ime=uzorak.tip.split(' ')[0]
                           uzorak.code = []
                           uzorak.patient = pacijent
                          if(!uzorak.testovi.filter(e => e._id.equals(local.local_id._id)).length > 0){
                            uzorak.testovi.push({itemName: local.local_id.naziv,opis:local.local_id.analit,uzorak:local.local_id.tip,cijena:local.local_id.price,klasa:"primary",_id:local.local_id._id})
                          }
                         
                           uzorak.hitno= false
                           uzorak.time=new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, -8).replace("T", " ")
                           uzorak.komentar=''
                          }
                      });
                    }else{
                      console.log('analiza nije pronadjena')
                    }
                    if(req.body.analize.length === counter){
                      var complete = []
                      order.uzorci.forEach(uzorak => {
                        if(uzorak.testovi.length){
                          complete.push(uzorak)
                        }
                      });
                      order.uzorci=complete
                      order.decoded={user:req.body.email}
                      req.body=order
                      console.log('BEFORE SACUVAJ')
                      console.log(req.body.uzorci)
                      if(order.uzorci.length){
                        prijem.sacuvajUzorke(req,res)
                      }else{
                       res.json({ success: true, message: 'Sifre testova nisu definisane u LIS-u', protokol:req.body.protokol })
                      }
                    }
                    })
                  });    
                }
              })
              }
            })   
      }  
      else {
        res.json({ success: true, message: 'Protokol vec unesen', data:slog.protokol })
      }
    });
          //---------------------------------
        } else {
          res.json({
            success: false,
            message: "Greška 2"
          });
        }
      });
    }
  }); 

};
IntegrationController.Get = function(req, res) {
  console.log('UPIT za podatke')
  console.log(req.body)
  User.findOne({ email: req.body.email }, (error, user) => {
    if (error) throw error;
    if (!user)
                res.json({
                  success: false,
                  message: "Greška 1"
                });
    else {
      user.comparePassword(req.body.password, (error, matches) => {
        if (matches && !error) {
          //---------------------------------
          Integration.find({  }, (error, intanalize) => {
          IntegrationRaw.findOne({ protokol: req.body.protokol }, (error, slog) => {
            if (error) throw error;
            if(slog){
              var temp = []
              intanalize.forEach(intanaliza => {
                slog.analize.forEach(element => {
                  if(element ===intanaliza.remote_id){
                    temp.push({remote_id:intanaliza.remote_id,local_id:intanaliza.local_id,multi:intanaliza.multiparam.type,multi_id:intanaliza.multiparam.id})
                  }
                });
              });  
              Results.find({protokol:slog.protokol}).populate('patient').exec(function (err, results) {
              if(results.length){
                console.log('Broj uzoraka:'+results.length)
                results.forEach(result => {
                  temp.forEach(element => {
                    if(!element.multi){
                  result.rezultati.forEach(rezultat => {
                      if(rezultat.labassay.equals(mongoose.Types.ObjectId(element.local_id))){//
                        if(result.verificiran && rezultat.rezultat[rezultat.rezultat.length-1].rezultat_f!=""){
                          element.rezultat=rezultat.rezultat[rezultat.rezultat.length-1].rezultat_f
                          element.refd=rezultat.refd
                          element.refg=rezultat.refg
                          element.jedinica=rezultat.rezultat[rezultat.rezultat.length-1].jedinice_f
                        }
                      }   
                    });
                   }else{
                    result.multi.forEach(multi => {
                       multi.forEach(analit => {                 
                         if(analit.rezultat[0].anaassay.equals(element.multi_id)){
                          if(result.verificiran && analit.rezultat[0].rezultat_f!=""){
                            element.rezultat=analit.rezultat[0].rezultat_f
                            element.refd=analit.refd
                            element.refg=analit.refg
                            element.jedinica=analit.rezultat[0].jedinice_f
                          }
                         }
                       });
                     });
                   }
                  });
                });
                res.json({
                  success: true,
                  message: "Rezultati za protokol:"+slog.protokol,
                  rezultati:temp
                });              
              }else{
                res.json({
                  success: true,
                  message: "Rezultati za protokol nisu pronadjeni"
                });
              }   
            })
            }else{
              res.json({
                success: false,
                message: "Traženi protokol nije unesen!"
              });
            }
          })
        })
          //---------------------------------
        } else {
          res.json({
            success: false,
            message: "Greška 2"
          });
        }
      });
    }
  });
};
module.exports = IntegrationController;
