/**
 * Envoie une requête SPARQL à DBpedia pour récupérer tous les monuments avec leur position géographique
 */


/**
 * Entrée contenant le texte de la recherche
 * @type {HTMLInputElement}
 */
let searchInput = document.getElementById('searchInput');

/**
 * Hydrate the page with the statistics and a random monument
 * Also set the event listeners
 * 
 * @returns {void}
 */
function hydratePage() {
    getAllMonumentsPosition()
    .then(monuments => {
        createMap(monuments);
    });
}


// Hydrate the page or prepare the hydration
if (document.readyState === "complete") {
    hydratePage();
} else {
    window.addEventListener("load", hydratePage);
}