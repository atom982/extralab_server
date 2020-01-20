const mongoose = require("mongoose");




const SchemaOJ = mongoose.Schema({
      naziv: { type: String, required: true },
      site: { type: mongoose.Schema.ObjectId, ref: "Site" }
});
const SchemaDobavljac = mongoose.Schema({
      idbroj:{ type: String, required: true },
      naziv: { type: String, required: true },
      adresa: { type: String, required: true },
      tel: { type: String, required: true },
      email: { type: String, required: true },
      site: { type: mongoose.Schema.ObjectId, ref: "Site" },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now },
      created_by: { type: String, default:"" },
      updated_by:{ type: String, default:"" },
});

const SchemaVrstaUgovora = mongoose.Schema({
  naziv: { type: String, required: true },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" }
});

const SchemaUgovor = mongoose.Schema({
      naziv:  { type: String, required: true },
      vazi_od: { type: Date, default: Date.now },
      vazi_do: { type: Date, default: Date.now },
      vrijednost: { type: String, required: true },
      vrsta:{ type: mongoose.Schema.ObjectId, ref: "VrstaUgovora" },//okvirni,revers,direktni
      dobavljac:  { type: mongoose.Schema.ObjectId, ref: "Dobavljac" },
      oj:{ type: mongoose.Schema.ObjectId, ref: "OJ" },
      site: { type: mongoose.Schema.ObjectId, ref: "Site" },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now },
      created_by: { type: String, default:"" },
      updated_by: { type: String, default:"" },
  });
  const SchemaKlasa = mongoose.Schema({
    naziv: { type: String, required: true },
    site: { type: mongoose.Schema.ObjectId, ref: "Site" }
  });
  const SchemaProgram = mongoose.Schema({
    naziv: { type: String, required: true },
    site: { type: mongoose.Schema.ObjectId, ref: "Site" }
  });
  const SchemaPlatforma = mongoose.Schema({
    naziv: { type: String, required: true },
    site: { type: mongoose.Schema.ObjectId, ref: "Site" }
  });
  const SchemaProdukt = mongoose.Schema({
    LN:  { type: String, required: true, unique:true },
    opis: { type: String, required: true },
    zasticeni_naziv: { type: String, required: true },
    zemlja_porijekla: { type: String, required: true },
    jedinica_mjere:{ type: String, required: true },
    pakovanje:{ type: String, required: true },
    upozorenje:{ type: String, required: true },
    klasa:{ type: mongoose.Schema.ObjectId, ref: "Klasa" },
    program:{ type: mongoose.Schema.ObjectId, ref: "Program" },
    platforma:{ type: mongoose.Schema.ObjectId, ref: "Platforma" },
    oj:{ type: mongoose.Schema.ObjectId, ref: "OJ" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: String, default:"" },
    updated_by:{ type: String, default:"" },
    site: { type: mongoose.Schema.ObjectId, ref: "Site" }
});

const SchemaStanje = mongoose.Schema({
    produkt:{ type: mongoose.Schema.ObjectId, ref: "Produkt" },
    kolicina:{ type: String, required: true },
    lot:{ type: String, required: true },
    shelflife:{ type: String, required: true },
    expDT:{ type: String, required: true },
    ulazDT:{ type: String, required: true },
    izlazDT:{ type: String, required: true },
    ulazKM:{ type: String, required: true },
    izlazKM:{ type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: String, default:"" },
    updated_by:{ type: String, default:"" },
    site: { type: mongoose.Schema.ObjectId, ref: "Site" }
});
const SchemaUlaz = mongoose.Schema({
  produkt:{ type: mongoose.Schema.ObjectId, ref: "Produkt" },
  faktura:{ type: String, required: true },
  kolicina:{ type: String, required: true },
  lot:{ type: String, required: true },
  shelflife:{ type: String, required: true },
  expDT:{ type: String, required: true },
  ulazDT:{ type: String, required: true },
  izlazDT:{ type: String, required: true },
  ulazKM:{ type: String, required: true },
  izlazKM:{ type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: String, default:"" },
  updated_by:{ type: String, default:"" },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" }
});
const models = [

  OJ= mongoose.model("OJ", SchemaOJ),
  Dobavljac= mongoose.model("Dobavljac", SchemaDobavljac),
  VrstaUgovora= mongoose.model("VrstaUgovora", SchemaVrstaUgovora),
  Ugovor= mongoose.model("Ugovor", SchemaUgovor),
  Klasa= mongoose.model("Klasa", SchemaKlasa),
  Program= mongoose.model("Program", SchemaProgram),
  Platforma= mongoose.model("Platforma", SchemaPlatforma),
  Produkt = mongoose.model("Produkt", SchemaProdukt),
  Stanje = mongoose.model("Stanje", SchemaStanje),
]; 

module.exports = models;
