import '../milligram.css'
import '../style.css'
import fljotaLogo from '/fljota_offline.svg'
import { dbchecker } from '/dbchecker.js'
import Localbase from 'localbase'
import { generateShuffledToken } from "/modules/shuffledtoken.js"
import { sendItemToLender, websocketFeedback } from "/modules/ws_connect.js"
import { blobToJson, getCurrentDateTime } from '/modules/helper.js'
import fn_loader from '/assets/fn_loader.svg'
import undraw_shared_goals from '/assets/undraw_shared_goals.svg'


const UMGEBUNG = 'dev';

const urlToAPI = UMGEBUNG === 'dev' ? 'localhost:8080' : 'handshake.fljota.network';
const websocketURL = UMGEBUNG === 'dev' ? 'ws://' : 'wss://';
// WSS Support on Plesk only with deactivated Proxy Mode:
// https://www.plesk.com/kb/support/does-node-js-on-plesk-support-websockets-socket-io/

const lengthOfToken = 4;

let urlParams = new URLSearchParams(window.location.search);
let itemId = urlParams.get('id');
let saveId = urlParams.get('saveID');

// if (saveId) {
//     localStorage.setItem('tempSaveId', saveId);
//     console.info("Vorhandene saveId im Localsotrage entdeckt");
// }


