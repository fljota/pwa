// All about Sensors : https://developers.google.com/web/updates/2017/09/sensors-for-the-web

console.info("... STARTED SENSORS ES MODULE ...");

// TODO Integrate Permission API 

// const sensor2 = new AbsoluteOrientationSensor();
// Promise.all([navigator.permissions.query({ name: "accelerometer" }),
// navigator.permissions.query({ name: "magnetometer" }),
// navigator.permissions.query({ name: "gyroscope" })])
//   .then(results => {
//     if (results.every(result => result.state === "granted")) {
//       console.log("Permissions to use AbsoluteOrientationSensor.");
//       sensor2.start();

//     } else {
//       console.log("No permissions to use AbsoluteOrientationSensor.");
//     }
//   });

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



export {
    sensor,
    demoOutput
}
