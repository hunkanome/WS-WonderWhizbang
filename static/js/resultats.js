/**
 * @file Script JS pour la page de résultats
  * Envoie une requête SPARQL à DBpedia pour récupérer tous les monuments correspondant à la recherche
 * Le nom de la page recherchée est passé dans un paramètre de l'url nommé "monumentName"
 * par exemple ".../resultats.html?recherche=Cala"
 * Note : Si le texte de la recherche contient plusieurs mots séparés par des espaces if faut les remplacer par des tirets du bas / tirets du 8 / underscores
 */


/**
 * Ligne de la grille Bootstrap contenant les cartes
 * @type {HTMLDivElement}
 */
const resultContainer = document.getElementById("resultContainer");

/**
 * Élément contenant des statistiques sur la recherche
 */
const statsRecherche = document.getElementById("stats");

/**
 * Parametres de l'url
 * @type {URLSearchParams}
 */
const urlParameters = new URLSearchParams(window.location.search);

/** 
 * Entrée contenant le texte de la recherche
 * @type {HTMLInputElement}
*/
const champRecherche = document.getElementById('searchInput');

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
            result[lastIndex].thumbnail.push(element.thumbnail.value);
            result[lastIndex].picture.push(element.picture.value);
        } else {
            header.forEach(key => {
                obj[key] = element[key];
            });
            obj.thumbnail = [obj.thumbnail.value];
            obj.picture = [obj.picture.value];
            result.push(obj);
        }
    });
    return result;
}


/**
 * Hydrate the page with the statistics and a random monument
 * Also set the event listeners
 * 
 * @returns {void}
 */
function hydratePage() {
    const startTime = new Date().getTime();
    const researchTerm = urlParameters.get('search');
    if (researchTerm === null || researchTerm === "") {
        statsRecherche.innerText = "Aucun terme de recherche n'a été spécifié";
        return;
    }
    const researchType = urlParameters.get('type');
    getMonuments(researchType, researchTerm)
        .then(monuments => {
            createMap(monuments);
            monuments.forEach(monument => {
                const card = createCard(monument);
                resultContainer.appendChild(card);
            })
            const timespan = new Date().getTime() - startTime;
            statsRecherche.innerText = `${monuments.length > 0 ? monuments.length : "Aucun"} résultat${monuments.length > 1 ? "s" : ""} pour "${researchTerm}" en ${timespan} ms`;
        })
        .catch(error => {
            console.error("Error : ", error);
        });
}


// Hydrate the page or prepare the hydration
if (document.readyState === "complete") {
    hydratePage();
} else {
    window.addEventListener("load", hydratePage);
}