// let Item = {
//     init(socket, element) {
//         if(!element) { return }
//         let itemId = 10; //element.getAttribute("item-count")
//         socket.connect()
//         Item.init(element.id, itemId, () => {
//             this.onReady(itemId, socket)
//         })
//     },
//     onrReady(itemId, socket) {
//         let countallitems = socket.channel("items:" + itemId)
//         // TODO
//     }
// }






// let Item = {
//   init(socket, element) {
//     if (!element) { return }
//     let itemId = 111; //element.getAttribute("item-count")
//     socket.connect()
//     Item.init(element.id, itemId, () => {
//       this.onReady(itemId, socket)
//     })
//   },
//   onrReady(itemId, socket) {
//     let countallitems = socket.channel("items:" + itemId)

//     countallitems.join()
//       .receive("ok", resp => console.log("joined the item channel", resp))
//       .receive("error", reason => console.log("join failed", reason))
//   }
}




export default Item
