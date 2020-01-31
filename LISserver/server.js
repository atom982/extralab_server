
'use strict';
const net = require('net');
const Client = require('./client'); // importing Client class
const config = require('../config/index')
const {
  StringDecoder
} = require('string_decoder');
var funkcija = require('./funkcije');


const { crc16modbus } = require('crc');



class lisServer {
  constructor(port, address) {
    //this.port = process.env.lisPORT;
    this.address = '127.0.0.1';
    // Holds our currently connected clients
    this.clients = [];
    this.poruka = [];
    this.message = [];
    this.query = {};
    this.sendmessage = [];
    this.counter = 0;
    this.frameCounter = 0
    this.nakcounter = 0;
    this.timer = setTimeout(function () {}, 15000);
    this.stxsent1 =false
    this.stxsent2 =false
    this.bt1message =[]
    this.bt2message =[] 
  }
  /*
   * Starting the server
   * The callback argument is executed when the server finally inits
   */
  broadcast(message, clientSender) {
    this.clients.forEach((client) => {
      if (client === clientSender) {
        client.sendMessage(message);
        //console.log('Šaljem na adresu: ' + client.address + ', port: ' + client.port);
        //console.log(JSON.stringify(message))
      }
      if (client.sn === "frontClient") {
        client.sendMessage(message);
        //console.log('Šaljem na adresu: ' + client.address + ', port: ' + client.port);
      }
    });

  }
  broadcast_to_analyser(message, analyser_ip) {
    this.clients.forEach((client) => {
      if (client.address.includes(analyser_ip)) {
        //console.log('saljem na analizator:'+client.address)
        client.sendMessage(message);
      }
    });
  }
  start(io,port,aparat, callback) {
    let lisserver = this; // we'll use 'this' inside the callback belo
    this.port = port
    lisserver.connection = net.createServer((socket) => {
      socket.setEncoding('utf8');
      socket.setNoDelay(false);
      let client = new Client(socket);
      console.log(aparat+` konektovan -> adresa: ${client.address}, port: ${port}`);

      // Storing client for later usage
      lisserver.clients.push(client);
      
      var frame = '';
      var frames = '';
      var frame_number = 1;
      var incom_frame_nr = '';
      var emerald = ''
      var eliteframe = ''
      //--------------------------------------------
      // setInterval(() => {
      //   var temp_rec = [];
      //   temp_rec.push("H|\\^&|||iLab650^1.00^U10714300027^H1R1L1|||||||P|1|")
      //   temp_rec.push("L|1")
      //   funkcija.parsaj_query(temp_rec, function (poruka) {
      //     poruka.forEach(element => {
      //       lisserver.broadcast(element, client)
      //     });
          
      //     lisserver.counter = 0;
      //   });
      // }, 50000);
      //--------------------------------------------
      socket.on('data', (data) => {
        console.log(JSON.stringify(data))
        //----------------------Emerald blok
        if (data.charCodeAt(data.length - 1) !== 10) { //podaci od aparata
          frame += data; //dodaj u buffer \u001a

          //console.log(frame.toString('hex'))
          //console.log(frame.toString())
          //console.log(JSON.stringify(data))
         
          if (data.includes('\u001a')) { //ENQ primljen
            lisserver.poruka.push("H|\\^&|||D-Cell60^1.00^RJ-1C110261^H1R1L1|||||||P|1|")
            lisserver.poruka.push("R|"+frame)
            funkcija.parsaj_rezultat(lisserver.poruka, io);
            frame = ''
            lisserver.poruka = [] 
          }
          
          if (data.charCodeAt(data.length - 1) === 3 ) {
               //------------END OF Dimension xpand BLOCK
               //lisserver.broadcast('\u0006', client)
               //socket.write('\u0006');

            if(frame.indexOf("\u0002") >= 0 && !frame.includes('|')){


              if(frame.indexOf("\u0003") >= 0 ){
                //console.log('Check if poll,message or query')
                //console.log(JSON.stringify(frame))
                if(frame !='\u0002R1\u0003'){
                  if (frame.includes('X')) { //ACK primljen
                      console.log('odgovor ILAB 650:'+JSON.stringify(frame))
                      frame = ''
                      lisserver.poruka = [] 
                  } else{
                    console.log('Parsam rezultat ILAB 650:'+JSON.stringify(frame))
                    lisserver.poruka.push("H|\\^&|||iLab650^1.00^U10714300027^H1R1L1|||||||P|1|")
                    lisserver.poruka.push("R|"+frame)
                    funkcija.parsaj_rezultat(lisserver.poruka, io);
                    lisserver.broadcast('\u0002E18\u0003', client)
                    frame = ''
                    lisserver.poruka = [] 
                  }  

                }else{
                  var temp_rec = [];
                  console.log('Parsam query ILAB 650:')
                  temp_rec.push("H|\\^&|||iLab650^1.00^U10714300027^H1R1L1|||||||P|1|")
                  temp_rec.push("L|1")
                  funkcija.parsaj_query(temp_rec, function (poruka) {
                    poruka.forEach(element => {
                      console.log('Šaljem order za ILAB 650:'+JSON.stringify(element))
                      lisserver.broadcast(element, client)
                    });
                    frame = ''
                    lisserver.poruka = [] 
                    lisserver.counter = 0;
                  });
                  //lisserver.broadcast('\u0002E18\u0003', client)
                  
                  //lisserver.broadcast('\u0002W10000S003S91006  0S003S91006      1910061130150111001000010011002\u0003', client)
                }
                
              }
            } 
            frame = ''
          } 
          
        } else {
          console.log('ELMIR - frame analysis checkpoint')
          frame = frame + data;

              //   JSON.stringify(frame).forEach(element => {
              //     console.log(element)
              // });
            for (var i = frame.length - 1; i >= 0; i--) {
              if (frame[i] === "\u0005") {
                frame = frame.substring(i, frame.length);
                var FR =  JSON.stringify(frame)
                console.log(FR)
              }
            }
  
            if (frame.indexOf("\u0002") >= 0) { //ako postoji STX
                incom_frame_nr = frame.substring(frame.indexOf("\u0002") + 1, frame.indexOf("\u0002") + 2); //F# se nalazi iza STX tj njegov index je index stx+1                
                if (frame_number == incom_frame_nr) { //ako su F# jednaki provjeravaj checksum
                  if (funkcija.checksum(frame)) {
                    lisserver.poruka.push(frame); // dodaj frame u globalni niz poruka (server variable)
                    socket.write('\u0006'); //ACK //pošalji ACK
                  } else {
                    socket.write('\u0021'); //NAK //pošalji NAK
                    frame_number -= 1;
                    console.log('checksum NOT OK')
                  }
                } else {
                  socket.write('\u0021'); //NAK
                  console.log("Brojevi frame -ova se ne slažu, šaljem NAK...");
                }
              
              if (frame_number === 7) { // na broju 7 resetuj frame na nulu
                frame_number = 0;
              } else {
                frame_number += 1; //inkrementiraj frame
              }
    
              frame = ''
              } 
        }

        if (data.includes('\u0005')) { //ENQ primljen
          console.log("ENQ primljen: ");
          socket.write('\u0006'); //šalji ACK
          frame_number = 1;
        }
        if (data.includes('\u0006')) { //ACK primljen
          console.log("ACK primljen: ");
        }   
 
        if (data.includes('\u0004')) {
          //console.log("EOT primljen: ");
          
          frame_number = 1;

          ///lisserver.broadcast('\u0006', client);
          lisserver.message = funkcija.uredi_ETB(lisserver.poruka);

          var record_type = '';
          var temp_rec = [];
          var message_type = '';


          //console.log("Primljena poruka:")

          var temp = lisserver.message[0]
          if (temp != undefined) {
            if (temp.includes("\r")) {
              lisserver.message = temp.split("\r")
              if(lisserver.message[lisserver.message.length-1].includes('C|')){
                //console.log('nepravilan terminator')
                lisserver.message.push('L|1|N')
                
              }else{
                //console.log('pravilan terminator')
              }
            }
          }
          console.log(lisserver.message);
          lisserver.message.forEach(function (element) {
            record_type = element.charAt(0)
            switch (record_type) {
              case 'H':
                var header = element.split("|");
                var sender = header[4].split("^");
                //console.log("header u serveru")
                if (sender[1] === "CDRuby") {
                  client.sn = sender[0].trim()

                } else {
                  client.sn = sender[2];
                }
                if(element.includes('E 1394-97')){
                  client.sn='251025'
                }
                temp_rec.push(element);
                //console.log(client.sn)
                //console.log(temp_rec)
                break;
              case 'P':
                temp_rec.push(element);
                break;
              case 'O':
                temp_rec.push(element);
                break;
              case 'C':
                //temp_rec.push(element);
                var comment = element.split('|')
                //message_type = 'komentar'
                break;
              case 'R':
                temp_rec.push(element);
                message_type = 'rezultat';
                break;
              case 'Q':
                temp_rec.push(element);
                message_type = 'query';
                break;
              case 'L':

                if (message_type === 'komentar') {
                  lisserver.broadcast('\u0006', client);
                }
                if (message_type === 'rezultat') {
                  temp_rec.push(element);
                  message_type = '';
                  funkcija.parsaj_rezultat(temp_rec, io);
                }
                if (message_type === 'query') {
                  //console.log('Query');
                  temp_rec.push(element);
                  funkcija.parsaj_query(temp_rec, function (poruka) {
                    lisserver.sendmessage = poruka;
                    var enq = Buffer.from('\u0005');
                    lisserver.broadcast('\u0005', client);
                    console.log("Saljem ENQ za slanje ordera...");
                    lisserver.counter = 0;
                  });
                  message_type = '';
                }
                temp_rec = [];
                break;
              default:
                console.log("Nepozanat tip frame -a.");

            }

          });
          lisserver.poruka = [];
          lisserver.message = [];
        }

        if (data.charCodeAt(0) === 6){// || data.charCodeAt(0) === 4) { //ACK primljen
          
          clearTimeout(lisserver.timer);
          frame_number = 1;
          var cs = require('./funkcije');
          var stx = '\u0002';
          var etx = '\u0003';
          var cr = '\u000D';
          var lf = '\u000A';
          var eot = '\u0004';
          var enq = '\u0005';
          if (lisserver.frameCounter === lisserver.sendmessage.length) {
            console.log(lisserver.sendmessage.length)
            if(lisserver.sendmessage.length){
              lisserver.broadcast(eot, client);
            }
            lisserver.counter = 0;
            lisserver.frameCounter = 0
            lisserver.sendmessage = []
          }
          if (lisserver.frameCounter < lisserver.sendmessage.length) {
            var text = lisserver.sendmessage[lisserver.frameCounter];

            if (lisserver.frameCounter === lisserver.sendmessage.length - 1) {

              frames = '\u0002';
              frames += String(lisserver.counter + 1);
              frames += lisserver.sendmessage[lisserver.frameCounter];
              frames += cr
              frames += etx
              var checksum = cs.kreiraj_checksum(String(lisserver.counter + 1) + text + '\u000D' + '\u0003');
              frames += checksum;
              frames += cr
              frames += lf
              console.log('saljem frame '+lisserver.frameCounter)
              console.log(JSON.stringify(frames))
              lisserver.broadcast(frames, client);
              if(lisserver.counter+1 === 7){
                lisserver.counter = -1;
              }else{
                lisserver.counter += 1;
              }
              lisserver.frameCounter += 1;
              clearTimeout(lisserver.timer);
            } else {
              frames = '\u0002';
              frames += String(lisserver.counter + 1);
              frames += lisserver.sendmessage[lisserver.frameCounter];
              frames += cr
              frames += etx
              var checksum = cs.kreiraj_checksum(String(lisserver.counter + 1) + text + '\u000D' + '\u0003');
              frames += checksum;
              frames += cr
              frames += lf
              lisserver.broadcast(frames, client);
              if(lisserver.counter+1 === 7){
                lisserver.counter = -1;
              }else{
                lisserver.counter += 1;
              }
              lisserver.frameCounter += 1;
              lisserver.timer = setTimeout(function () {
                lisserver.broadcast(eot, client);
              }, 15000);
            }
          }
        }
        if (data.charCodeAt(0) === 21) { //NAK primljen
          console.log("NAK...");
          io.emit('kompletiran', 'NAK', undefined, undefined, undefined, undefined)  
          // lisserver.nakcounter++;
          // if (lisserver.nakcounter < 2) {
          //   setTimeout(function () {

          //     if (lisserver.counter >= 1) {

          //       lisserver.counter -= 1;
          //       const enq = Buffer.from('\u0005');
          //       lisserver.broadcast('\u0005', client);
          //       console.log("Šaljem ENQ...");

          //     }

          //   }, 20000);
          // } else {
          //   console.log("NAK primljen 6 puta, prenos terminiran. Provjeriti frame koji je LIS slao ka klijent -u.");
          // }

        }


      });

      // Triggered when this client disconnects
      socket.on('end', () => {
        // Removing the client from the list
        lisserver.clients.splice(lisserver.clients.indexOf(client), 1);
        console.log(`${client.name} Disconnected.`);

      });

      socket.on('error', (error) => {

        if (error.code == 'ECONNRESET') {
          console.log('Konekcija resetovana.');
          lisserver.clients.splice(lisserver.clients.indexOf(client), 1);
          console.log(`${client.name} Diskonektovan.`);
        }

      });
    });
    // starting the server
    this.connection.listen(port);
   
    // setuping the callback of the start function
    this.connection.on('listening', function () {
      console.log('ATOM | lis server running || PORT: %j', lisserver.port);
    });


  }

}
module.exports = lisServer;