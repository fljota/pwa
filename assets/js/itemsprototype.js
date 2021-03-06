let addItem = (localitems, iid) => {
  let did = getRandomInt(iid);
  let dco = getRandomColor();
  let dfj = getRandomFljota();
  localitems.collection('items').add({
    id: did,
    item: dco,
    detail: dfj
  })
  // TODO Optimize Promisse Call
  updateNumber(localitems);
  console.log(`Floating Item ${did} created in indexed DB.`);
}

let updateNumber = (localitems) => {
  return localitems.collection('items').get().then(items => {
    cleanUpdate( localitems, (typeof items.length == 'number') ? items.length : '100');
   });
}

let cleanUpdate = (localitems) => {
  
  localitems.collection('items').get().then(items => {
    document.getElementById('itemcount').innerText = items.length;
    document.getElementsByTagName("tbody")[0].innerHTML = '';
    items.forEach(element => {
      let newitem = ('<tr id="line' + element.id + '"><td><svg height="50" width="50"><circle cx="25" cy="25" r="24"  fill="' + element.item + '" />' + element.item + "</svg></td><td>" + element.id + "</td><td>" + element.detail + '</td><td><button class="button button-outline" id="deletebutton' + element.id + '">' + element.id + ' Delete</button></td></tr>');
      document.getElementsByTagName("tbody")[0].insertAdjacentHTML('beforeend',newitem);

      document.getElementById("deletebutton" + element.id).addEventListener("click",  () => {
        deleteItem(localitems, element.id);
      });
    });
  });
}

let getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

let getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let getRandomFljota = () => {
  var value = 'ABC';
  var ft = 'ﬅ';
  for (var i = 0; i < 1; i++) {
    ft += value[Math.floor(Math.random() * 3)];
  }
  return ft;
}

let deleteAll = (localitems) => {
  localitems.collection('items').delete();
  document.getElementsByTagName("tbody")[0].innerHTML = '';
  updateNumber(localitems);
  // TODO Show a smart illustration, if Item Inventroy is empty
  //   '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Packaging_DigitalBevaring.png/527px-Packaging_DigitalBevaring.png" />';
  return true
}

let deleteItem = (localitems, lid) => {
  localitems.collection("items").doc({ id: lid }).delete();
  document.getElementById('line'+lid).remove();
  // TODO Fix ItemCount after Item Remove while not updating full cleanUpdate
  document.getElementById('itemcount').innerText = '?';
  // cleanUpdate(localitems);
  return true
}

export { addItem, deleteAll, deleteItem, cleanUpdate };
