var express = require('express');
var request = require('request');
var parseString = require('xml2js').parseString;
var tuner_controller = require('./yamaha_controller')
var pool_controller = require('./pool_controller')
var logger = require('./log');
var app = express();



app.get('/set_power', function (req, res) {
   if (!yamaha_connected) {}
});

app.get('/pool/status', function (req, res) {
    logger.info("Getting pool status")
    pool_controller.getStatus(res)
});

var server = app.listen(8081, function () {
    var host = '127.0.0.1'
    var port = server.address().port
    logger.info("Example app listening at http://%s:%s", host, port)
})

