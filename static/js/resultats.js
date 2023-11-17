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
 * Texte de la recherche contenu dans l'URL
 * @type {string}
 */
let texteRecherche = urlParameters.get('search');

/**
 * Type de recherche
 * @type {string}
 */
let texteType = urlParameters.get('type');

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
 * Envoie une requête SPARQL à DBpedia pour obtenir tous les monuments correspondant à la recherche
 */
function searchAllMonument() {
    resultContainer.innerHTML = "";
    // Get the user input from the search bar
    const userInput = champRecherche.value;
    // Define the SPARQL query with the user input
    let query = `
                SELECT ?monumentLabel ?thumbnail ?picture ?desc WHERE {
                ?monument a dbo:WorldHeritageSite .
                ?monument rdfs:label ?monumentLabel .
                ?monument dbo:abstract ?desc .
                ?monument foaf:depiction ?picture .
                ?monument dbo:thumbnail ?thumbnail .
                FILTER (lang(?monumentLabel) = "fr")
                FILTER (lang(?desc) = "fr") 
                FILTER regex(?monumentLabel, "${userInput}", "i")
                }
            `;

    const start = new Date().getTime();

    // Effectue la requête SPARQL à DBpedia
    requestDBpedia(query)
        .then(data => {
            statsRecherche.innerHTML = `Recherche de ${userInput} en cours`;
            let result = formatResult(data);
            console.log(result);
            result.forEach(element => {
                fetch(element.thumbnail[0], { method: "HEAD", mode: "no-cors" })
                    .then(response => {
                        if (response.ok) {
                            console.log('Thumbnail URL is valid');
                            resultContainer.innerHTML += createCard(element.thumbnail[0], element.monumentLabel.value, element.desc.value).outerHTML;
                        } else {
                            console.log('Thumbnail URL is INvalid for : ' + element.monumentLabel.value);
                            resultContainer.innerHTML += createCard(element.picture[0], element.monumentLabel.value, element.desc.value).outerHTML;
                        }
                    })
                    .catch(error => {
                        console.error('Error validating thumbnail URL:', error);
                    });
            })
            const timeTaken = new Date().getTime() - start;
            statsRecherche.innerHTML = `${result.length} résultat${result.length > 1 ? 's' : ''} pour "${userInput}" en ${timeTaken}ms`;
        })
        .catch(error => {
            statsRecherche.innerHTML = "Une erreur est survenue : " + error;
            console.error('Error:', error);
        });
}

/**
 * Hydrate the page with the statistics and a random monument
 * Also set the event listeners
 * 
 * @returns {void}
 */
function hydratePage() {
    const startTime = new Date().getTime();
    if (texteRecherche === null || texteRecherche === "") {
        statsRecherche.innerText = "Aucun terme de recherche n'a été spécifié";
        return;
    }
    getMonuments(texteType, texteRecherche)
        .then(monuments => {
            createMap(monuments);
            monuments.forEach(monument => {
                const card = createCard(monument);
                resultContainer.appendChild(card);
            })
            const timespan = new Date().getTime() - startTime;
            statsRecherche.innerText = `${monuments.length > 0 ? monuments.length : "Aucun"} résultat${monuments.length > 1 ? "s" : ""} pour "${texteRecherche}" en ${timespan} ms`;
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