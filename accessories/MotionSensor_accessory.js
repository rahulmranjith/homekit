var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var cmd = require('node-cmd');

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
var FAKE_MOTIONSENSOR = {
    isPresent: false,
    getState: function() {
        console.log("Getting the current state!");
        return FAKE_MOTIONSENSOR.isPresent;
    },
    randomState: function() {
        // randomize temperature to a value between 0 and 100
        FAKE_MOTIONSENSOR.isPresent = !FAKE_MOTIONSENSOR.isPresent;
    }
}


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:motion-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('PIR Motion Sensor', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "11:39:3B:AE:53:3A";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
    .addService(Service.MotionSensor)
    .getCharacteristic(Characteristic.MotionDetected)
    .on('get', function(callback) {

        // return our current value
        callback(null, FAKE_MOTIONSENSOR.getState());
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

var foundMotion = false;

function start() {
    timer = setInterval(function() {
        var statePIR = PIRSensor.readSync();
        if (statePIR == 1) {
            console.log(statePIR)
            if (foundMotion) {
                //motion detected for 1 sec
                console.log("motion detected...")
                cmd.run('sudo sh /home/pi/node_modules/hap-nodejs/task');
                sensor
                    .getService(Service.MotionSensor)
                    .setCharacteristic(Characteristic.MotionDetected, true);



                publishMqtt('MOTION', '**Intrusion**');
                foundMotion = false;
            }
            if (foundMotion == false) {
                foundMotion = true;
            }
        } else {
            sensor
                .getService(Service.MotionSensor)
                .setCharacteristic(Characteristic.MotionDetected, false);
            console.log("NO  motion detected...")
            foundMotion = false;
        }
    }, 1000)
}

function stop() {
    clearTimeout(timer);
};



//
// var mqtt = require('mqtt');
// var client = mqtt.connect('mqtt://localhost');
//
// client.on('connect', function() {
//     client.subscribe('MOTION');
//
//     client.on('message', function(topic, message) {
//         if (message == '$$ INTRUSION $$') {
//
//             publishMqtt('LIGHTOFF', '^^ motion from PIR');
//             sensor
//                 .getService(Service.MotionSensor)
//                 .setCharacteristic(Characteristic.MotionDetected, true);
//             console.log(message.toString());
//         } else {
//             publishMqtt('LIGHTOFF', '^^no motion');
//
//         }
//     });
// });
