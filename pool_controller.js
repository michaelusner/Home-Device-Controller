var SerialPort = require("serialport").SerialPort
var events = require('events');
var logger = require('./log');
var eventEmitter = new events.EventEmitter();

var COM = 'COM6'

module.exports = {
  getStatus: function (res) {
    eventEmitter.once('poolStatus', function (obj) {
        res.send(obj)
    });
  }
};

// offset from start of packet info
var packet = {
    DEST: 0,
    FROM: 1,
    ACTION: 2,
    DATASIZE: 3,
    HOUR: 4,
    MIN: 5,
    EQUIP1: 6,
    EQUIP2: 7,
    WATER_TEMP: 18,
    AIR_TEMP: 22
}

var ctrl = {
    BROADCAST: 15,
    MAIN: 16,
    REMOTE: 32,
    PUMP1: 96
}

var ctrlString = {
    15: 'Broadcast',
    16: 'Main',
    32: 'Remote',
    96: 'Pump1'
}
    

var feature = {
    SPA: 1,
    CLEANER: 2,
    BLOWER: 3,
    SPA_LIGHT: 4,
    POOL_LIGHT: 5,
    POOL: 6,
    WATER_FEATURE: 7,
    SPILLWAY: 8,
    AUX: 9
}

function dec2bin(dec){
    return (dec >>> 0).toString(2);
}

var serialPort = new SerialPort(COM, {
    baudrate: 9600
}, false);

 
serialPort.open(function (error) {
    if ( error ) {
        logger.info('failed to open: ' + error);
    } else {
        logger.info('Opened ' + COM);
        serialPort.on('data', function(data) {
            if (data.length > 8) {
                len=data.length; 
                start = null;
                // Locate the start of the packet message
                for (var i=0; i < len; i++) {
                    if (data[i] == 255 && data[i+1] == 0 && data[i+2] == 255 && data[i+3] == 165) {
                        start = i+5;
                    }
                }
                
                if (start != null && data[start + packet.DATASIZE] == 29) {
                    //logger.info('From: ' + ctrlString[data[start + packet.FROM]]);
                    //logger.info('To  : ' + ctrlString[data[start + packet.DEST]]);
                    if (data[start + packet.FROM] == ctrl.MAIN && data[start + packet.DEST] == ctrl.BROADCAST) {
                        equip1 = data[start + packet.EQUIP1]
                        equip2 = data[start + packet.EQUIP2]
                        var status = {
                            time: data[start + packet.HOUR] + ':' + data[start + packet.MIN],
                            spa: equip1 & 1,
                            cleaner: (equip1 & 2) >> 1,
                            air_blower: (equip1 & 4) >> 2,
                            spa_light: (equip1 & 8) >> 3,
                            pool_light: (equip1 & 16) >> 4,
                            pool: (equip1 & 32) >> 5,
                            water_feature: (equip1 & 64) >> 6,
                            spillway: (equip1 & 128) >> 7,
                            aux: equip2 & 1,
                            water_temp: data[start + packet.WATER_TEMP],
                            air_temp: data[start + packet.AIR_TEMP]
                        }
                        //logger.info('Time         : ' + status.time)
                        //logger.info('Pool         : ' + status.pool)
                        //logger.info('Spa          : ' + status.spa)
                        //logger.info('Cleaner      : ' + status.cleaner)
                        //logger.info('Air Blower   : ' + status.air_blower)
                        //logger.info('Spa Light    : ' + status.spa_light)
                        //logger.info('Pool Light   : ' + status.pool_light)
                        //logger.info('Water Feature: ' + status.water_feature)
                        //logger.info('Spillway     : ' + status.spillway)
                        //logger.info('Aux7         : ' + status.aux)
                        eventEmitter.emit('poolStatus', status);
                    }
                    //str = "";
                    //for (var i=start; i<len; i++) {
                        //str += data[i] + ' ';
                    //}
                    
                    //logger.info(str);
                    //logger.info();                   
                }
            }
        });
    //serialPort.write("ls\n", function(err, results) {
      //logger.info('err ' + err);
      //logger.info('results ' + results);
    //});
    }
});