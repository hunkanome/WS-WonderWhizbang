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
 * Transforme réponse en une liste de monuments chacun ayant une liste d'images
 * @param {Array.<JSON>} response la réponse de la requête SPARQL à DBpedia
 * @returns {Array.<JSON>} la liste des monuments
 */
function formatResult(response) {
    let data = response.results.bindings;
    let header = response.head.vars;
    let result = [];

    data.forEach(element => {
        let obj = {};
        const lastIndex = result.length - 1;
        if (result.length > 0 && result[lastIndex].monumentLabel.value === element.monumentLabel.value) {
            result[lastIndex].picture.push(element.picture.value);
        } else {
            header.forEach(key => {
                obj[key] = element[key];
            });
            obj.picture = [obj.picture.value];
            result.push(obj);
        }
    });

    return result;
}


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