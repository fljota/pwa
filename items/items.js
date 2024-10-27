import '../milligram.css'
import '../style.css'
import fljotaLogo from '/fljota_offline.svg'
import Localbase from 'localbase'

console.log('Loading APP');

document.querySelector('#app').innerHTML = `
  <h1><span id="itemcount"></span> Items in your Sharing History</h1>

  <table>
  <thead>
    <tr>
    <th></th>
      <th>Item</th>
      <th>Besitzer</th>
      <th>Datum</th>
      
      <th>Action</th>
    </tr>
  </thead>
  <tbody id="tbodyitems">
    
  </tbody>
</table>

<button class="button-large button-outline" id="additem">+ Add item to your inventory</button>
<p>als ${localStorage.getItem('userName')}</p>

`;

// Für die Platzhalter Items werden verschiedene Farben vorgehalten.
const colors = [
  'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown',
  'cyan', 'magenta', 'lime', 'teal', 'indigo', 'violet', 'gold', 'silver',
  'coral', 'aqua', 'salmon', 'khaki'
];

// Funktion, um zufällig eine Farbe auszuwählen
function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

let db = new Localbase('itemDatabase');

// Funktion zum Abrufen aller Items und Contracts
async function getItemsAndContracts() {
  const items = await db.collection('items').get();
  const contracts = await db.collection('contracts').get();
  return { items, contracts };
}

// Funktion zum Rendern der Tabelle
async function renderTable() {
  const { items, contracts } = await getItemsAndContracts();
  const tbodyitems = document.getElementById('tbodyitems');
  tbodyitems.innerHTML = '';

  contracts.forEach(contract => {
    const matchingItem = items.find(item => item.contract === contract.contractid);
    if (!matchingItem) return;

    let vargetRandomColor = getRandomColor();
    let ichuser = (contract.lender == localStorage.getItem('userName')) ? '<strong>(ich)</strong>' : '';
    let ichowner = (contract.owner == localStorage.getItem('userName')) ? '<strong>(ich)</strong>' : '';

    tbodyitems.innerHTML += `
    <tr>
      <td>
        <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad${vargetRandomColor}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:gray; stop-opacity:1" />
                <stop offset="100%" style="stop-color:${vargetRandomColor}; stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#grad${vargetRandomColor})" />
    </svg>
      </td>
      <td>${contract.contractid}</td>
      <td>Owner ${ichowner}: ${contract.owner} <br />Lender: ${contract.lender} ${ichuser}</td>
      <td>${contract.datum}</td>
      <td><a href="/sharing/?id=${matchingItem.id}"><button>Details</button></a></td>
    </tr>    
    `;
  });

  document.getElementById('itemcount').innerHTML = contracts.length;
}

renderTable();

// db.collection('contracts').doc({uid: 1}).get().then( it => console.log(it) );


// db.collection('contracts').get().then(items => {
//   console.info("LOCALBASE wird ausgelesen:")
//   document.getElementById('itemcount').innerHTML = items.length

//   // console.log(items);
//   items.forEach(element => {

//     let vargetRandomColor = getRandomColor();

//     let ichuser = (element.lender == localStorage.getItem('userName')) ? '<strong>(ich)</strong>' : '';
//     let ichowner = (element.owner == localStorage.getItem('userName')) ? '<strong>(ich)</strong>' : '';

//     document.getElementById('tbodyitems').innerHTML += `
//     <tr>
//     <td>
//          <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//             <linearGradient id="grad${vargetRandomColor}" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" style="stop-color:gray; stop-opacity:1" />
//                 <stop offset="100%" style="stop-color:${vargetRandomColor}; stop-opacity:1" />
//             </linearGradient>
//         </defs>
//         <circle cx="32" cy="32" r="32" fill="url(#grad${vargetRandomColor})" />
//     </svg>
//     </td>
//       <td>${element.contractid}</td>
//       <td>Owner ${ichowner}: ${element.owner} <br />Lender: ${element.lender} ${ichuser}</td>
//       <td>${element.datum}</td>
      
//       <td><a href="/sharing/?id=${element.cuid}"><button>Details</button></a></td>
//     </tr>    
//     `;

//   });

// });

document.getElementById("additem").addEventListener("click", () => {
  console.log("Add item to your inventory");

  document.querySelector('#app').innerHTML = `
  <h1>Items</h1>

  <p>Add a Item to your Inventory</p>
 
  <fieldset>
    <label for="nameField">Item Bezeichnung</label>
    <input type="text" placeholder="Dies und Das" id="nameField" name="nameField">

    <label for="captureInput" class="custom-file-upload">
    <img src="/assets/camera-retro-thin.svg" alt="Capture Image" height="36" />
    Bild erstellen / hochladen
    </label>
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
    <button class="button-primary" id="itemaddtodb">Speichern</button>
  </fieldset>


  `;

  document.getElementById("itemaddtodb").addEventListener("click", (event) => {
    // event.preventDefault();
    console.log("Submit");
    let item = {
      cuid: 2,
      name: nameField.value,
      image: '#00aa33',
      wert: wertField.value,
      beschreibung: commentField.value,
      allowSharing: confirmField.checked,
      owner: localStorage.getItem('userName')
    }
    console.info(item);
    // document.startViewTransition(() => updateDOM());

    db.collection('contracts').add(item);

    window.location = "../items/";
  });
});

document.addEventListener("DOMContentLoaded", (event) => {

});

// async function findMatchingItemsAndContracts() {
//   // let db = new Localbase('itemDatabase');

//   // Hole alle items
//   let items = await db.collection('items').get();

//   // Hole alle contracts
//   let contracts = await db.collection('contracts').get();

//   // Array, um die gefundenen Paare zu speichern
//   let matchingPairs = [];

//   // Durchlaufe alle contracts und suche das passende item anhand der itemId
//   contracts.forEach(contract => {
//     // Suche das item, dessen id mit der itemId des contracts übereinstimmt
//     let matchingItem = items.find(item => item.contract === contract.contractid);

//     if (matchingItem) {
//       // Wenn ein passendes item gefunden wurde, speichere das Wertepaar
//       matchingPairs.push({
//         item: matchingItem,
//         contract: contract
//       });
//     }
//   });

//   // Ausgabe der gefundenen Paare
//   if (matchingPairs.length > 0) {
//     matchingPairs.forEach(pair => {
//       console.log("Gefundenes Paar:");
//       console.log("Item:", pair.item);
//       console.log("Contract:", pair.contract);
//     });
//   } else {
//     console.log("Keine übereinstimmenden Paare gefunden.");
//   }
// }

// // Die Funktion aufrufen
// findMatchingItemsAndContracts();

