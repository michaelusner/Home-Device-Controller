This is the first attempt at using node.js as a controller for my home automation.
I started with a simple function to connect to the Yamaha RX650 but have made the best progress on the Pentair pool controlling features.
There is NO UI for this project.  It's meant to be run as a simple REST interface to the included modules.

Example:
  To turn on pool lights:
  
  HTTP POST
  
  Headers: Content-Type:application/json
  
  Body: {"feature":"pool", "state": "on"}
  
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
    npm install express
    npm install request
    npm install xml2js

Usage:
* install node.js and the packages
* Execute >node main.js
* GET and POST according to the descriptions in the main.js file
