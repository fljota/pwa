function blobToJson(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Beim erfolgreichen Laden wird der Blob-Inhalt als Text verfügbar gemacht
        reader.onload = function() {
            try {
                // Blob-Inhalt in JSON parsen
                const jsonObject = JSON.parse(reader.result);
                resolve(jsonObject);  // JSON-Objekt zurückgeben
            } catch (error) {
                reject(error);  // Fehler beim Parsen melden
            }
        };

        // Fehler beim Laden des Blob
        reader.onerror = function() {
            reject(reader.error);
        };

        // Blob-Inhalt als Text lesen
        reader.readAsText(blob);
    });
}

function getCurrentDateTime() {
    const now = new Date();
    
    // Tag
    let day = now.getDate();
    day = day < 10 ? '0' + day : day;

    // Monat
    let month = now.getMonth() + 1; // Monate sind nullbasiert
    month = month < 10 ? '0' + month : month;

    // Jahr
    const year = now.getFullYear();

    // Stunden
    let hours = now.getHours();
    hours = hours < 10 ? '0' + hours : hours;

    // Minuten
    let minutes = now.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    // Sekunden
    let seconds = now.getSeconds();
    seconds = seconds < 10 ? '0' + seconds : seconds;

    // Format: DD.MM.YYYY HH:MM:SS
    const formattedDateTime = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    
    return formattedDateTime;
}
export { blobToJson, getCurrentDateTime };
