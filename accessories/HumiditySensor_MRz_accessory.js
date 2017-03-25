var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;



//websocket

// here's a fake temperature sensor device that we'll expose to HomeKit
var DHT11HUM = {
    CurrentHumidity: 36,//default humidity
    getHumidity: function() {
        console.log("Getting the current humidity!");
        return DHT11HUM.CurrentHumidity;
    },

    setHumidity: function(value) {
        console.log(value);
        DHT11HUM.CurrentHumidity = Math.round(value) //Math.round(Math.random() * 100);
    }
}


var sensorHumidityUUID = uuid.generate('hap-nodejs:accessories:humidity-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var HumSensor = exports.accessory = new Accessory('Humidity Sensor MRz', sensorHumidityUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
HumSensor.username = "A3:93:33:BB:AA:AA";
HumSensor.pincode = "031-45-154";

// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
HumSensor
    .addService(Service.HumiditySensor)
    .getCharacteristic(Characteristic.CurrentRelativeHumidity)
    .on('get', function(callback) {

        // return our current value
        callback(null, DHT11HUM.getHumidity());
    });



var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');//defined the mqtt server 

client.on('connect', function() {
    client.subscribe('humidity');//on mqtt connection subscribe to humidity 

    client.on('message', function(topic, message) { // while a publish happens for humidity topic
        DHT11HUM.setHumidity(message);
        console.log("Sensor current humidity from mqtt:" + DHT11HUM.CurrentHumidity)
        // update the characteristic value so interested iOS devices can get notified
        HumSensor
            .getService(Service.HumiditySensor)
            .setCharacteristic(Characteristic.CurrentRelativeHumidity, DHT11HUM.CurrentHumidity)
        console.log(message.toString());
    });
});
