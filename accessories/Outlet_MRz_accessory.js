var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var err = null; // in case there were any problems


function publishMqtt(type, value) {
    console.log(value);
    var mqtt = require('mqtt');
    var clients = mqtt.connect('mqtt://localhost');
    clients.publish(type, value.toString());
}
// here's a fake hardware device that we'll expose to HomeKit
var MRz_OUTLET = {
    setPowerOn: function(on) {
        console.log("Turning the outlet %s!...", on ? "on" : "off");
        if (on) {
            MRz_OUTLET.powerOn = true;
            if (err) {
                return console.log(err);
            }
            publishMqtt("cmnd/sonoff/POWER", "ON");//publishing the sonoff to controll sonoff esp8266 outlet s20
            console.log("...outlet is now on.");
        } else {
            MRz_OUTLET.powerOn = false;
            if (err) {
                return console.log(err);
            }
            publishMqtt("cmnd/sonoff/POWER", "OFF");//publishing the sonoff to controll sonoff esp8266 outlet s20
            console.log("...outlet is now off.");
        }
    },
    identify: function() {
        console.log("Identify the RMR Power Outlet.");
    }
}

// Generate a consistent UUID for our outlet Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the accessory name.
var outletUUID = uuid.generate('hap-nodejs:accessories:Outlet');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var outlet = exports.accessory = new Accessory('Outlet MRz', outletUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
outlet.username = "1A:11:34:33:33:FF";
outlet.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
outlet
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, "RMR")
    .setCharacteristic(Characteristic.Model, "RMR-123")
    .setCharacteristic(Characteristic.SerialNumber, "RAHULMR123");

// listen for the "identify" event for this Accessory
outlet.on('identify', function(paired, callback) {
    MRz_OUTLET.identify();
    callback(); // success
});

// Add the actual outlet Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
outlet
    .addService(Service.Outlet, "Power Outlet") // services exposed to the user should have "names" like "Fake Light" for us
    .getCharacteristic(Characteristic.On)
    .on('set', function(value, callback) {
        MRz_OUTLET.setPowerOn(value);
        callback(); // Our fake Outlet is synchronous - this value has been successfully set
    });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
outlet
    .getService(Service.Outlet)
    .getCharacteristic(Characteristic.On)
    .on('get', function(callback) {

        // this event is emitted when you ask Siri directly whether your light is on or not. you might query
        // the light hardware itself to find this out, then call the callback. But if you take longer than a
        // few seconds to respond, Siri will give up.

        var err = null; // in case there were any problems

        if (MRz_OUTLET.powerOn) {
            console.log("Are we on? Yes.");
            callback(err, true);
        } else {
            console.log("Are we on? No.");
            callback(err, false);
        }
    });
