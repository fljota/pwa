import '../milligram.css'
import '../style.css'
import fljotaLogo from '/fljota_offline.svg'
import { dbchecker } from '/dbchecker.js'
import Localbase from 'localbase'
import { generateShuffledToken } from "/modules/shuffledtoken.js"
import { sendItemToLender, websocketFeedback } from "/modules/ws_connect.js"
import { blobToJson, getCurrentDateTime } from '/modules/helper.js'

const UMGEBUNG = 'dev';

const urlToAPI = UMGEBUNG === 'dev' ? 'localhost:8080' : 'handshake.fljota.network';
const websocketURL = UMGEBUNG === 'dev' ? 'ws://' : 'wss://';
// WSS Support on Plesk only with deactivated Proxy Mode:
// https://www.plesk.com/kb/support/does-node-js-on-plesk-support-websockets-socket-io/

const lengthOfToken = 4;

let urlParams = new URLSearchParams(window.location.search);
let itemId = urlParams.get('id');
let saveId = urlParams.get('saveID');
let returnId = urlParams.get('returnId');

if (saveId) {
    localStorage.setItem('tempSaveId', saveId);
    console.info("Vorhandene saveId im Localsotrage entdeckt");
}


if (itemId || returnId) {

    document.querySelector('#app').innerHTML = `<a href="index.html"><img src="/fljota_offline.svg" style="width:64px; height:64px;" alt="fljota.network"></a>
<div id="itemDetails">
    <!-- Hier werden die Details des Elements angezeigt -->
</div>

<div id="step1">
 <h1>Item verleihen</h1>
 <p>
 Du möchtest den oben genannten Item ausleihen? Kein Problem. Sende im ersten Schritt deinen Namen an der Eigentümer, damit der den Verleihvorgang bestätigen kann.
 </p>
    <button id="sendMessage">1. Nachricht an Eigentümer senden</button>
</div>
<div id="step2">
    

    <button id="okMesssage" disabled="true">2. Item OK</button><br />
<p id="receivedMessage">Warten auf Nachricht...</p>
    <pre id="messages"></pre>
    <div id="item"></div>

</div>
<div id="returnstep1">
<h1>Item zurückgeben</h1>
<p>Hier kannst du das Item zurückgeben.</p>
<button id="return1">Item zurückgeben</button>
</div>

<dialog>
<p>Für den Verleih vorbereiten</p>
Vorname <input></input>
Nachname <input></input>
<label for="sharing">Sharing:</label>
<select id="sharing" name="sharing">
  <option value="fa">nur Ausleihen</option>
  <option value="fb">eingeschränkt Weiterleihen</option>
  <option value="fc">uneingeschränkt Weiterleihen</option>
</select> 
<button id="close">Aufgehts</button>
</dialog>

<div id="qrcode-container"></div>
<br>
<div id="timer">00:10</div>
<button id="jetztteilenButton" class="button button-outline">Jetzt Sharen</button>
<div id="item"></div>

<br><br><br><br><br><br>`;
}
else if (saveId) {
    document.querySelector('#app').innerHTML = `<a href="index.html"><img src="/fljota_offline.svg" style="width:64px; height:64px;" alt="fljota.network"></a>
    
    <h1>Item auf deinem Gerät speichern</h1>
    <h2>fljotaID:<strong>${saveId}</strong></h2>
    <p>${localStorage.getItem('userName')}</p>
    <p>Du brauchst zunächst einen Demo Benutzer, um das Item zu speichern <a href="/user/"><button>User aktivieren</button></a></p>
        <p>Du erhälst das Item ausgeliehen und darfst es uneingeschränkt nutzen. Das ist das Tolle am <stong>fljota.network</stong>, kontrolliert ausleihen, nutzen und wieder zurückgeben.</p>

<input type="checkbox" id="agree" /> OK, finde ich gut

<h2>Nutzung deines Browserspeichers</h2>
<p>Alles, was hier verliehen wird, bleibt in Deinem Browser. Dafür wird der Browserspeicher indexeddb genutzt. Falls Du den Browser wechselst oder den Speicher leerst, wird dein Inventar auch geleert. Wähle deinen Browser bewusst aus.</p>

<input type="checkbox" id="data" /> OK, damit bin ich einverstanden.

    </div>
    <button id="userfeedback">Deinen Benutzernamen übertragen</button>
    <button id="fetchAndSave" disabled="true">Item jetzt abrufen</button>
    <div id="item"></div>
    <button id="tokenize" disabled="true">Item speichern und Tokenisieren</button>

    <div id="jsonOutput"></div>

    <dialog>
    <p>
    Die ID ist nicht mehr gültig.
    </p>
    <button id="close">Schließen</button>
    </dialog>
    
    <br><br><br><br><br><br>`;

}
else {
    document.querySelector('#app').innerHTML = `<h2>ID missing</h2>
<p>Bitte ID eingeben, oder den QR Code abscannen.</p>
<input id="storeid"></input>
<button id="saveid">Floating ID eingeben</button>
    `;
}

