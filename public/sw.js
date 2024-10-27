// import { precacheAndRoute } from 'workbox-precaching'

// precacheAndRoute(self.__WB_MANIFEST)

// Event-Listener für Push-Ereignisse
self.addEventListener('push', function(event) {
    let data = {};

    if (event.data) {
        try {
            // JSON-Daten parsen
            data = event.data.json();
        } catch (e) {
            console.error('Fehler beim Parsen der Push-Daten:', e);
        }
    }

    const title = data.title || 'Standardtitel';
    const options = {
        body: data.body || 'Standardnachricht',
        icon: 'vite.svg', // Icon für die Benachrichtigung
        badge: 'vite.svg', // Badge für die Benachrichtigung
        image: 'https://since1999.de/assets/guitar_astronaut_since1999.png', // Bild für die Benachrichtigung
        data: {
            url: data.url || 'https://fljota.network' // Standard-URL, falls keine angegeben wurde
        }
    };

    // Push-Benachrichtigung anzeigen
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Neuer Event-Listener für Benachrichtigungsklicks
self.addEventListener('notificationclick', function(event) {
    console.log('Benachrichtigung wurde geklickt');
    console.log('URL:', event.notification.data.url);
    event.notification.close();

    if (event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    } else {
        console.error('Keine URL in den Benachrichtigungsdaten gefunden');
    }
});


