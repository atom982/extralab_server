module.exports = {
  create_report: function (report, config, data, legenda, sekcijeniz, napomena, 
    res, specificni, type, naziv, lokacija, site, site_data, reprint) {

    // console.log(reprint)

    // QR Code

    var qrcodeText =
    data.prezime +
    " " +
    data.ime +
    ", " +
    data.godiste +
    "\n" +
    data.datum +
    " " +
    data.vrijeme.substring(0, 5) +
    "\n" +
    data.protokol;

    const QRCode = require("qrcode");

    QRCode.toFile(
      config.QRCodes + report._id + ".png",
      qrcodeText,
      {
        width: 90,
        height: 90,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      function (err) {


     

  }
  );
  }
};
