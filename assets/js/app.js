// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all ES modules in the entry points. 
// Those entry points can be configured in "webpack.config.js".
// You don't need to insert the .js ending.

import 'phoenix_html';
import { gsap } from 'gsap';
import Localbase from 'localbase';
import { addItem, deleteAll, cleanUpdate } from './itemsprototype';
import { animate } from './dodecahedron';
import socket from './socket';
// import Item from './itemchannel';
import { sensor } from './sensors';

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

// Starts smartphone Sensors and handles Errors
// TODO refactor permission from ES Module to app.js &
// map live sensordata to dodecahedron


// Load Dummy Sensor Data in localstorage
if (!localStorage.getItem("sensorQuaternion")) {
  localStorage.clear();
  localStorage.setItem("sensorX", Math.random());
  localStorage.setItem("sensorY", Math.random());
  localStorage.setItem("sensorZ", Math.random());
}

let tl = gsap.timeline({defaults: {ease: "power2.inOut"}})

let toggle = false;

tl.to('.activator', {
    background: '#805ad5',
    'borderRadius': '5em 0 0 5em'
});
tl.to('nav', {
    'clipPath': 'ellipse(100% 100% at 50% 50%)'
}, "-=.5")
tl.to('nav img', {
    opacity: 1,
    transform: 'translateX(0)',
    stagger: .05
}, "-=.5")
tl.pause();

document.getElementById("activator").addEventListener('click', () => {
    toggle = !toggle;
    if (toggle ? tl.play() : tl.reverse());
})
