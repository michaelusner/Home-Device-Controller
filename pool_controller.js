var SerialPort = require("serialport").SerialPort
var events = require('events');
var logger = require('./log');


var eventEmitter = new events.EventEmitter();

var COM = 'COM6'


const state = {
    OFF: 0,
    ON: 1,
}

const stateStr = {
    'off': state.OFF,
    'on': state.ON
}

const strState = {
    0: "Off",
    1: "On"
}

// offset from start of packet info
const packetFields = {
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

const ctrl = {
    BROADCAST: 15,
    MAIN: 16,
    REMOTE: 32,
    PUMP1: 96
}

const ctrlString = {
    15: 'Broadcast',
    16: 'Main',
    32: 'Remote',
    96: 'Pump1'
}
    
const feature = {
    SPA: 1,
    CLEANER: 2,
    BLOWER: 3,
    SPA_LIGHT: 4,
    POOL_LIGHT: 5,
    POOL: 6,
    WATER_FEATURE: 7,
    SPILLWAY: 8,
    AUX7: 9
}

const featureStr = {
    "spa": feature.SPA,
    "cleaner": feature.CLEANER,
    "blower": feature.BLOWER,
    "spaLight": feature.SPA_LIGHT,
    "poolLight": feature.POOL_LIGHT,
    "pool": feature.POOL,
    "waterFeature": feature.WATER_FEATURE,
    "spillway": feature.SPILLWAY,
    "aux7": feature.AUX7,
}

const strFeature = {
    1: "Spa",
    2: "Cleaner",
    3: "Blower",
    4: "Spa Light",
    5: "Pool Light",
    6: "Pool",
    7: "Water Feature",
    8: "Spillway",
    9: "Aux7",
}

module.exports = {
    getStatus: function (res) {
        eventEmitter.once('poolStatus', function (obj) {
            res.send(obj)
        });
    },
    setFeature: function (feature, state, res) {
        logger.info('setFeature: feature=' + feature)
        logger.info('setFeature: state=' + state)
        return sendCommand(feature, state, function(obj) {
            console.log('sendCommand returned:')
            console.log(obj)
            res.send(obj)
        });
    }
};

var sendCommand = function(sFeature, sState, callback) {
    iFeature = featureStr[sFeature]
    iState = stateStr[sState]
    logger.info("Setting " + sFeature + " to " + sState)
    packet = [00, 255, 165, 31, ctrl.MAIN, ctrl.REMOTE, 134, 2, iFeature, iState]
    checksum = 0
    for (var i=2; i < packet.length; i++) {
        checksum += packet[i]
    }
    packet.push(checksum >> 8)
    packet.push(checksum & 0xFF)
    logger.info("Sending " + packet)
    serialPort.write(packet, function (err, bytesWritten) {
        logger.info("Wrote " + bytesWritten + " bytes to the serial port")
        eventEmitter.once('poolStatus', function (obj) {
            return callback(obj)
        });
    });
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
            if (data.length > 1) {
                len=data.length; 
                start = null;
                // Locate the start of the packet message
                for (var i=0; i < len; i++) {
                    if (data[i] == 255 && data[i+1] == 0 && data[i+2] == 255 && data[i+3] == 165) {
                        start = i+5;
                    }
                }
                strData = ""
                for (var i=start; i<data.length; i++) {
                    strData += data[i] + ' '
                }
                if (start != null && data[start + packetFields.DATASIZE] == 29) {
                    
                    if (data[start + packetFields.FROM] == ctrl.MAIN && data[start + packetFields.DEST] == ctrl.BROADCAST) {
                        equip1 = data[start + packetFields.EQUIP1]
                        equip2 = data[start + packetFields.EQUIP2]
                        var status = {
                            time: data[start + packetFields.HOUR] + ':' + data[start + packetFields.MIN],
                            spa: equip1 & 1,
                            cleaner: (equip1 & 2) >> 1,
                            airBlower: (equip1 & 4) >> 2,
                            spaLight: (equip1 & 8) >> 3,
                            poolLight: (equip1 & 16) >> 4,
                            pool: (equip1 & 32) >> 5,
                            waterFeature: (equip1 & 64) >> 6,
                            spillway: (equip1 & 128) >> 7,
                            aux7: equip2 & 1,
                            waterTemp: data[start + packetFields.WATER_TEMP],
                            airTemp: data[start + packetFields.AIR_TEMP]
                        }
                        eventEmitter.emit('poolStatus', status);
                    }
  
                }
            }
        });
    }
});