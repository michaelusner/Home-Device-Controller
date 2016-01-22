var PushBullet = require('pushbullet')
var pusher = new PushBullet('<your key>')
var device = 'udvLUsjAAbMkeA0a'
var SerialPort = require("serialport").SerialPort
var events = require('events');
var logger = require('./log');

var eventEmitter = new events.EventEmitter();

var COM = 'COM3'

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

const pumpPacketFields = {
    POWER: 4,
    WATTS: 7,
    RPM: 9
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
    getPoolStatus: function (callback) {
        eventEmitter.once('poolStatus', function (obj) {
            return callback({
                "time": obj.time,
                "waterTemp": obj.waterTemp,
                "airTemp": obj.airTemp,
                "pool": obj.pool,
                "spa": obj.spa,
                "blower": obj.blower,
                "poolLight": obj.poolLight,
                "spaLight": obj.spaLight,
                "cleaner": obj.cleaner,
                "spillway": obj.spillway,
                "waterFeature": obj.waterFeature
            })
        });
    },
    getPumpStatus: function (res) {
        eventEmitter.once('pumpStatus', function (obj) {
            res.send(obj)
        });
    },
    setFeature: function (feature, state, callback) {
        logger.info('setFeature: feature=' + feature)
        logger.info('setFeature: state=' + state)
        return sendCommand(feature, state, function(err, obj) {
            console.log('sendCommand returned:')
            console.log(obj)
            callback(err, obj)
        });
    },
    setLights: function(state, res) {
        sendCommand('spaLight', state, function(err, obj) {
            logger.info(obj)
            if (stateStr[obj.spaLight] != stateStr[state]) {
                logger.error("Failed to set spa light state to " + stateStr[state])
                res.status(400).send("Failed to set spa light state to " + state)
            } else {
                sendCommand('poolLight', state, function(err, obj) {
                    console.log(obj)
                    if (stateStr[obj.poolLight] != stateStr[state]) {
                        logger.error("Failed to set pool light state to " + state)
                        res.status(400).send(obj)
                    }
                })
            }
            res.status(200).send("Set pool and spa light to " + state)
        })
    },
    setAll: function (state, res) {
        features  = ['spa', 'poolLight', 'spaLight']
        logger.info('Setting  spa to ' + state)
        sendCommand('spa', state, function(obj) {
            if (obj.spa != state) {
                logger.error("Failed to set spa state to " + state)
                res.status(400).send("Failed to set spa state to " + state)
            } else {
                    sendCommand('spaLight', state, function(obj) {
                    console.log(obj)
                    if (obj.spaLight != state) {
                        logger.error("Failed to set spa light state to " + state)
                        res.status(400).send("Failed to set spa light state to " + state)
                    } else {
                        sendCommand('poolLight', state, function(obj) {
                            console.log(obj)
                            if (obj.poolLight != state) {
                                logger.error("Failed to set pool light state to " + state)
                                res.status(400).send("Failed to set pool light state to " + state)
                            } else {
                                sendCommand('blower', state, function(obj) {
                                    console.log(obj)
                                    if (obj.blower != state) {
                                        logger.error("Failed to set blower state to " + state)
                                        res.status(400).send("Failed to set blower state to " + state)
                                    } else {
                                        eventEmitter.once('poolStatus', function (obj) {
                                            if (res.status) {
                                                res.status(200).send(obj)
                                            } else {
                                                logger.info(obj)
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

function checkPump() {
    eventEmitter.once('poolStatus', function (pool) {
        eventEmitter.once('pumpStatus', function (pump) {
            if ((pool.pool == 1 || pool.spa == 1) && (pump.power == 0 || pump.rpm == 0)) {
                console.log("PROBLEM!!")
                pusher.note(device, 'Pool Alert', 'Pool or spa is on but pump is not running!!', function(error, response) {
                    console.log(error)
                    console.log(response)
                });
            }
        });
    });
}

check = setInterval(function() { checkPump() }, 5*60*1000)

var sendCommand = function(sFeature, sState, callback) {
    iFeature = featureStr[sFeature]
    iState = stateStr[sState]
    logger.info("Setting " + sFeature + " to " + sState)
    if (sFeature == "poolTemp") {
        packet = [00, 255, 165, 31, ctrl.MAIN, ctrl.REMOTE, 134, 4, sState, 97, 5, 0]
    } else {
        packet = [00, 255, 165, 31, ctrl.MAIN, ctrl.REMOTE, 134, 2, iFeature, iState]
    }
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
            return callback(err=null, obj={
                "time": obj.time,
                "waterTemp": obj.waterTemp,
                "airTemp": obj.airTemp,
                "pool": obj.pool,
                "spa": obj.spa,
                "blower": obj.blower,
                "poolLight": obj.poolLight,
                "spaLight": obj.spaLight,
                "cleaner": obj.cleaner,
                "spillway": obj.spillway,
                "waterFeature": obj.waterFeature
            })            
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
                //logger.info(strData)
                if (start != null) {
                    if (data[start + packetFields.FROM] == ctrl.MAIN && data[start + packetFields.DEST] == ctrl.BROADCAST) {
                        equip1 = data[start + packetFields.EQUIP1]
                        equip2 = data[start + packetFields.EQUIP2]
                        var status = {
                            time: data[start + packetFields.HOUR] + ':' + data[start + packetFields.MIN],
                            spa: equip1 & 1?"on":"off",
                            cleaner: (equip1 & 2) >> 1?"on":"off",
                            blower: (equip1 & 4) >> 2?"on":"off",
                            blower: (equip1 & 4) >> 2?"on":"off",
                            spaLight: (equip1 & 8) >> 3?"on":"off",
                            poolLight: (equip1 & 16) >> 4?"on":"off",
                            pool: (equip1 & 32) >> 5?"on":"off",
                            waterFeature: (equip1 & 64) >> 6?"on":"off",
                            spillway: (equip1 & 128) >> 7?"on":"off",
                            aux7: equip2 & 1?"on":"off",
                            waterTemp: data[start + packetFields.WATER_TEMP],
                            airTemp: data[start + packetFields.AIR_TEMP]
                        }
                        // if the time field is whacked, don't send any data.
                        d = status.time.split(":")
                        if (parseInt(d[0]) < 24 && parseInt(d[1]) < 60) {
                            eventEmitter.emit('poolStatus', status)
                        }
                    }
                    // Pump packet
                    else if (data[start + packetFields.FROM] == ctrl.PUMP1 && data[start + packetFields.DEST] == ctrl.MAIN && data[start + packetFields.ACTION] == 7){
                        var status = {
                            power: null,
                            watts: null,
                            rpm: null
                        }

                        myStr = ""
                        for (var i=start; i<data.length; i++) {
                            myStr += data[i] + ' '
                        }
                        
                        status.watts = (data[start+pumpPacketFields.WATTS] * 256) + data[start+pumpPacketFields.WATTS + 1]
                        status.rpm = (data[start+pumpPacketFields.RPM] * 256) + data[start+pumpPacketFields.RPM + 1]
                        if (data[start + pumpPacketFields.POWER] == 10) {
                            status.power = 1
                        } else {
                            status.power = 0
                        }
                        eventEmitter.emit('pumpStatus', status);
                    }
                }
            }
        });
    }
});