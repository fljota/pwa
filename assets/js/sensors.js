// All about Sensors : https://developers.google.com/web/updates/2017/09/sensors-for-the-web

console.info("... STARTED SENSORS ES MODULE ...");

const sensor = null;
const demoOutput = null;

if (navigator.permissions) {
    // https://w3c.github.io/orientation-sensor/#model
    Promise.all([navigator.permissions.query({ name: "accelerometer" }),
    navigator.permissions.query({ name: "magnetometer" }),
    navigator.permissions.query({ name: "gyroscope" })])
        .then(results => {
            if (results.every(result => result.state === "granted")) {
                console.info("Sensor granted");

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

                // initSensor();
            } else {
                console.info("Permission to use sensor was denied.");
            }
        }).catch(err => {
            console.info("Integration with Permissions API is not enabled, still try to start app.");
            // animate();
        });
} else {
    console.log("No Permissions API, still try to start app.");
    // animate();       
}

export {
    sensor,
    demoOutput
}
