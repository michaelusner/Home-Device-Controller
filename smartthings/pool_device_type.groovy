/**
 *  Pentair Controller
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
metadata {
	definition (name: "Pentair Controller", namespace: "michaelusner", author: "Michael Usner", oauth: true) {
    	capability "Polling"
        capability "Switch"
        capability "Refresh"
        capability "Thermostat Setpoint"
        capability "Temperature Measurement"
        attribute "waterTemp", "string"
        command "allOn"
        command "allOff"
        command "poolOff"
		command "poolOn"
		command "spaOff"
		command "spaOn"
		command "poolLightOff"
		command "poolLightOn"
		command "spaLightOff"
		command "spaLightOn"
		command "blowerOff"
		command "blowerOn"
		command "cleanerOff"
		command "cleanerOn"
		command "waterFeatureOff"
		command "waterFeatureOn"
		command "spillWayOff"
		command "spillwayOn"
		command "aux7Off"
		command "aux7On"
	}

	
    
	preferences {
       	section("Select your controller") {
       		input "controllerIP", "text", title: "Controller hostname/IP", required: true
       		input "controllerPort", "port", title: "Controller port", required: true
 		}
    }
    
	simulator {
		// TODO: define status and reply messages here
	}

	tiles(scale: 2) {
    	standardTile("all", "device.all", width: 2, height: 2, canChangeBackground: true) {
			state "off", label: '${currentValue}', action: "allOn", icon: "st.Health & Wellness.health2", backgroundColor: "#ffffff"
			state "on", label: '${currentValue}', action: "allOff", icon: "st.Health & Wellness.health2", backgroundColor: "#79b821"
		}
    	standardTile("poolLight", "device.poolLight", width: 2, height: 2, canChangeBackground: true) {
			state "unknown", label: '${currentValue}', action: "poolLightUnknown", icon: "st.Lighting.light11", backgroundColor: "#F2F200"
            state "off", label: '${currentValue}', action: "poolLightOn", icon: "st.Lighting.light11", backgroundColor: "#ffffff"
			state "on", label: '${currentValue}', action: "poolLightOff", icon: "st.Lighting.light11", backgroundColor: "#79b821"
		}
        standardTile("spaLight", "device.spaLight", width: 2, height: 2, canChangeBackground: true) {
        	state "unknown", label: '${currentValue}', action: "spaLightUnknown", icon: "st.Lighting.light11", backgroundColor: "#F2F200"
			state "off", label: '${currentValue}', action: "spaLightOn", icon: "st.Lighting.light11", backgroundColor: "#ffffff"
			state "on", label: '${currentValue}', action: "spaLightOff", icon: "st.Lighting.light11", backgroundColor: "#79b821"
		}
        standardTile("pool", "device.pool", width: 2, height: 2, canChangeBackground: true) {
        	state "unknown", label: '${currentValue}', action: "poolUnknown", icon: "st.Health & Wellness.health2", backgroundColor: "#F2F200"
			state "off", label: '${currentValue}', action: "poolOn", icon: "st.Health & Wellness.health2", backgroundColor: "#ffffff"
			state "on", label: '${currentValue}', action: "poolOff", icon: "st.Health & Wellness.health2", backgroundColor: "#79b821"
		}
        standardTile("spa", "device.spa", width: 2, height: 2, canChangeBackground: true) {
        	state "unknown", label: '${currentValue}', action: "spaUnknown", icon: "st.Bath.bath4", backgroundColor: "#F2F200"
			state "off", label: '${currentValue}', action: "spaOn", icon: "st.Bath.bath4", backgroundColor: "#ffffff"
			state "on", label: '${currentValue}', action: "spaOff", icon: "st.Bath.bath4", backgroundColor: "#79b821"
		}
        standardTile("cleaner", "device.cleaner", width: 2, height: 2, canChangeBackground: true) {
        	state "unknown", label: '${currentValue}', action: "cleanerUnknown", icon: "st.Appliances.appliances2", backgroundColor: "#F2F200"
			state "off", label: '${currentValue}', action: "cleanerOn", icon: "st.Appliances.appliances2", backgroundColor: "#ffffff"
			state "on", label: '${currentValue}', action: "cleanerOff", icon: "st.Appliances.appliances2", backgroundColor: "#79b821"
		}
        standardTile("waterFeature", "device.waterFeature", width: 2, height: 2, canChangeBackground: true) {
        	state "unknown", label: '${currentValue}', action: "waterFeatureUnknown", icon: "st.Bath.bath13", backgroundColor: "#F2F200"
			state "off", label: '${currentValue}', action: "waterFeatureOn", icon: "st.Bath.bath13", backgroundColor: "#ffffff"
			state "on", label: '${currentValue}', action: "waterFeatureOff", icon: "st.Bath.bath13", backgroundColor: "#79b821"
		}
        standardTile("spillway", "device.spillway", width: 2, height: 2, canChangeBackground: true) {
        	state "unknown", label: '${currentValue}', action: "spillwayUnknown", icon: "st.Outdoor.outdoor5", backgroundColor: "#F2F200"
			state "off", label: '${currentValue}', action: "spillwayOn", icon: "st.Outdoor.outdoor5", backgroundColor: "#ffffff"
			state "on", label: '${currentValue}', action: "spillwayOff", icon: "st.Outdoor.outdoor5", backgroundColor: "#79b821"
		}
        valueTile("waterTemp", "device.waterTemp", width: 2, height: 2, canChangeBackground: true) {
        	state("temperature", label:'${currentValue}°', icon: "st.Health & Wellness.health2",
            backgroundColors:[
                [value: 31, color: "#153591"],
                [value: 44, color: "#1e9cbb"],
                [value: 59, color: "#90d2a7"],
                [value: 74, color: "#44b621"],
                [value: 84, color: "#f1d801"],
                [value: 95, color: "#d04e00"],
                [value: 96, color: "#bc2323"]
            ])
    	}
        valueTile("airTemp", "device.airTemp", width: 2, height: 2) {
        	state("temperature", label:'${currentValue}°', icon: "st.Weather.weather2",
            backgroundColors:[
                [value: 31, color: "#153591"],
                [value: 44, color: "#1e9cbb"],
                [value: 59, color: "#90d2a7"],
                [value: 74, color: "#44b621"],
                [value: 84, color: "#f1d801"],
                [value: 95, color: "#d04e00"],
                [value: 96, color: "#bc2323"]
            ])
    	}
        standardTile("refresh", "command.refresh", inactiveLabel: false) {
        	state "default", label:'refresh', action:"refresh.refresh", icon:"st.secondary.refresh-icon"
    	}
        main(["all"])
		details(["all", "poolLight", "spaLight", "airTemp", "waterTemp", "pool", "spa", "cleaner", "waterFeature", "spillway", "refresh"])
	}
}

def refresh() {
    log.info "Requested a refresh"
    poll()
}

def poll() {
	def host = getHostAddress()
    log.debug "Polling for data: " + host
    sendEvent(name: nfeatureNameame, value: featureValue)
    def poolAction = new physicalgraph.device.HubAction(
		method: "GET",
		path: "/pool/status",
		headers: [
        	HOST: host
		],
        query: []
	)
    log.debug "Status: " + poolAction
    poolAction
}

// parse events into attributes
def parse(String description) {
	log.debug "parse description: $description"
    def msg = parseLanMessage(description)
    log.debug "Parse:"
    log.debug  msg
    def result = []
  	msg.data.keySet().each {
    	log.debug "${it} -> " + msg.data.get(it)
        result << sendEvent(name: it, value: msg.data.get(it))
    }
    return result
}

def setFeature(query) {
	def host = getHostAddress()	
	log.debug "Sending request to host: " + host
	sendEvent(name: nfeatureNameame, value: "unknown")
    def poolAction = new physicalgraph.device.HubAction(
		method: "GET",
		path: "/pool",
		headers: [
        	HOST: host
		],
        query: query
	)
    log.debug "Action: " + poolAction
	return poolAction
}

// handle commands
def allOff() {
	log.debug "Executing 'allOff'"
    setFeature([
    	"pool": "off", 
    	"spa": "off",
        "poolLight": "off",
        "spaLight": "off",
        "cleaner": "off",
        "waterFeature": "off",
        "spillway": "off"])
}

def allOn() {
	log.debug "Executing 'allOn'"
	setFeature(["spa": "on", "poolLight": "on", "spaLight": "on"])
}

def poolOff() {
	log.debug "Executing 'poolOff'"
	setFeature(["pool": "off"])
}

def poolOn() {
	log.debug "Executing 'poolOn'"
	setFeature(["pool": "on"])
}

def spaOff() {
	log.debug "Executing 'spaOff'"
	setFeature(["spa": "off"])
}

def spaOn() {
	log.debug "Executing 'spaOn'"
	setFeature(["spa": "on"])
}

def poolLightOff() {
	log.debug "Executing 'poolLightOff'"
	setFeature(["poolLight": "off"])
}

def poolLightOn() {
	log.debug "Executing 'poolLightOn'"
    setFeature(["poolLight": "on"])
}

def spaLightOff() {
	log.debug "Executing 'spaLightOff'"
	setFeature(["spaLight": "off"])
}

def spaLightOn() {
	log.debug "Executing 'spaLightOn'"
	setFeature(["spaLight": "on"])
}

def blowerOff() {
	log.debug "Executing 'blowerOff'"
	setFeature(["blower": "off"])
}

def blowerOn() {
	log.debug "Executing 'blowerOn'"
	setFeature(["blower": "on"])
}

def cleanerOff() {
	log.debug "Executing 'cleanerOff'"
	setFeature(["cleaner": "off"])
}

def cleanerOn() {
	log.debug "Executing 'cleanerOn'"
	setFeature(["cleaner": "on"])
}

def waterFeatureOff() {
	log.debug "Executing 'waterFeatureOff'"
	setFeature(["waterFeature": "off"])
}

def waterFeatureOn() {
	log.debug "Executing 'waterFeatureOn'"
	setFeature(["waterFeature": "on"])
}

def spillWayOff() {
	log.debug "Executing 'spillWayOff'"
	setFeature(["spillway": "off"])
}

def spillwayOn() {
	log.debug "Executing 'spillwayOn'"
	setFeature(["spillway": "on"])
}

def aux7Off() {
	log.debug "Executing 'aux7Off'"
	setFeature(["aux7": "off"])
}

def aux7On() {
	log.debug "Executing 'aux7On'"
	setFeature(["aux7": "on"])
}

def setSpaTemperature(number) {
}

def setPoolTemperature(number) {
}

private delayAction(long time) {
    new physicalgraph.device.HubAction("delay $time")
}

private setDeviceNetworkId(ip,port){
      def iphex = convertIPtoHex(ip)
      def porthex = convertPortToHex(port)
      device.deviceNetworkId = "$iphex:$porthex"
      log.debug "Device Network Id set to ${iphex}:${porthex}"
}

private getHostAddress() {
    return "${controllerIP}:${controllerPort}"
}

private String convertIPtoHex(ipAddress) { 
    String hex = ipAddress.tokenize( '.' ).collect {  String.format( '%02x', it.toInteger() ) }.join()
    return hex
}

private String convertPortToHex(port) {
    String hexport = port.toString().format( '%04x', port.toInteger() )
    return hexport
}