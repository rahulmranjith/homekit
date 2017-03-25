var storage = require('node-persist');
var uuid = require('./').uuid;
var Accessory = require('./').Accessory;
var Camera = require('./').Camera;

var path = require('path');

var accessoryLoader = require('./lib/AccessoryLoader');

console.log("HAP-NodeJS starting...Original!!!!!");

// Initialize our storage system
storage.initSync();

// Start by creating our Bridge which will host all loaded Accessories
var cameraAccessory = new Accessory('Living Camera', uuid.generate("LivingCamera"));

var cameraSource = new Camera();

cameraAccessory.configureCameraSource(cameraSource);

cameraAccessory.on('identify', function(paired, callback) {
    console.log("Node Camera identify");
    callback(); // success
});

// Publish the camera on the local network.
cameraAccessory.publish({
    username: "A3:31:33:12:33:11",
    port: 51062,
    pincode: "031-45-154",
    category: Accessory.Categories.CAMERA
}, true);




// Our Accessories will each have their own HAP server; we will assign ports sequentially
var targetPort = 51826;

// Load up all accessories in the /accessories folder
var dir = path.join(__dirname, "accessories");
var accessories = accessoryLoader.loadDirectory(dir);

// Publish them all separately (as opposed to BridgedCore which publishes them behind a single Bridge accessory)
accessories.forEach(function(accessory) {

    // To push Accessories separately, we'll need a few extra properties
    if (!accessory.username)
        throw new Error("Username not found on accessory '" + accessory.displayName +
            "'. Core.js requires all accessories to define a unique 'username' property.");

    if (!accessory.pincode)
        throw new Error("Pincode not found on accessory '" + accessory.displayName +
            "'. Core.js requires all accessories to define a 'pincode' property.");

    // publish this Accessory on the local network
    accessory.publish({
        port: targetPort++,
        username: accessory.username,
        pincode: accessory.pincode
    });
});
