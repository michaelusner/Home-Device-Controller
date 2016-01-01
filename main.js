var bodyParser = require('body-parser')
var express = require('express')
var request = require('request')
var schedule = require('node-schedule')
var async = require('async')
var parseString = require('xml2js').parseString;
var pool_controller = require('./pool_controller')
var harmony = require('harmonyhubjs-client')
var sleep = require('sleep');
var logger = require('./log')
var app = express()
var port = 8081
var harmonyHub = 'harmonyhub.usner.net'
var tunerName = 'tuner.usner.net'
var tuner = require('./yamaha_controller')
tuner.connect(tunerName)

//E8DE27067F01

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/harmony/activities', function (req, res) {
    ret = ''
    harmony(harmonyHub).then(function(harmonyClient) {
            harmonyClient.getActivities().then(function(activities) {
            activities.some(function(activity) {
                console.log(activity.label)
                ret += activity.label + '<br/>'
            })
            res.send(ret)
        })
    })
})

app.get('/harmony/plex', function (req, res) {
    harmony(harmonyHub)
    .then(function(harmonyClient) {
        harmonyClient.getActivities()
        .then(function(activities) {
            activities.some(function(activity) {
                if (activity.label === 'Plex') {
                    console.log('Watch Plex...')
                    var id = activity.id;
                    //tuner.command('<YAMAHA_AV cmd="PUT"><Zone_2><Power_Control><Power>Standby</Power></Power_Control></Zone_2></YAMAHA_AV>')
                    harmonyClient.startActivity(id)
                    harmonyClient.end()
                    res.sendStatus(200)
                }
            });
        });
    });
})

app.get('/harmony/tv', function (req, res) {
    harmony(harmonyHub)
    .then(function(harmonyClient) {
        harmonyClient.getActivities()
        .then(function(activities) {
            activities.some(function(activity) {
                if (activity.label === 'Watch TV') {
                    console.log('Watch TV...')
                    var id = activity.id;
                    //tuner.command('<YAMAHA_AV cmd="PUT"><Zone_2><Power_Control><Power>Standby</Power></Power_Control></Zone_2></YAMAHA_AV>')
                    harmonyClient.startActivity(id)
                    harmonyClient.end()
                    res.sendStatus(200)
                }
            });
        });
    });
})


app.get('/harmony/off', function (req, res) {
    harmony(harmonyHub).then(function(harmonyClient) {
        console.log('Turning Harmony off...')
        harmonyClient.turnOff()
        harmonyClient.end()
        res.sendStatus(200)            
    })
})


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

//app.get('/pool', function (req, res) {
//    logger.info("Getting pool status")
//    pool_controller.getPoolStatus(res)
//});
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
// Parameters:
//      feature=status
// Valid feature strings are: 
// "spa", "cleaner", "blower", "spaLight", "poolLight", "pool", "waterFeature", "spillway", "aux7"
// Example line to turn pool and lights on:
// {    
//      http://localhost:80901/pool?pool=on&poolLight=on&spaLight=on
// }
app.get('/pool', function (req, res) {
    console.log(req.query)
    funcs = []
    params = []
    for (var param in req.query) {
        params.push(param)
    }

    pool_controller.setFeature(param, req.query[param], function(err, obj) {
        if (err) {
            res.status(500).send("Failed to set feature state", param, req.query[param])
        } else {
            res.status(200).send(obj)
        }
    })
 })

