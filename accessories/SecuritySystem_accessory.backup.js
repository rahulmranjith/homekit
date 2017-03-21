var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var Gpio = require('onoff').Gpio,
    PIRSensor = new Gpio(27, 'in');
// here's a fake temperature sensor device that we'll expose to HomeKit
var RMR_SECURITYSYSTEM = {
    State: 0,
    getState: function() {
        console.log("Getting the current state!");
        return RMR_SECURITYSYSTEM.State;
    },
    randomState: function() {
        // randomize temperature to a value between 0 and 100
        if (RMR_SECURITYSYSTEM.State == 4) {
            RMR_SECURITYSYSTEM.State = 0;
        } else {
            RMR_SECURITYSYSTEM.State = RMR_SECURITYSYSTEM.State + 4;
        }
    },

    setSensorState: function(value) {

        console.log("setting state")
        RMR_SECURITYSYSTEM.State = value;
        if (value == 1) {
            start();
        } else {
            stop();
        }

    }
}


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:securitysystem');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var securitysensor = exports.accessory = new Accessory('Security System', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
securitysensor.username = "11:5A:3A:B3:AE:FA";
securitysensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
securitysensor
    .addService(Service.SecuritySystem)
    .getCharacteristic(Characteristic.SecuritySystemCurrentState)
    .on('get', function(callback) {
        console.log("current get " + RMR_SECURITYSYSTEM.getState());
        // return our current value
        callback(null, RMR_SECURITYSYSTEM.getState());
    })
    .on('set', function(value, callback) {
        console.log("current set " + value)
        callback();
    });

securitysensor
    .getService(Service.SecuritySystem)
    .getCharacteristic(Characteristic.SecuritySystemTargetState)
    .on('get', function(callback) {
        console.log("target get " + RMR_SECURITYSYSTEM.getState());
        // return our current value
        callback(null, RMR_SECURITYSYSTEM.getState());
    })
    .on('set', function(value, callback) {
        console.log("target set " + value)
        RMR_SECURITYSYSTEM.setSensorState(value);
        callback();
    });


var systemOn;
var timer;

function start() {

    timer = setInterval(function() {
        var statePIR = PIRSensor.readSync();
        if (statePIR == 1) {
            RMR_SECURITYSYSTEM.State = 4
            //securitysensor.CaptureImage();
            securitysensor
                .getService(Service.SecuritySystem)
                .setCharacteristic(Characteristic.SecuritySystemCurrentState, RMR_SECURITYSYSTEM.State);
        } else {
            RMR_SECURITYSYSTEM.State = 0;
            securitysensor
                .getService(Service.SecuritySystem)
                .setCharacteristic(Characteristic.SecuritySystemCurrentState, RMR_SECURITYSYSTEM.State);
        }
    }, 999)
}

function stop() {
    clearTimeout(timer);
};



//
// // randomize our temperature reading every 3 seconds
// setInterval(function() {
//
//   RMR_SECURITYSYSTEM.randomState();
//
//   // update the characteristic value so interested iOS devices can get notified
//   securitysensor
//     .getService(Service.SecuritySystem)
//     .setCharacteristic(Characteristic.SecuritySystemCurrentState, RMR_SECURITYSYSTEM.State);
//
// }, 60000);
