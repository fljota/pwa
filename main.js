import './milligram.css'
import './style.css'
import javascriptLogo from './javascript.svg'
import fljotaLogo from '/fljota_offline.svg'
import { setupCounter } from './counter.js'
import fictionalCharacters from './de_unique_fictional_characters.json';
import Localbase from 'localbase'
// import { registerSW } from 'virtual:pwa-register'

// registerSW({ immediate: true })

const DATABASE_NAME = 'itemDatabase';

// const ansprache = fictionalCharacters[Math.floor(Math.random() * fictionalCharacters.length)]

if (localStorage.getItem('userName') && localStorage.getItem('annonym') == 'false') {
  var demoUser = '<h2>' + localStorage.getItem('userName') + '</h2>';
}
else {
  var demoUser = 'Um Items zu verleihen brauchst Du einen aktivierten Benuter: <br /><a href="/user/"><button type="button">Demo User generieren</button></a>';
}

if (localStorage.getItem('tempSaveId')) {
  var demoTemp = '<a href="/sharing/?save=' + localStorage.getItem('tempSaveId') + '">Ein Item wartet auf den Übertrag</a>';
}
else {
  var demoTemp = '';
}
document.querySelector('#app').innerHTML = `
  <div>

      <img src="${fljotaLogo}" class="logo" alt="fljota.network" />


    <h1 id="itemcount">Floating Item Network</h1>
    ${demoUser}
    <br />
    ${demoTemp}
    <div id="card">
      
    </div>
    
    <button class="button-large button-outline" id="counter">+ Add item to your inventory</button>
<p>als ${localStorage.getItem('userName')}</p>

  </div>

  <dialog>
  <p>Add a Item to your Inventory</p>
  <form id="form">
  <fieldset>
    <label for="nameField">Item Bezeichnung</label>
    <input type="text" placeholder="Dies und Das" id="nameField">

    <label for="captureInput">Capture Image</label>
    <input type="file" accept="image/*" capture="environment" id="captureInput">
    <br />
    <canvas id="previewCanvas" width="128" height="128"></canvas>

    <label for="wertField">Wert</label>
    <select id="wertField">
      <option value="0-10">weniger 10€</option>
      <option value="10-50">10-50€</option>
      <option value="50+">mehr als 50€</option>

    </select>
    <label for="commentField">Beschreibung</label>
    <textarea placeholder="Kommentar zum Item" id="commentField"></textarea>

    <input type="checkbox" id="confirmField">
    <label class="label-inline" for="confirmField">Darf weitergegeben werden</label>
    <br />
    ${localStorage.getItem('userName')}
    <br />

    <button id="overlay">Close</button>
    <input class="button-primary" type="submit" value="Speichern">
  </fieldset>
</form>
</dialog>
`

if (localStorage.getItem('annonym') === 'true') {
  document.getElementById("userNotification").style.display = "block";
}

setupCounter(document.querySelector('#counter'))

// ------------------------------------------------------------------------------------------------
// START Code for fljota Add Items

let itemstorage = new Localbase('itemDatabase');
// let itemstorage = new Localbase(DATABASE_NAME);

