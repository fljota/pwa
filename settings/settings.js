import '../milligram.css'
import '../style.css'
import fljotaLogo from '/fljota_offline.svg'



document.querySelector('#app').innerHTML = `
  <div>
      <img src="${fljotaLogo}" class="logo" alt="fljota.network" />
  </div>
  <p>
   <div class="toast-container" id="toastContainer"></div>
    <h1>Settings</h1>
    <div>
      <h1>PWA Einstellungen</h1>
      <button id="subscribe">Subscribe to Push Notifications</button>
      <button id="installPWA" style="display: none;">App installieren</button>
      <div>
        <label for="userId">Benutzer-ID:</label>
        <input type="text" id="userId" name="userId" readonly>
      </div>
    </div>
    <div>
      <h2>Datenhaltung</h2>
      <fieldset>
        <legend>Wo werden deine Daten gespeichert?</legend>
        <input type="radio" name="datahandling" value="indexedDB" checked> Browserspeicher indexedDB<br>
        <p>Deine Daten werden bei dir lokal im Browser gespeichert. Bei der Technologie handelt es sich um die sogenannte
          indexedDB.</p>
        <input type="radio" name="datahandling" value="server" disabled> EU Server<br>
        <input type="radio" name="datahandling" value="hedera" disabled> Hedera Token Service 2.0 Smart Contract<br>
        <input type="radio" name="datahandling" value="iota" disabled> IOTA 2.0 Smart Contract<br>
        <button>Speicherort neu konfigurieren und speichern</button>
      </fieldset>
      <h2>Browserspeicher</h2>
      <p>Es werden <i id="storage">0.0</i> deines Browserspeichers indexedDB genutzt <br />
        <button id="dumpDB">Datenbank unwiderruflich leeren<br />und App zurücksetzten</button>
      </p>
    </div>
  </p>
`

if ('storage' in navigator && 'estimate' in navigator.storage) {
  navigator.storage.estimate().then(({ usage, quota }) => {
    
    let byte = usage / 1024 / 1024;

    document.getElementById('storage').innerHTML = `${byte.toFixed(2)}MB von ${(quota) / 1024 / 1024} MB.`
  });
}

function deleteItemsTable() {
  const DBDeleteRequest = window.indexedDB.deleteDatabase("itemDatabase");

  DBDeleteRequest.onerror = (event) => {
    console.error("Error deleting database.");
  };

  DBDeleteRequest.onsuccess = (event) => {
    console.log("Database deleted successfully");
  };

};

document.getElementById("dumpDB").addEventListener("click", () => {
  deleteItemsTable();
  // Alle Elemente aus dem localStorage löschen
  localStorage.clear();
  console.log('Alle Daten im localStorage wurden gelöscht');
  alert('Alle lokalen Daten wurden gelöscht. Die App wird nun zurückgesetzt.');
  
  // Optional: Seite neu laden, um die Änderungen zu reflektieren
  location.reload();
});

// Überprüfen, ob eine Push-Subscription im localStorage existiert
const existingSubscription = localStorage.getItem('pushSubscription');
// Überprüfen, ob eine Benutzer-ID im localStorage existiert
const existingUserId = localStorage.getItem('userId');
if (existingUserId) {
  // Wenn eine Benutzer-ID existiert, füge sie in das Eingabefeld ein
  const userIdInput = document.getElementById('userId');
  if (userIdInput) {
    userIdInput.value = existingUserId;
    showToast(`Benutzer-ID: ${existingUserId}`);
  } else {
    console.warn('Element mit ID "userId" wurde nicht gefunden.');
  }
}


if (!existingSubscription) {
  // Überprüfen, ob der Service Worker unterstützt wird
  //dev-sw.js?dev-sw' für DEV
  // sw.js für PROD
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js')
      .then(function (swReg) {
        console.log('Service Worker registriert', swReg);

        document.getElementById('subscribe').addEventListener('click', function () {
          // Push-Benachrichtigungen abonnieren
          swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BLZXpr7yo70EfRDiq5ggfELKSMCuSWN5dAPCs2nrPz3HJghPpU9iqIY4QFH5z-phLMK8lLNdQUm5Gbarqm4Rkg0'
          })
            .then(function (subscription) {
              console.log('Push abonniert:', subscription);
              // Speichern der Subscription im localStorage
              localStorage.setItem('pushSubscription', JSON.stringify(subscription));
              // Generiere eine zufällige 6-stellige Benutzer-ID
              const userId = Math.floor(100000 + Math.random() * 900000).toString();
              // Speichere die Benutzer-ID im localStorage
              localStorage.setItem('userId', userId);
              console.log('Benutzer-ID im localStorage gespeichert:', userId);
              // Füge den Wert der userId zum Element mit der ID 'userId' hinzu
              document.getElementById('userId').textContent = userId;
              console.log('Subscription im localStorage gespeichert');
              // Subscription an den Server senden
              fetch('https://app.fljota.network/subscribe', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  subscription: subscription, // Die Subscription-Informationen
                  userId: userId // Zufällige sechsstellige Benutzer-ID
                })
              });
            })
            .catch(function (error) {
              console.error('Fehler beim Abonnieren:', error);
            });
        });
      })
      .catch(function (error) {
        console.error('Service Worker Registrierung fehlgeschlagen:', error);
      });
  } else {
    console.warn('Push-Benachrichtigungen werden nicht unterstützt');
  }
}
else {
  document.getElementById('subscribe').disabled = true;
}

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installButton = document.getElementById('installPWA');
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Benutzer hat die App-Installation akzeptiert');
      } else {
        console.log('Benutzer hat die App-Installation abgelehnt');
      }
      deferredPrompt = null;
    });
  });
});

window.addEventListener('appinstalled', (evt) => {
  console.log('App wurde installiert');
});

function showToast(message) {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Trigger reflow to ensure the initial state is applied
  toast.offsetHeight;

  // Show the toast
  setTimeout(() => {
      toast.classList.add('show');
  }, 10);

  // Hide and remove the toast after 3 seconds
  setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
          toastContainer.removeChild(toast);
      }, 300); // Wait for the transition to complete before removing
  }, 5000);
}


