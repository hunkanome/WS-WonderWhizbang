/**
 * Crée une carte du monde avec des points sur la localisation de chaque monument
 * 
 * @param {Array<JSON>} monuments Liste de monuments à afficher sur la carte
 */
function createMap(monuments) {
    // Check if monuments is not empty
    if (monuments.length === 0) return;

    let map = L.map('map', { worldCopyJump: true, minZoom: 1.5 }).setView([48.856614, 2.3522219], 2);
    map.worldCopyJump = true;
    if (monuments.length > 0 && monuments.length < 20) {
        // Get geographical center of all monuments
        let totalLat = 0;
        let totalLong = 0;
        let count = 0;
        monuments
            .filter((monument) => { return monument.position?.latitude && monument.position.longitude })
            .forEach((monument) => {
                totalLat += monument.position.latitude;
                totalLong += monument.position.longitude;
                count++;
            });
        if (count != 0) {
            const centerLat = totalLat / count;
            const centerLong = totalLong / count;
            map.setView([centerLat, centerLong], 5);
        }
    }
    // Use a different tile provider for a different style
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add a metric scale
    L.control.scale({ imperial: false }).addTo(map);

    // Add the monuments to the map
    if (monuments.length === 1 && monuments[0].position?.latitude && monuments[0].position.longitude) {
        L.marker([monuments[0].position.latitude, monuments[0].position.longitude]).addTo(map).bindPopup(monuments[0].label);
    } else {
        monuments
            .filter((monument) => { return monument.position?.latitude && monument.position.longitude })
            .forEach((monument) => {
                let marker = L.marker([monument.position.latitude, monument.position.longitude]);
                marker.monument = monument;
                marker.on('click', showMarkerPopup);
                marker.addTo(map);
            });
    }
}

/**
 * Open the popup when the marker is clicked.
 * 
 * Add the label and load the image in the popup.
 * 
 * @param {Event} event 
 */
function showMarkerPopup(event) {
    const monument = event.target.monument;

    const imageElement = document.createElement('img');
    loadImage(imageElement, monument.thumbnail);
    imageElement.alt = monument.label;

    const linkElement = document.createElement('a');
    linkElement.href = `contenu.html?monument=${encodeURIComponent(monument.uri)}`;
    linkElement.innerText = "\n" + monument.label;

    const divElement = document.createElement('div');
    divElement.classList.add("text-center");
    divElement.appendChild(imageElement);
    divElement.appendChild(linkElement);

    event.target.bindPopup(divElement).openPopup();
}