document.addEventListener("DOMContentLoaded", (event) => {

  var captureInput = document.getElementById('captureInput');
  var previewCanvas = document.getElementById('previewCanvas');
  var ctx = previewCanvas.getContext('2d');
  var nameField = document.getElementById('nameField');
  var wertField = document.getElementById('wertField');
  var commentField = document.getElementById('commentField');
  var confirmField = document.getElementById('confirmField');

  // let request = indexedDB.open(DATABASE_NAME, 1);
  

  itemstorage.collection('items').get().then(items => {

    if (items.length > 0) {
      document.getElementById("itemcount").innerHTML = `Items in your inventory: ${items.length}`;
    }
    else {
      document.getElementById("itemcount").innerHTML = 'Start now with your inventory';
    }

    // document.getElementById("card").innerHTML = items[0].name;

    items.forEach(element => {

      var itemDOM_link = document.createElement("a");
      itemDOM_link.setAttribute("href", "/sharing/?id=" + element.id);

      let DOM_img = document.createElement("img");
      DOM_img.src = element.image;
      DOM_img.alt = `Name: ${element.name}`;

      itemDOM_link.appendChild(DOM_img);

      if (element.contract) {
        console.info(element.contract);
        let DOM_shareid = document.createElement("div");
        DOM_shareid.setAttribute("id", element.contract);
        DOM_shareid.innerHTML = element.contract;
        itemDOM_link.appendChild(DOM_shareid);
      }


      document.getElementById("card").appendChild(itemDOM_link);

    });
  });

  captureInput.addEventListener('change', function (event) {

    console.log('Update');

    document.getElementById("itemNotification").style.display="block";
    document.getElementById("itemNotification").style.backgroundColor="green";

    var file = event.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.src = e.target.result;
    
        img.onload = function () {
          // Originale Bildgröße
          var imgWidth = img.width;
          var imgHeight = img.height;
    
          // Finde die kürzere Seite (Breite oder Höhe), um ein Quadrat zu erstellen
          var cropSize = Math.min(imgWidth, imgHeight);
    
          // Berechne die Offsets, um das Bild von der Mitte aus zu beschneiden
          var cropX = (imgWidth - cropSize) / 2;
          var cropY = (imgHeight - cropSize) / 2;
    
          // Skaliere das quadratische Bild auf 128x128
          ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          ctx.drawImage(
            img,
            cropX, cropY,      // Quelle: Startkoordinaten für den Schnitt
            cropSize, cropSize, // Quelle: Breite und Höhe des Schnitts (quadratisch)
            0, 0,              // Ziel: Position auf dem Canvas
            128, 128           // Ziel: Größe auf dem Canvas (128x128)
          );
    
          // Optional: Canvas-Inhalt in ein Data URL umwandeln
          var resizedImageData = previewCanvas.toDataURL('image/png');
          // console.log(resizedImageData);


          document.getElementById("form").addEventListener("submit", (event) => {
            event.preventDefault();
        
            // Zuerst die Items abrufen
            itemstorage.collection('items').get().then((items) => {
                let newId = 1;
        
                console.log('Vorhandene Items:', items); // Debugging: Vorhandene Items ausgeben
        
                if (items.length > 0) {
                    // Höchste existierende ID finden
                    let maxId = Math.max(...items.map(item => item.id));
                    // alert('Maximale ID gefunden: ' + maxId); // Maximale ID ausgeben
        
                    // Neue ID ist die höchste ID + 1
                    newId = maxId + 1;
                }
        
                // Neues Item mit der berechneten ID
                let storetoindexeddb = {
                    id: newId,
                    name: nameField.value,
                    image: resizedImageData,
                    wert: wertField.value,
                    beschreibung: commentField.value,
                    allowSharing: confirmField.checked,
                    owner: localStorage.getItem('userName')
                };
        
                // Neues Item in die Datenbank hinzufügen
                itemstorage.collection('items').add(storetoindexeddb).then(() => {
                    dialog.close();
                    // Statt des relaod()s wird ein pulsierender Notification-Dot angezeigt.
                    // window.location.reload();
                }).catch(error => {
                    console.error("Fehler beim Schreiben in die Datenbank:", error);
                });
            }).catch(error => {
                console.error("Fehler beim Abrufen der Items:", error); // Fehler beim Abrufen behandeln
            });
        });
        

        };
      };
      reader.readAsDataURL(file);
    }
    
    navigator.vibrate([500]);

  });

  const dialog = document.querySelector("dialog");
  document.getElementById("overlay").addEventListener('click', (event) => {
    event.preventDefault();
    dialog.close();
  });

  document.getElementById("counter").addEventListener('click', (event) => {
    dialog.showModal();
  });
});
