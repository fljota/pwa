function sendItemToLender(lender, item) {
    // const apiUrl = `http://${urlToAPI}/api/postItem?tempsaveID=${lender}&itemID=${item}`;
    const apiUrl = `http://localhost:8080/api/postItem?tempsaveID=${lender}&itemID=${item}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok');
            }
            return response.text(); // oder response.json() wenn JSON erwartet wird
        })
        .then(data => {
            let demo = JSON.parse(data)[0];
            console.info(JSON.parse(data)[0]);
            // document.getElementById('item').innerHTML = demo.x;

            console.info('Websocket Started');
            // websocketFeedback(lender);



        })
        .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
}

function websocketFeedback(shuffledToken) {
    // const ws = new WebSocket(`ws://${urlToAPI}?${shuffledToken}`);
    const ws = new WebSocket(`ws://localhost:8080?${shuffledToken}`);

    ws.onopen = function () {
        console.log('Verbindung hergestellt');
        // Nachricht an den Server senden
        ws.send('Websocket Verbindung erfolgreich aufgebaut ' + shuffledToken);
    };

    ws.onmessage = function (event) {

        if (event.data) {
            document.getElementById('item').innerHTML = `
                    <button id="postItem" type="button">Verleihen</button>
                    `;
        }
        console.log('Nachricht vom Server:', event.data);
        document.getElementById('messages').innerText += `\n${event.data}`;

        document.getElementById('postItem').addEventListener('click', (event) => {
            console.info("Verleihvorgang initiiert");
            sendItemToLender(shuffledToken + 'lender', '{"item":"Beispiel DEMO "}');
        });
    };

    ws.onerror = function (error) {
        console.error('WebSocket-Fehler:', error);
    };

    ws.onclose = function (event) {
        console.log('WebSocket-Verbindung geschlossen', event);
    };
}

export { sendItemToLender, websocketFeedback };
