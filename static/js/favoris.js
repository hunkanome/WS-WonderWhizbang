/**
 * @file Script JS pour la page de favoris
 * Envoie une requête SPARQL à DBpedia pour récupérer tous les favoris
 */


/**
 * Ligne de la grille Bootstrap contenant les cartes
 * @type {HTMLDivElement}
 */

/**
 * Message d'erreur
 */
let messageField = document.getElementById("messageField");


/**
 * Hydrates the page with information about the favorites
 * Also set the event listeners
 * 
 * @returns {void}
 */
function hydratePage() {
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = "";
    let favorites = JSON.parse(localStorage.getItem("favorites"));
    if (favorites) {
        favorites.forEach(element => {
            getLightMonumentByURI(element)
                .then(monument => {
                    if (monument) {
                        resultContainer.appendChild(createCard(monument));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    } else {
        console.log("Aucun favori enregistré");
        messageField.innerHTML = "Aucun favori enregistré";
    }

    /**
     * Bouton d'effacement des favoris
     */
    const clearButton = document.getElementById("btnClearFavorites");
    clearButton.addEventListener("click", () => {
        localStorage.removeItem("favorites");
        resultContainer.innerHTML = "";
        messageField.innerHTML = "Aucun favori enregistré";
    });
}


// Hydrate the page or prepare the hydration
if (document.readyState === "complete") {
    hydratePage();
} else {
    window.addEventListener("load", hydratePage);
}


