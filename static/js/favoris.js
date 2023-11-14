/**
 * @file Script JS pour la page de favoris
 * Envoie une requête SPARQL à DBpedia pour récupérer tous les favoris
 */


/**
 * Ligne de la grille Bootstrap contenant les cartes
 * @type {HTMLDivElement}
 */
let resultContainer = document.getElementById("resultContainer");

/**
 * Message d'erreur
 */
let messageField = document.getElementById("messageField");

/**
 * Bouton d'effacement des favoris
 */
let clearButton = document.getElementById("btnClearFavorites");

/**
 * Hydrates the page with information about the favorites
 * Also set the event listeners
 * 
 * @returns {void}
 */
function hydratePage() {
    resultContainer.innerHTML = "";
    let favorites = JSON.parse(localStorage.getItem("favorites"));
    if (favorites) {
        favorites.forEach(element => {
            getMonumentByURI(element)
                .then(monument => {
                    resultContainer.innerHTML += createCard(monument).outerHTML;
                })
                .catch(error => {
                    researchStats.innerHTML = "Une erreur est survenue : " + error;
                    console.error('Error:', error);
                });
        });
    } else {
        console.log("Aucun favori enregistré");
        messageField.innerHTML = "Aucun favori enregistré";
    }
}


// Hydrate the page or prepare the hydration
if (document.readyState === "complete") {
    hydratePage();
} else {
    window.addEventListener("load", hydratePage);
}



/**
 * Bouton d'effacement des favoris
 */
clearButton.addEventListener("click", () => {
    localStorage.removeItem("favorites");
    resultContainer.innerHTML = "";
    messageField.innerHTML = "Aucun favori enregistré";
});