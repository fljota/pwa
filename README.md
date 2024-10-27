# fljota.network PWA  _phase 3_ 

The core of fljota.network is providing access to your personal item inventory and enabling you to share items with others in a secure, trackable way. This Progressive Web App (PWA) stores all your data locally on your smartphone or desktop browser. Items are saved in the IndexedDB browser database, accessible only on the specific device in use. The PWA can be installed in the browser of your choice. A push notification service informs the lender of the item's status. The web app doesn't require any server-side data storage.

The sharing and lending process is managed through a secure WebSocket connection, which facilitates messages between the owner and the lender. Each sharing contract is stored on the devices of the involved participants.

The PWA is accessible at https://fljota.network and uses the endpoints handshake.fljota.network and app.fljota.network to manage its processes.

_phase 3_ Version 0.3 (2024)
Techstack Frontend: JavasScript Vite, milligram, localbase, three, auth0 / Backend: node.js, cors, express, web-push, ws, dotenv

_phase 2_ Version 0.2 (2022/2023)
Techstack JavaScript with Vite, milligram and node.js

_phase 1_ Verion 0.1 (2021)
Techstack Elixir, Pheonix & Webpack

_phase 0_ (2020)
## Prototyping Release Notes

0.1.15
- added gsap module
- dummy sticky footer navigation with toggle menu
- colored demo items in item inventory

0.1.14
- activated socket publishing for icons
- cleaned up cod in socket ES Mosul

0.1.13
- Permission API added to sensor reading
- returns sensor and demoData null if sensor nA
- cleaned up code in sensro ES Modul

0.1.12
- refactored sensors ES Module and sensor init
- sensor data to 100 datapoint array
- live sensor quaternion in localstorage
- TODO: Permission API for Desktop Uncaught ReferenceError: AbsoluteOrientationSensor is not defined 

0.1.11
- refactored dodecahedron ES Module and rendering in DOM
- deleted unneeded code
- restructured imports

0.1.10
- refactored arrow functions in app and itemsprototype
- deleted plotly demo code because it's not needed any more
- edited Tutorial infos
- verbose logging in items

0.1.9
- added dodecahedron ES Module for Rendering 3D model in frontend
- TODOs for code refactoring in ES Modules

0.1.8
- Solved SSL issues on nightly.fljota.network
- Edited 10Hz Sensor Quaternation sensorX, sensorY, sensorZ & sensorW
- collecting 100 Sensor Datapoints in demoArray
- activates 'Shout Sensor' Button if demoArray filled and restarts capturing

0.1.7
- quick fix service-worker Promise Error with GenerateSW
- Todo: index caching for offline usage

0.1.6
- Counting all Items from local item inventory and publish total amount in the network
- Dummy channel.push and channel.on events
- fake counting without substraction
- Bug: Channel addition in Frontend

0.1.5
- Fixed URLs for Demo System
- Experimental Google Cloud micro VM Deploy Tutorial
- Dummy Sensor Data in localstorage

0.1.4
- Latest MIX Dependencies in mix.exs file
- Fixed Troubleshooting for rpi4 Install
- Project Intro and a first how-it-works picture

The second 0.1.3 contains:

- RPi4 install instruction
- Updated webpack-pwa-manifest 4.3.0
- Fixed jpeg-js 0.4.2 for security reasons

The very first 0.1.2 contains:

- prototyped item inventory based on localbase / indexedDB
- PWA manifest with service-worker
- Phoenix Channel for item counting
- Sensor API Dummy



