// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html";
import Localbase from 'localbase';
import { addItem, deleteAll, cleanUpdate } from './itemsprototype';
import socket from "./socket";
// import Item from './itemchannel';

const debugvar = true;

var localitems = new Localbase('iteminventory')

// Debugung indexedDB Console Logs
if (debugvar) {
  localitems.config.debug = false
}

// TODO Check Routes and filter js actions.

// Adds one random floating item to localitem indexedDB on Button Click
document.getElementById("addrandombutton").addEventListener("click", function () {
  addItem(localitems, 999);
});

// Adds delete Button for cleaning all indexedDB items with one Click
document.getElementById("deleteallbutton").addEventListener("click", function () {
  deleteAll(localitems);
});

// render all existing items from indexedDB on Startup
cleanUpdate(localitems);

// let item = document.getElementById("item").getAttribute("item-count")

// Item.init(socket, item);

// console.info(item)




// TODO ------> Separate from here 

// All about Sensors : https://developers.google.com/web/updates/2017/09/sensors-for-the-web

// import deviceMarker from "./plotly"
// import { deviceMarker, reactChart } from './plotly';

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

  //  deviceMarker();
    
    const options = { frequency: 50, referenceFrame: 'device' };
    const sensor = new AbsoluteOrientationSensor(options);

    let demoOutput = [];

    sensor.addEventListener('reading', () => {
        let sensordatatemp = sensor.quaternion;
        localStorage.setItem("sensorX", sensordatatemp[0]);
        localStorage.setItem("sensorY", sensordatatemp[1]);
        localStorage.setItem("sensorZ", sensordatatemp[2]);
        localStorage.setItem("sensorW", sensordatatemp[3]);

        let tempOutput = [sensordatatemp[0], sensordatatemp[1], sensordatatemp[2], sensordatatemp[3]];
        

        if(demoOutput.length<500) {
          demoOutput.push(tempOutput);
          console.log(demoOutput);
        }
        // localStorage.setItem("sensorQuaternion", sensordatatemp);

        // deviceMarker();
        // reactChart();
        // Plotly.newPlot('demoline', trace2);
        // if(i>0) {
        // Plotly.react('demoline', [{
        //     type: 'scatter3d',
        //     mode: 'markers',
        //     x: sensordatatemp[0],
        //     y: sensordatatemp[1],
        //     z: sensordatatemp[2],
        //     line: {
        //       width: 3,
        //       colorscale: "Viridis"}
        //    },                  
        //   ],[{
        //       showlegend: false
        //   }],[{
        //       displayModeBar: false
        //   }]);
        // }
    });

    sensor.start();
    sensor.onerror = event => console.log(event.error.name, event.error.message);

if(!localStorage.getItem("sensorQuaternion")) {
    localStorage.clear();
    localStorage.setItem("sensorX", Math.random());
    localStorage.setItem("sensorY", Math.random());
    localStorage.setItem("sensorZ", Math.random());
}