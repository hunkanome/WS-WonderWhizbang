/**
 * Envoie une requête SPARQL à DBpedia pour récupérer tous les monuments avec leur position géographique
 */


/**
 * Entrée contenant le texte de la recherche
 * @type {HTMLInputElement}
 */
let searchInput = document.getElementById('searchInput');


/**
 * Permets de créer la map clicable avec les monuments
 * @param {*} monuments 
 */
function createClickableMap(monuments) {
    // If monuments is not an array, convert it to an array
    if (!Array.isArray(monuments)) {
        monuments = [monuments];
    }

    var map = L.map('mapWorld').setView([48.856614, 2.3522219], 2);

    // Use a different tile provider for a different style
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add a scale
    L.control.scale().addTo(map);

    // Add the monuments to the map
    monuments.forEach(function(monument) {
        if (monument.label && monument.latitude && monument.longitude) {
            popUpContent = `<a href="contenu.html?monument=${encodeURIComponent(monument.uri.value)}">${monument.label.value}</a>`;
            L.marker([monument.latitude.value, monument.longitude.value]).addTo(map)
            .bindPopup(popUpContent);
        } else {
            console.log(`Pas de position pour le monument : ${monument.label}`);
        }
    });
}


/**
 * Hydrate the page with the statistics and a random monument
 * Also set the event listeners
 * 
 * @returns {void}
 */
function hydratePage() {
    getAllMonumentsPosition()
    .then(monuments => {
        createClickableMap(monuments);
    });
}


// Hydrate the page or prepare the hydration
if (document.readyState === "complete") {
    hydratePage();
} else {
    window.addEventListener("load", hydratePage);
}