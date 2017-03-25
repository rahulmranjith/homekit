var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;



var DS3231ESPTEMP = {
    currentTemperature: 50,
    getTemperature: function() {
        console.log("Getting the current temperature!");
        return DS3231ESPTEMP.currentTemperature;
    },

    setTemperature: function(value) {
        console.log(value);
        DS3231ESPTEMP.currentTemperature = Math.round(value) 
    }
}




// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Temperature Sensor MRz', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "A3:99:11:BB:5E:AA";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
    .addService(Service.TemperatureSensor)
    .getCharacteristic(Characteristic.CurrentTemperature)
    .on('get', function(callback) {

        // return our current value
        callback(null, DS3231ESPTEMP.getTemperature());
    });

var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');//mqtt server.

client.on('connect', function() {
    client.subscribe('temperature');

    client.on('message', function(topic, message) { //subscribe to topic
        DS3231ESPTEMP.setTemperature(message);
        console.log("Sensor current temperature from mqtt:" + DS3231ESPTEMP.currentTemperature)
        // update the characteristic value so interested iOS devices can get notified
        sensor
            .getService(Service.TemperatureSensor)
            .setCharacteristic(Characteristic.CurrentTemperature, DS3231ESPTEMP.currentTemperature)
        console.log(message.toString());
    });
});

