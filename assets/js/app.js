// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all ES modules in the entry points. 
// Those entry points can be configured in "webpack.config.js".
// You don't need to insert the .js ending.

import 'phoenix_html';
import Localbase from 'localbase';
import { addItem, deleteAll, cleanUpdate } from './itemsprototype';
import { animate } from './dodecahedron';
// import socket from './socket';
// import Item from './itemchannel';
// import { sensor } from './sensors.js';

const debugvar = true;

var localitems = new Localbase('iteminventory')

// Renders Dodecahedron Animation
// TODO generate fallbacks with animation true/false and sensormapping
animate();

// Debugung indexedDB Console Logs
if (debugvar) {
  localitems.config.debug = false
}

// TODO Check Routes and filter js actions.

// Adds one random floating item to localitem indexedDB on Button Click
document.getElementById("addrandombutton").addEventListener("click", () => {
  addItem(localitems, 999);
});

// Adds delete Button for cleaning all indexedDB items with one Click
document.getElementById("deleteallbutton").addEventListener("click", () => {
  deleteAll(localitems);
});

// render all existing items from indexedDB on Startup
cleanUpdate(localitems);

// TODO Separate SensorQuaternion from here in separate js file 

// All about Sensors : https://developers.google.com/web/updates/2017/09/sensors-for-the-web

const sensor2 = new AbsoluteOrientationSensor();
Promise.all([navigator.permissions.query({ name: "accelerometer" }),
navigator.permissions.query({ name: "magnetometer" }),
navigator.permissions.query({ name: "gyroscope" })])
  .then(results => {
    if (results.every(result => result.state === "granted")) {
      console.log("Permissions to use AbsoluteOrientationSensor.");
      sensor2.start();

    } else {
      console.log("No permissions to use AbsoluteOrientationSensor.");
    }
  });

const options = { frequency: 10, referenceFrame: 'device' };
const sensor = new AbsoluteOrientationSensor(options);

let demoOutput = [];

sensor.addEventListener('reading', () => {
  let sensordatatemp = sensor.quaternion;
  localStorage.setItem("sensorX", sensordatatemp[0]);
  localStorage.setItem("sensorY", sensordatatemp[1]);
  localStorage.setItem("sensorZ", sensordatatemp[2]);
  localStorage.setItem("sensorW", sensordatatemp[3]);

  let tempOutput = [sensordatatemp[0], sensordatatemp[1], sensordatatemp[2], sensordatatemp[3]];


  if (demoOutput.length < 100) {
    // Pushes 100 Array Quaternions to demoOutput
    demoOutput.push(tempOutput);
  }
  else if (demoOutput.length == 100) {
    document.getElementById("sensorpush").classList.remove("button-clear")
    document.getElementById("sensorpush").classList.add("button-outline")
  }
});

// Adds Sensor Broadcast Button for 100 Quaternions
document.getElementById("sensorpush").addEventListener("click", () => {
  if (demoOutput.length == 100) {
    console.info(demoOutput);
  }

// TODO: Nice Toggle for Sensordate and Button Inactivation
  demoOutput = []
  document.getElementById("sensorpush").classList.remove("button-outline")
  document.getElementById("sensorpush").classList.add("button-clear")
});

sensor.start();
sensor.onerror = event => console.log(event.error.name, event.error.message);

// Load Dummy Sensor Data in localstorage
if (!localStorage.getItem("sensorQuaternion")) {
  localStorage.clear();
  localStorage.setItem("sensorX", Math.random());
  localStorage.setItem("sensorY", Math.random());
  localStorage.setItem("sensorZ", Math.random());
}
