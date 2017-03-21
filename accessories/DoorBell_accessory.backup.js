var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

function publishMqtt(type, value) {
    console.log(value);
    var mqtt = require('mqtt');
    var clients = mqtt.connect('mqtt://localhost');
    clients.publish(type, value.toString());
}
var Gpio = require('onoff').Gpio,
    PIRSensor = new Gpio(27, 'in', 'both');

start();
// here's a fake temperature sensor device that we'll expose to HomeKit
var DoorBell = {
    Volume: 18,
    switchEvent: 1,
    getState: function() {
        console.log("Getting the current state!");
        return DoorBell.Volume;
    },
    setValue: function(value) {
        // randomize temperature to a value between 0 and 100
        DoorBell.Volume = value;
    }
}


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var DoorBellUUID = uuid.generate('hap-nodejs:accessories:door-bell');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var doorbell = exports.accessory = new Accessory('Door Bell', DoorBellUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
doorbell.username = "11:11:22:33:44:3A";
doorbell.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
doorbell
    .addService(Service.Doorbell)
    .getCharacteristic(Characteristic.Volume)
    .on('set', function(value, callback) {
        DoorBell.setValue(value);
        callback();
    })
    .on('get', function(callback) {
        // return our current value
        callback(null, DoorBell.getState());
    });

// randomize our temperature reading every 3 seconds



// PIRSensor.watch(function(error, input) {
//     if (error) {
//         throw error;
//     }
//     console.log(input);
//
// })

var timer;

var switchPosition = 1;

function start() {
    timer = setInterval(function() {

        if (switchPosition == 1) {
            switchPosition = 0;
        } else {
            switchPosition = 1;
        }
        doorbell
            .getService(Service.Doorbell)
            .setCharacteristic(Characteristic.Volume, switchPosition);
        console.log("Volume");
    }, 3000)
}

function stop() {
    clearTimeout(timer);
};