var callback = 'http://192.168.1.10:39500/';
var x = 1
setInterval(function() {
    pool_controller.getPoolStatus(function(obj) {
        //obj.waterTemp = x
        //obj.airTemp = x+5
        //x += 1
        request.post({
            localAddress: '192.168.1.2',
            url: callback,
            json: obj
        }, function (error, resp) {
            if (error != null) {
                console.log('response', error, resp);
            }
        })
    })
}, 10000)
   
 
app.get('/pool/lights/on', function (req, res) {
    pool_controller.setLights('on', res)
})
 
 app.get('/pool/lights/off', function (req, res) {
    pool_controller.setLights('off', res)
})
 
 app.get('/pool/status', function (req, res) {
    pool_controller.getPoolStatus(function(obj) {
            logger.info(obj)
            res.status(200).send(obj)
    })
 })
 
 app.get('/tuner/patio/pandora', function (req, res) {
     console.log('Patio tuner on: Pandora')
     error = ""
     logger.info("Tuner power on")     
     tuner.command('<YAMAHA_AV cmd="PUT"><Zone_2><Power_Control><Power>On</Power></Power_Control></Zone_2></YAMAHA_AV>', function(result) {
         if (!result) error += "Failed to power on"
     })
     logger.info("Tuner input Pandora")
     tuner.command('<YAMAHA_AV cmd="PUT"><Zone_2><Input><Input_Sel>Pandora</Input_Sel></Input></Zone_2></YAMAHA_AV>', function(result) {
        if (!result) error += 'Failed to set to Pandora'
     })
     logger.info("Tuner volume -28")
     tuner.command('<YAMAHA_AV cmd="PUT"><Zone_2><Volume><Lvl><Val>-28</Val><Exp>1</Exp><Unit>dB</Unit></Lvl></Volume></Zone_2></YAMAHA_AV>', function(result) {
         if (!result) error += 'Failed to set volume level to -28'
     })
     logger.info("Tuner sleep 120")
     tuner.command('<YAMAHA_AV cmd="PUT"><Zone_2><Power_Control><Sleep>120 min</Sleep></Power_Control></Zone_2></YAMAHA_AV>', function(result) {
         if (!result) error += 'Failed to set sleep timer'
     })
     if (error != '') {
         logger.error("Failed to turn on patio")
         res.status(500).send(error)
     } else {
        res.status(200).send("Patio tuner on: Pandora")
     }
 })
  
app.get('/tuner/patio/off', function (req, res) {
    console.log('Patio tuner off')
    tuner.command('<YAMAHA_AV cmd="PUT"><Zone_2><Power_Control><Power>Standby</Power></Power_Control></Zone_2></YAMAHA_AV>', function(result) {
        if (result) {
            res.status(200).send("Patio tuner off")
        } else {
            res.status(500).send("Failed to turn patio tuner off")
        }
    })
})

app.get('/tuner/pandora/thumbup', function (req, res) {
    console.log('Pandora thumb dup')
    tuner.command('<YAMAHA_AV cmd="PUT"><Pandora><Play_Control><Feedback>Thumb Up</Feedback></Play_Control></Pandora></YAMAHA_AV>', function(result) {
        if (result) {
            res.status(200).send("Pandora thumb up")
        } else {
            res.status(500).send("Failed to Pandora thumb up")
        }
    })
})

app.get('/tuner/pandora/thumbdown', function (req, res) {
    console.log('Pandora thumb dup')
    tuner.command('<YAMAHA_AV cmd="PUT"><Pandora><Play_Control><Feedback>Thumb Down</Feedback></Play_Control></Pandora></YAMAHA_AV>', function(result) {
        if (result) {
            res.status(200).send("Pandora thumb down")
        } else {
            res.status(500).send("Failed to Pandora thumb down")
        }
    })
})

app.get('/tuner/pandora/next', function (req, res) {
    console.log('Pandora next')
    tuner.command('<YAMAHA_AV cmd="PUT"><Pandora><List_Control><Cursor>Sel</Cursor></List_Control></Pandora></YAMAHA_AV>', function(result) {
        if (result) {
            res.status(200).send("Pandora next")
        } else {
            res.status(500).send("Failed to Pandora next")
        }
    })
})

app.get('/patio/off', function(req, res) {
    pool_controller.setAll('off', res)
})

// the server entry point
var server = app.listen(port, function () {
    var host = '127.0.0.1'
    var port = server.address().port
    logger.info("Home-Device-Controller listening at http://%s:%s", host, port)
})
