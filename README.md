This is the first attempt at using node.js as a controller for my home automation.
I started with a simple function to connect to the Yamaha RX650 but have made the best progress on the Pentair pool controlling features.
There is NO UI for this project.  It's meant to be run as a simple REST interface to the included modules.

Also note that there is no security currently implemented.  It's designed to run on a home network at this point, but I will eventually expand it so I can open a port on my router and control remotely.  

If you provide your pushbullet API key and a device name, you will be able to get notifications in the event that 1) your pool/spa is on but 2) your pump is not running.  This indicates that the pump has stopped due to air suction etc.


Example:
  To turn on pool light:
  
  HTTP POST
  
  Headers: Content-Type:application/json
  
  Body: {"feature":"poolLight", "state": "on"}
  
  The response code indicates success/failure with either a 200 (success) or 400 (failure)
  
  The response body will contain a JSON representation of the current state of all pool features
  
  Example response:
  
  200 OK
  {
    time: "15:51"
    spa: 0
    cleaner: 0
    blower: 0
    spaLight: 0
    poolLight: 1
    pool: 1
    waterFeature: 0
    spillway: 0
    aux7: 0
    waterTemp: 86
    airTemp: 92
  }
    

Current package requirements:

(node.js - of course)

    >npm install express
    
    >npm install request
    
    >npm install xml2js
    

Usage:
* install node.js and the packages
* Execute >node main.js
* GET and POST according to the descriptions in the main.js file



TODO:
* Use the async.retry function to retry failed requests (though it seems reliable enough for now as is)
* Security for controlling remotely
* Android app?
