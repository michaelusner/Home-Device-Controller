var express = require('express');
var request = require('request');
var parseString = require('xml2js').parseString;
var app = express();

var yamaha_ip = null;
var yamaha_connected = false;

PowerState = {
    OFF : 'Off',
    ON : 'On',
    STANDBY : 'Standby'
}

module.exports = {
    connect: function (ip) {
        yamaha_ip = ip;
        console.log("Connecting to " + yamaha_ip);
        var data = '<YAMAHA_AV cmd="GET"><System><Config>GetParam</Config></System></YAMAHA_AV>'
        return request({
            url: 'http://' + yamaha_ip + '/YamahaRemoteControl/ctrl',
            timeout: 1000,
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
                        //console.log(result.YAMAHA_AV.System[0].Config[0]);
                        yamaha_connected = true;
                        return 200;
                    } else {
                        console.log('Failed to connect');
                        return 500;
                    }
                });
            }
        });
    }
};

var tuner_controller = require('./yamaha_controller')
tuner_controller.connect('192.168.1.2')