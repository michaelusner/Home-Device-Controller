var express = require('express');
var request = require('request');
var parseString = require('xml2js').parseString;
var logger = require('./log')
var app = express();

var yamaha_ip = null;
var yamaha_connected = false;

PowerState = {
    OFF : 'Off',
    ON : 'On',
    STANDBY : 'Standby'
}

module.exports = { 
    connect: connect,
    patioVolume: patioVolume,
    command: command,
    getStatus: getStatus
}

//<YAMAHA_AV cmd="PUT"><Pandora><Play_Control><Feedback>Thumb Up</Feedback></Play_Control></Pandora></YAMAHA_AV>
//<YAMAHA_AV cmd="PUT"><Pandora><Play_Control><Feedback>Thumb Down</Feedback></Play_Control></Pandora></YAMAHA_AV>

function connect(ip) {
        yamaha_ip = ip;
        console.log("Connecting to " + yamaha_ip);
        var data = '<YAMAHA_AV cmd="GET"><System><Config>GetParam</Config></System></YAMAHA_AV>'
        return request({
            url: 'http://' + yamaha_ip + '/YamahaRemoteControl/ctrl',
            timeout: 2000,
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'Content-Length': data.length
            },
            body: data
        }, function(error, response, body){
            if(error) {
                if (error.code == 'ETIMEDOUT') {
                    console.log('Timeout while connecting to ' + yamaha_ip);
                    yamaha_connected = false;
                    return 408;
                }
                else
                {
                    console.log(error);
                    return 404;
                }
            } else {
                parseString(body, function (err, result) {
                    if (result.YAMAHA_AV != null) {
                        console.log("Connected to " + yamaha_ip);
                        yamaha_connected = true;
                        return 200;
                    } else {
                        console.log('Failed to connect');
                        return 500;
                    }
                })
            }
        })
    }
function patioVolume(value) {
    command('<YAMAHA_AV cmd="PUT"><Zone_2><Volume><Lvl><Val>' + value + '</Val><Exp>1</Exp><Unit>dB</Unit></Lvl></Volume></Zone_2></YAMAHA_AV>')     
    console.log(getStatus())
}

function getStatus() {
        var data = '<YAMAHA_AV cmd="GET"><Zone_2><Basic_Status>GetParam</Basic_Status></Zone_2></YAMAHA_AV>'
        request({
            url: 'http://' + yamaha_ip + '/YamahaRemoteControl/ctrl',
            timeout: 2000,
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'Content-Length': data.length
            },
            body: data
        }, function(error, response, body){
            if(error) {
                if (error.code == 'ETIMEDOUT') {
                    logger.error('Timeout while connecting to ' + yamaha_ip)
                    yamaha_connected = false
                    return null
                }
                else
                {
                    logger.error(error)
                    yamaha_connected = false
                    return null
                }
            } else {
                parseString(body, function (err, result) {
                    if (result.YAMAHA_AV != null) {
                        yamaha_connected = true
                        console.log(result.YAMAHA_AV)
                        return result.YAMAHA_AV
                    } else {
                        logger.error('Failed to connect');
                        yamaha_connected = false
                        return null
                    }
                })
            }
        })
    }

function command(data, callback) {
        request({
            url: 'http://' + yamaha_ip + '/YamahaRemoteControl/ctrl',
            timeout: 2000,
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'Content-Length': data.length
            },
            body: data
        }, function(error, response, body){
            if(error) {
                if (error.code == 'ETIMEDOUT') {
                    console.log('Timeout while connecting to ' + yamaha_ip);
                    yamaha_connected = false;
                    callback(false)
                }
                else
                {
                    console.log(error);
                    callback(false)
                }
            } else {
                parseString(body, function (err, result) {
                    if (result.YAMAHA_AV != null) {
                        //console.log(body + " : success")
                        yamaha_connected = true;
                        callback(true)
                    } else {
                        console.log('Failed to connect');
                        callback(false)
                    }
                });
            }
        });
    }
