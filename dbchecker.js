export function dbchecker(element, iid) {
    let counter = 0
    // console.log(iid);
    const DATABASE_NAME = element;

    let request = indexedDB.open(DATABASE_NAME, 1);

    request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
    };

    request.onupgradeneeded = (event) => {
        console.log('Updating');
        let db = event.target.result;

        var objectStore = db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('image', 'image', { unique: false });
        objectStore.createIndex('wert', 'wert', { unique: false });
        objectStore.createIndex('beschreibung', 'beschreibung', { unique: false });
        objectStore.createIndex('allowSharing', 'allowSharing', { unique: false });
    };

    request.onsuccess = (event) => {
        console.log('Demo');
        let db = event.target.result;
    
        const transaction = db.transaction(["items"], "readonly");
        const objectStore = transaction.objectStore("items");
    
        const countRequest = objectStore.count();
        countRequest.onsuccess = () => {
          if(countRequest.result>0) { 
            // alert(iid);
         // document.getElementById("itemcount").innerHTML = `Items in your inventory: ${countRequest.result}`;
          }
          else {
           // document.getElementById("itemcount").innerHTML = 'Start now with your inventory';
          }
        };
        const itemObject = objectStore.getAll();
        itemObject.onsuccess = () => {
          console.log(itemObject.result);
    
          itemObject.result.forEach(element => {
            console.log(element.name);
    
            let DOM_img = document.createElement("img");
            DOM_img.src = element.image;
            DOM_img.alt = `Name: ${element.name}`;
            //document.getElementById("card").appendChild(DOM_img);
    
          });
        };
    };
}
