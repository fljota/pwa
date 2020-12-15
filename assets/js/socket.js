import { Socket } from "phoenix"

let socket = new Socket("/socket", {
  params: { token: window.userToken },
  logger: (kind, msg, data) => { console.info(`${kind}: ${msg}`, data) }
})

socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("item_count:total", {})

document.getElementById('addrandombutton').addEventListener("click", event => {
  //TODO this is ugly so refactor it.
  channel.push("total", { body: parseInt(document.getElementById("itemcount").innerHTML) })
})

channel.on("total", payload => {

  // Temporary Parse Attribute Count to Frontend view
  let fakecount = !document.getElementById("totalitemcount").innerHTML ? 0 : parseInt(document.getElementById("totalitemcount").innerHTML)
  // 
  document.getElementById("totalitemcount").innerHTML = payload.body + fakecount

})

channel.join()
  .receive("ok", resp => {
    // If connected publish total item number on channel
    channel.push("total", { body: parseInt(document.getElementById("itemcount").innerHTML) })
    // TODO Read itemcount not from HTML but from Attributes
    // let tempitemcount = document.getElementById("item").getAttribute("item-count")
    // rewrite as arrow function
    let itemsonmylist = document.getElementById("itemcount").innerHTML
    console.log(`${itemsonmylist} items securely stored in your local indexedDB`, resp)
  })
  .receive("error", resp => { console.log("Unable to join", resp) })

export { socket }