let db = new Localbase('itemDatabase');

document.addEventListener('DOMContentLoaded', function () {
    db.collection('items').get().then(items => {
        if (items.length > 0) {
            let filteredData = items.filter(item => item.id === Number(itemId));
            document.getElementById('itemDetails').innerHTML = filteredData[0].owner;
            document.getElementById('itemDetails').innerHTML += '<img src="' + filteredData[0].image + '" />';
        }
        else {
            document.getElementById('itemDetails').innerHTML = "ID nicht in deiner Datenbank";
        }
    })
});

// WebSocket-Verbindung zu Server herstellen
const socket = new WebSocket(websocketURL +urlToAPI+'?saveID=' + saveId + 'lender');

// Verbindung erfolgreich hergestellt
socket.onopen = function () {
    console.log('Verbindung zu WebSocket-Server hergestellt.');
};

let tempitemtosave = [];

if (returnId) {
    document.getElementById('returnstep1').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('return1').addEventListener('click', () => {
        db.collection('items').get().then(items => {
            let itemWithContract = items.find(item => item.contract === returnId);
            console.log('Gefundenes Item mit Contract:', itemWithContract);
            
            // Korrigierte Version: Verwende itemWithContract statt undefiniertes 'item'
            const socketreturn = new WebSocket(websocketURL + urlToAPI + '?saveID=' + itemWithContract.contract + 'lender');

            socketreturn.onopen = function () {
                console.log('Verbindung zu WebSocket-Server hergestellt.');
                // Sende die Nachricht erst, wenn die Verbindung hergestellt ist
                socketreturn.send(JSON.stringify({
                    targetId: itemWithContract.contract,
                    type: 'return',
                    msg: itemWithContract.contract
                }));
            };
        });
    });
}
//    Lender
// Nachricht empfangen (von Client A)
socket.onmessage = function (event) {
    let msgfromowner = JSON.parse(event.data);
    
    if (msgfromowner.type === "details") {
        document.getElementById("step2").scrollIntoView({ behavior: 'smooth' });
    }

    if (msgfromowner.type = "details") {
        tempitemtosave = msgfromowner.msg[0];
        document.getElementById('okMesssage').disabled = false;

    }

    document.getElementById('receivedMessage').innerText += msgfromowner;
};

document.getElementById('sendMessage').addEventListener('click', () => {
    // Antwort an Owner senden
    const responseMessage = {
        targetId: saveId,
        type: 'lender',
        msg: localStorage.getItem('userName')
    };
    socket.send(JSON.stringify(responseMessage));
});

document.getElementById('okMesssage').addEventListener('click', () => {
    // Antwort an Owner senden
    // Hier wird eine Antwort an den Besitzer des Gegenstands vorbereitet.
    // Es wird ein Objekt erstellt, das die Zustimmung des Ausleihers enthält.
    // Diese Nachricht wird dann über den WebSocket an den Besitzer gesendet.
    // Dies ist ein wichtiger Schritt im Ausleihprozess, da es die Zustimmung des Ausleihers bestätigt.

    let datum = getCurrentDateTime();

    const responseMessage = {
        targetId: saveId,
        type: 'lok',
        // msg: datum,
        msg: localStorage.getItem('userId'),
    };
    socket.send(JSON.stringify(responseMessage));
    console.log('Antwort an Client A gesendet:', responseMessage);

    // Überprüft, ob das Item bereits in der Datenbank existiert
    // Falls ja, wird die bestehende ID verwendet
    // Falls nein, wird eine neue ID generiert, die größer ist als alle vorhandenen IDs
    // Dies stellt sicher, dass jedes Item eine eindeutige ID hat, auch wenn es von einem anderen Benutzer geteilt wurde

    db.collection('items').get().then(items => {
        let maxId = Math.max(...items.map(item => item.id), 0);
        let newId = Math.max(tempitemtosave.id, maxId + 1);
        tempitemtosave.id = newId;
        return db.collection('items').add(tempitemtosave);
    }).then(() => {

        db.collection('items').doc({ id: tempitemtosave.id }).update({
            contract: saveId
        });
    });

    db.collection('contracts').add({
        owner: tempitemtosave.owner,
        lender: localStorage.getItem('userName'),
        datum: datum,
        contractid: saveId
    });

    window.location.href = "/items/";

});
