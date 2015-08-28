var express = require('express');
var request = require('request');
var parseString = require('xml2js').parseString;
var app = express();

var content;
var yamaha_ip;
var yamaha_connected = false;

PowerState = {
    OFF : 'Off',
    ON : 'On',
    STANDBY : 'Standby'
}

app.get('/connect', function (req, res) {
    yamaha_ip = req.query.ip;
    console.log("Connecting to " + yamaha_ip);
    var data = '<YAMAHA_AV cmd="GET"><System><Config>GetParam</Config></System></YAMAHA_AV>'
    request({
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
                res.status(408).send('Timeout');
                yamaha_connected = false;
            }
            else
            {
                console.log(error);
                res.status(404).send('Not found');
            }
        } else {
            parseString(body, function (err, result) {
                if (result.YAMAHA_AV != null) {
                    console.log("Connected to " + yamaha_ip);
                    console.log(result.YAMAHA_AV.System[0].Config[0]);
                    yamaha_connected = true;
                    res.status(200).send(result.YAMAHA_AV.System[0].Config[0]);
                } else {
                    console.log('Failed to connect');
                    res.status(404).send('Not found');
                }
            });
        }
    });
});

app.get('/set_power', function (req, res) {
   if (!yamaha_connected) {}
});

var server = app.listen(8081, function () {
    var host = '127.0.0.1'
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})