if (itemId) {

    document.querySelector('#app').innerHTML = `

<div id="itemDetails">
    <!-- Hier werden die Details des Elements angezeigt -->
</div>

<div id="step1">

<img src="${undraw_shared_goals}" alt="Verleihvorgang" width="280" />
<p>
Mit nur 3 einfachen Schritten kannst du dein Item sicher verleihen und den gesamten Vorgang digitalisieren. Klicke einfach auf 'Starten', damit dein Sharing-Partner den QR-Code scannen und das Item übernehmen kann. So wird das Verleihen kinderleicht!
</p>
<button id="push">1. Verleihvorgang Starten</button><br />

<div id="item"></div>

<div id="qrcode-container"></div>
<br>
</div>


<div id="step2">
<p>Überprüfen den Namen deines Sharing Partners:
<br />
<strong id="lendername"><img src="${fn_loader}" style="width:128px;"/></strong><br />
Im zweiten Schritt überträgst du das Item an deinen Sharing-Partner. Er muss es annehmen und bestätigen, dass er dem Verleihvorgang zustimmt.
</p>
<button id="prepareSharing" disabled="true">2. Sharing vorbereiten</button><br />

</div>

<div id="step3">
<p>Dein Sharing Partner hat dem Contract zugestimmt und das Item in sein Inventar überführt. Prüfe, ob alles OK ist und stimme abschließend dem Verleih zu.
Anschließend kannst du den Contract in deiner Liste einsehen.</p>
<button id="sharingButton" disabled>3. Item verleihen</button><br />

</div>

<div id="return">
Dein Item ist bereits entliehen? Fordere es jetzt wieder ein.
<button id="returnButton">Item zurückfordern</button>
</div>

<div id="returnstep2">

<p id="receivedMessage">Warten auf Nachricht...</p>
    <pre id="messages"></pre>

    <button id="returnagree">Rückgabe bestätigen</button>

</div>
<br />
<button id="deleteButton" class="button button-outline">Unwiderruflich löschen</button>


    

    



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

let itemtotransfer = [];

document.addEventListener('DOMContentLoaded', function () {
    db.collection('items').get().then(items => {
        if (items.length > 0) {
            let filteredData = items.filter(item => item.id === Number(itemId));
            let contractData = (filteredData[0].contract) ? 'Vorhandener Contract: <strong>' + filteredData[0].contract + '</strong>' : 'Jetzt Verleihbar.';


            db.collection('contracts').doc({ contractid: filteredData[0].contract }).get().then(contract => {
                document.getElementById('lenderData').innerHTML = contract.lender;
                document.getElementById('contractDate').innerHTML = contract.datum;
                document.getElementById('startsharing').disabled = true;

                // Neue Prüfung hinzufügen: Deaktivieren des Einfordern-Buttons, wenn der Lender der aktuelle Benutzer ist
                const currentUser = localStorage.getItem('userName');
                console.log('Current User:', currentUser); // Debugging
                console.log('Contract Lender:', contract.lender); // Debugging
                if (contract.lender === currentUser) {
                    document.getElementById('returnsharing').disabled = true; // Button inaktiv schalten
                }
            }).catch(err => { console.log("No Contract found."); });

            document.getElementById('itemDetails').innerHTML = `<div id="details"><p>Eigentümer: ${filteredData[0].owner}</p>
             <img src="${filteredData[0].image}" />
             <p>${filteredData[0].name}</p>
             <p>${contractData}</p>
             <p id="lenderData"><img src="${fn_loader}" style="width:128px;"/></p>   
             <p id="contractDate"></p>
            
             <div id="stepper">
             <button id="returnsharing" onClick="document.getElementById('return').scrollIntoView()">Einfordern</button> 
             <button id="startsharing" onClick="document.getElementById('step1').scrollIntoView()">Verleihen</button> 
             <button id="returnButton"  onClick="window.location.href='/lending/?returnId=${filteredData[0].contract}'">Zurückgeben</button>
             </div>
             </div>`;

            // Prüfung des Eigentümers
            const currentUser = localStorage.getItem('userName');
            console.log('Current User:', currentUser); // Debugging
            console.log('Item Owner:', filteredData[0].owner); // Debugging
            if (filteredData[0].owner === currentUser) {
                document.getElementById('returnButton').disabled = true; // Button inaktiv schalten
            }

            if (filteredData[0].contract === undefined) {
                document.getElementById('returnsharing').disabled = true;
            }
            itemtotransfer = filteredData;
        }
        else {
            document.getElementById('itemDetails').innerHTML = "ID nicht in deiner Datenbank";
        }
    })
});

document.getElementById('deleteButton').addEventListener('click', () => {
    db.collection('items').doc({ id: Number(itemId) }).delete()
    window.location.href = "/"
});




let templenderuser;
let tempcontractid;
let templenderId;


// PUSH Events zur Websocket Verbindung und Socket Rückmeldung
document.getElementById('push').addEventListener('click', (event) => {

    // Generate a shuffled token with a specific length (e.g., 16 characters)
    // die Persolalisierung des Tokens sollte bei 16 ausreichend sein
    const lengthOfToken = 8;
    const shuffledToken = generateShuffledToken(lengthOfToken);

    generateQRCode(shuffledToken);

    tempcontractid = shuffledToken;

    // WebSocket-Verbindung zu Server herstellen mit temporärer eindeutiger saveID
    const socket = new WebSocket(websocketURL + urlToAPI + '/?saveID=' + shuffledToken);

    socket.onerror = function (error) {
        console.error('WebSocket Fehler:', error);
        alert('Verbindungsfehler aufgetreten. Bitte versuchen Sie es später erneut.');
    };

    socket.onclose = function (event) {
        console.log('WebSocket-Verbindung geschlossen:', event.code, event.reason);
        document.getElementById('receivedMessage').innerHTML = 'Verbindung unterbrochen. Bitte Seite neu laden.';
    };

    // Verbindung erfolgreich hergestellt
    socket.onopen = function () {
        console.log('Verbindung zu WebSocket-Server hergestellt.');
    };

    // Nachricht empfangen (von Client B)
    socket.onmessage = function (event) {
        try {
            let jsonObject = JSON.parse(event.data);

            if (!jsonObject || !jsonObject.type) {
                throw new Error('Ungültiges Nachrichtenformat');
            }

            const receivedMessageElement = document.getElementById('receivedMessage');
            
            switch (jsonObject.type) {
                case "lender":
                    if (!jsonObject.msg) {
                        throw new Error('Fehlende Lender-Informationen');
                    }
                    templenderuser = jsonObject.msg;
                    document.getElementById('lendername').innerHTML = escapeHtml(jsonObject.msg);
                    document.getElementById('prepareSharing').disabled = false;
                    document.getElementById("step2").scrollIntoView({ behavior: 'smooth' });
                    break;

                case "lok":
                    if (!jsonObject.msg) {
                        throw new Error('Fehlende LOK-Informationen');
                    }
                    templenderId = jsonObject.msg;
                    document.getElementById('sharingButton').disabled = false;
                    document.getElementById("step3").scrollIntoView({ behavior: 'smooth' });
                    break;

                case "return":
                    console.log('Rückgabeanforderung erhalten:', jsonObject.msg);
                    receivedMessageElement.innerHTML = `
                        <div class="message-box">
                            <h3>🔄 Rückgabeanforderung eingegangen</h3>
                            <p>Contract ID: <strong>${escapeHtml(jsonObject.msg)}</strong></p>
                            <p>Zeitpunkt: ${new Date().toLocaleString()}</p>
                        </div>
                    `;
                    receivedMessageElement.classList.add('active');
                    receivedMessageElement.scrollIntoView({ behavior: 'smooth' });
                    break;

                default:
                    console.warn('Unbekannter Nachrichtentyp:', jsonObject.type);
            }
        } catch (error) {
            console.error('Fehler beim Verarbeiten der Nachricht:', error);
            document.getElementById('receivedMessage').innerHTML = 'Fehler beim Verarbeiten der Daten';
        }
    };

    document.getElementById('prepareSharing').addEventListener('click', (event) => {


        let message = {
            targetId: shuffledToken + 'lender',
            type: 'details',
            msg: itemtotransfer
        };
        socket.send(JSON.stringify(message));

    });

    document.getElementById('sharingButton').addEventListener('click', () => {
        console.log('Lender ID:', templenderId);

        if (!templenderId) {
            console.error('Lender ID ist nicht definiert');
            alert('Es gab ein Problem beim Speichern des Vertrags. Bitte versuchen Sie es erneut.');
            return;
        }

        db.collection('contracts').add({
            owner: localStorage.getItem('userName'),
            lender: templenderuser,
            datum: getCurrentDateTime(),
            contractid: tempcontractid,
            lenderId: templenderId,  // Hier fügen wir die lenderId hinzu
        }).then(() => {
            console.log('Contract erfolgreich gespeichert');
            return db.collection('items').doc({ id: Number(itemId) }).update({
                contract: tempcontractid
            });
        }).then(() => {
            console.log('Item erfolgreich aktualisiert');
            window.location.href = "/items/";
        }).catch(error => {
            console.error('Fehler beim Speichern des Contracts oder Aktualisieren des Items:', error);
            alert('Es gab ein Problem beim Speichern des Vertrags. Bitte versuchen Sie es erneut.');
        });
    });




    document.getElementById('item').innerHTML = '<a href="' + window.location.origin + '/lending/?id=' + itemId + '&saveID=' + shuffledToken + '" target="_blank">Link zum Browsertab</a>';
    // const apiUrl = `http://${urlToAPI}/api/postSaveItem?tempsaveID=${shuffledToken}`;
    // fetch(apiUrl)
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Netzwerkantwort war nicht ok');
    //         }
    //         return response.text(); // oder response.json() wenn JSON erwartet wird
    //     })
    //     .then(data => {
    //         let demo = JSON.parse(data)[0];
    //         console.info(JSON.parse(data)[0]);
    //         console.info('Websocket Started');
    //         websocketFeedback(shuffledToken);
    //     })
    //     .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
});

