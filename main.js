var bodyParser = require('body-parser')
var express = require('express')
var request = require('request')
var parseString = require('xml2js').parseString;
var pool_controller = require('./pool_controller')
var logger = require('./log')
var app = express()
var port = 8081

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Returns a JSON encoded body containing the status of all pool components
// Example:
// http://yoururl:8181/pool
//   {
//        "time":"14:40",
//        "spa":0,
//        "cleaner":0,
//        "blower":0,
//        "spaLight":0,
//        "poolLight":0,
//        "pool":1,
//        "waterFeature":0,
//        "spillway":0,
//        "aux7":0,
//        "waterTemp":85,
//        "airTemp":92
//    }
app.get('/pool', function (req, res) {
    logger.info("Getting pool status")
    pool_controller.getPoolStatus(res)
});
// Returns a JSON encoded body containing the pump status
// Note that this only supports one pump at the moment but could easily be expanded
app.get('/pump', function (req, res) {
    logger.info("Getting pump status")
    pool_controller.getPumpStatus(res)
});

// Turn a feature on or off
// Usage:
// Action: 
//  POST
// Headers: 
//  Content-Type: application/json
// Payload:
// {    
//      "feature": <feature>,
//      "status": "on" or "off"
// }
// Valid feature strings are: 
// "spa", "cleaner", "blower", "spaLight", "poolLight", "pool", "waterFeature", "spillway", "aux7"
// Example payload to turn pool on:
// {    
//      "feature": "pool",
//      "status": "on"
// }
app.post('/pool', function (req, res) {
    logger.info("Feature: " + req.body.feature)
    logger.info("State: " + req.body.state)
    if (typeof req.body.feature == 'undefined') {
        logger.error('Unknown feature ' + req.body.feature)
        res.status(400).send('Unknown feature ' + req.body.feature)
    } else if (typeof req.body.feature == 'undefined') {
        res.status(400).send('Unknown state ' + req.body.state)
    } else if (req.body.feature == 'all') {
        pool_controller.setAll(req.body.state, res)
    } else {
        pool_controller.setFeature(req.body.feature, req.body.state, res)
    }
 });
  
// the server entry point
var server = app.listen(port, function () {
    var host = '127.0.0.1'
    var port = server.address().port
    logger.info("Home-Device-Controller listening at http://%s:%s", host, port)
})

