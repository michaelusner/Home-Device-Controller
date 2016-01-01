/**
 *  Pool Temperature Alert
 *
 *  Copyright 2015 Michael Usner
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */
import groovy.time.*
definition(
    name: "Spa Temperature",
    namespace: "michaelusner",
    author: "Michael Usner",
    description: "Stuff",
    category: "My Apps",
    iconUrl: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience.png",
    iconX2Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
    iconX3Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png")


preferences {
    section("Choose a temperature sensor... "){
		input "waterTemp", "capability.temperatureMeasurement", title: "Water Temperature"
        input "maxTemp", "number", title: "Max Temp?",   required: true
        input "spa", "capability.switch", multiple: true, required: false, title: "Spa Switch"
	}
    section("Send Notifications?") {
        input "sendPush", "bool", required: false,
              title: "Send Push Notification when spa reaches temperature?"
    }
}

def installed() {
	log.debug "Installed with settings: ${settings}"
	
	initialize()
}

def updated() {
	log.debug "Updated with settings: ${settings}"

	unsubscribe()
	initialize()
}

def initialize() {
	state.messageSent = null
	subscribe(waterTemp, "waterTemp", waterTemperatureHandler)
    subscribe(airTemp, "airTemp", airTemperatureHandler)
    subscribe(spa, "spa", spaHandler)
    subscribe(pool, "pool", poolHandler)
}

def poolHandler(evt) {
	log.debug("Pool handler!")
    log.debug(evt.value)
}

def spaHandler(evt) {
	log.debug("Spa handler!")
    log.debug("state.messageSent = " + state.messageSent)

    def latest = spa[0].latestValue("spa")
    if (latest == "on") {
    	log.debug("Spa On")
        if (evt.isStateChange())
        	state.messageSent = false
    } else {
    	log.debug("Spa Off")
        state.messageSent = false
    }
}

def waterTemperatureHandler(evt)
{
	def temperature = evt.value.toInteger()
    def spaState = getSpaState()

	log.debug('Water temperature changed to ' + temperature)
    log.debug("maxTemp = " + maxTemp)
    log.debug("Spa state: " + spaState)

    if (temperature >= maxTemp && spaState == "on") {
    	log.debug("Spa temperature is " + evt.value)
        log.debug("Message Sent: " + state.messageSent)
        if (state.messageSent == false || state.messageSent == null) {
        	log.debug("Sending message that spa is ready")
        	sendPush("Spa is ready!")
        	state.messageSent = true
        }       
  	}
}

def airTemperatureHandler(evt)
{
	log.debug('Air temperature changed to ' + evt.value)
}

def getSpaState() {
	// get the spa state
    def latest = spa[0].latestValue("spa")
    return latest
}