function generateQRCode(itemId) {
    var qrcodeContainer = document.getElementById('qrcode-container');
    qrcodeContainer.innerHTML = ''; // Leeren Sie den Container, um sicherzustellen, dass nur ein QR-Code angezeigt wird

    // qrcodeContainer.classList.remove("filter");

    var qr = new QRCode(document.getElementById('qrcode-container'), {
        text: 'https://fljota.network/lending/?id=' + itemId + '&saveID=' + itemId,
        width: 300,
        height: 300
    });

    // qrcodeContainer.style.display = 'block';
}
// Event-Listener für den "Item zurückfordern" Button
document.getElementById('returnButton').addEventListener('click', function () {

   
    // Funktion zum Abrufen der Vertragsinformationen und Senden des Webhooks
    db.collection('items').doc({ id: Number(itemId) }).get().then(item => {
        if (item && item.contract) {

            const socket = new WebSocket(websocketURL + urlToAPI + '/?saveID=' + item.contract);
            socket.onmessage = function (event) {
                console.log('Rückgabeanforderung erhalten:', event.data);


                const receivedMessageElement = document.getElementById('receivedMessage');

                receivedMessageElement.innerHTML = `
                        <div class="message-box">
                            <h3>🔄 Rückgabeanforderung eingegangen</h3>
                            <p>Contract ID: <strong>${escapeHtml(event.data)}</strong></p>
                            <p>Zeitpunkt: ${new Date().toLocaleString()}</p>
                        </div>
                    `;
                    receivedMessageElement.classList.add('active');
                    receivedMessageElement.scrollIntoView({ behavior: 'smooth' });
            };

            return db.collection('contracts').doc({ contractid: item.contract }).get();
        } else {
            throw new Error('Item nicht gefunden oder hat keinen Vertrag');
        }
    }).then(contract => {
        if (contract) {
            const contractId = contract.contractid;
            const userId = contract.lenderId;
            const itemName = contract.itemName;
            const message = "Bitte Zurückgeben"; // `Bitte das Item "${itemName}" mit der Vertragsnummer ${contractId} bald zurückgeben. Überprüfen Sie den Status in Ihrer fljota.network Item-Liste.`;

            // Webhook aufrufen
            fetch(`https://app.fljota.network/sendToUser?userId=${encodeURIComponent(userId)}&message=${encodeURIComponent(message)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Webhook-Aufruf fehlgeschlagen');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Webhook erfolgreich aufgerufen:', data);
                })
                .catch(error => {
                    console.error('Fehler beim Aufrufen des Webhooks:', error);
                    alert('Es gab einen Fehler beim Senden der Rückgabeanfrage.');
                });
        } else {
            console.error('Vertrag nicht gefunden');
            alert('Der Leihvertrag konnte nicht gefunden werden.');
        }
    }).catch(error => {
        console.error('Fehler beim Abrufen des Vertrags:', error);
        alert('Es gab einen Fehler beim Abrufen der Vertragsinformationen.');
    });


    // Funktion zum Abrufen des Item-Namens aus der Datenbank
    // db.collection('items').doc({ id: Number(itemId) }).get().then(item => {
    //     if (item) {
    //         const itemName = item.name;
    //         const contractId = item.contract;
    //         const currentDate = new Date().toLocaleDateString('de-DE');
    //         const message = `Bitte das Item mit dem Namen ${itemName} und der Vertragsnummer ${contractId}, das am ${currentDate} verliehen wurde, wieder bald zurückgeben. Bitte prüfe in deiner fljota.network Item Liste, den Status des Verleihs.`;
    //         const encodedMessage = encodeURIComponent(message);
    //         const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    //         // Öffne WhatsApp mit der vordefinierten Nachricht
    //         window.open(whatsappUrl, '_blank');
    //     } else {
    //         console.error('Item nicht gefunden');
    //         alert('Das Item konnte nicht gefunden werden.');
    //     }
    // }).catch(error => {
    //     console.error('Fehler beim Abrufen des Items:', error);
    //     alert('Es gab einen Fehler beim Abrufen der Item-Informationen.');
    // });
});

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


