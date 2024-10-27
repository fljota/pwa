import '../milligram.css'
import '../style.css'
import fljotaLogo from '/fljota_offline.svg'
import fictionalCharacters from '/de_unique_fictional_characters.json';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import * as THREE from 'three';


if (!localStorage.getItem('userName')) {
  localStorage.setItem('userName', fictionalCharacters[Math.floor(Math.random() * fictionalCharacters.length)]);
  localStorage.setItem('annonym', 'true');
}

document.querySelector('#app').innerHTML = `
  <!--div>

      <img src="${fljotaLogo}" class="logo" alt="fljota.network" />

  </div-->

   <div>
       <h1>Benutzerseite</h1>
       <div id="userInfo"></div>
       <button id="loginBtn">Anmelden</button>
       <button id="logoutBtn" style="display:none;">Abmelden</button>
   </div>
<p>
<h1></h1>
<div id="details"></div>



`
if (localStorage.getItem('annonym')=='true') {
  console.info("Annonymer User");
  document.getElementById("details").innerHTML = `
  <h2>Bitte erstelle einen Account</h2>
  <h3>${localStorage.getItem('userName')}</h3>
  <div id="threejs-container" style="width: 180px; height: 180px;"></div>
  <button id="activateUser">Aktivieren</button>
  `
}
else {
  document.getElementById("details").innerHTML = `
  <h2>Demo User aktiviert</h2>
  <div id="threejs-container" style="width: 180px; height: 180px;"></div>

  `
}
// Überprüfen, ob das Element mit der ID "activateUser" existiert
const activateUserButton = document.getElementById("activateUser");
if (activateUserButton) {
  // Wenn das Element existiert, füge den Event-Listener hinzu
  activateUserButton.addEventListener('click', (event) => {
    if (localStorage.getItem('annonym')) {
      localStorage.setItem('annonym', 'false');
      document.getElementById("details").innerHTML = `
    <h2>Demo User aktiviert</h2>
    `;
    }
  });
}

// Integration von auth0 mit cursor Tutorial:

let auth0Client;

async function initAuth0() {

  const config = {
    domain: 'dev-6i5b7tgyhy0ow64j.us.auth0.com',
    clientId: 'ef0YX3Z9XfdD6yu97yHVykPXyNT1uak4',
    authorizationParams: {
      redirect_uri: window.location.origin + '/user/',
    },
    cacheLocation: 'localstorage',
  };
  console.log('Auth0 Konfiguration:', config);

  auth0Client = await createAuth0Client(config);

  // Überprüfen Sie, ob der Benutzer gerade von einer Authentifizierung zurückgekehrt ist
  if (location.search.includes('code=') && location.search.includes('state=')) {
    await auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, '/user/');
  }

  await updateUserInfo();
  updateUI();
}

async function updateUI() {
  const isAuthenticated = await auth0Client.isAuthenticated();
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userInfo = document.getElementById('userInfo');

  if (isAuthenticated) {
    const user = await auth0Client.getUser();
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    userInfo.textContent = `Willkommen, ${user.name}!`;
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    userInfo.textContent = 'Bitte melden Sie sich an.';
  }
}

async function login() {
  await auth0Client.loginWithRedirect();
}

async function logout() {
  await auth0Client.logout({
    returnTo: window.location.origin + '/user/'
  });
}

async function updateUserInfo() {
  if (await auth0Client.isAuthenticated()) {
    // Fallback-Logik für den Benutzernamen
    const user = await auth0Client.getUser();
    const userName = user?.name || user?.nickname || user?.email || 'Anonymer Benutzer';
    localStorage.setItem('userName', userName);
    localStorage.setItem('annonym', 'false');
  } else {
    // localStorage.removeItem('userName');
    localStorage.setItem('annonym', 'true');
  }
}

// Three.js Setup
function setupThreeJS() {
  const container = document.getElementById('threejs-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(180, 180);
  container.appendChild(renderer.domElement);

  // Dodecaeder erstellen
  const geometry = new THREE.DodecahedronGeometry(1);
  const material = new THREE.MeshBasicMaterial({ color: 0x3c0790, wireframe: true }); // Lila Farbe
  const dodecahedron = new THREE.Mesh(geometry, material);
  scene.add(dodecahedron);

  camera.position.z = 3;

  let useDeviceOrientation = false;
  let deviceAlpha = 0, deviceBeta = 0, deviceGamma = 0;

  // Überprüfen, ob DeviceOrientationEvent verfügbar ist
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (event) => {
      deviceAlpha = event.alpha; // Z-Achse Rotation
      deviceBeta = event.beta;   // X-Achse Rotation
      deviceGamma = event.gamma; // Y-Achse Rotation
      useDeviceOrientation = true;
    });
  }

  // Animation
  function animate() {
    requestAnimationFrame(animate);

    if (useDeviceOrientation) {
      // Umwandlung der Geräteorientierung in Radiant
      dodecahedron.rotation.x = deviceBeta * (Math.PI / 180);
      dodecahedron.rotation.y = deviceGamma * (Math.PI / 180);
      dodecahedron.rotation.z = deviceAlpha * (Math.PI / 180);
    } else {
      // Fallback zur automatischen Rotation
      dodecahedron.rotation.x += 0.01;
      dodecahedron.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
  }
  animate();
}

// Initialisieren Sie Auth0, wenn die Seite geladen ist
document.addEventListener('DOMContentLoaded', () => {

  initAuth0();
  setupThreeJS();

  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
});
