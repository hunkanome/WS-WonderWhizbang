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
let resultContainer = document.getElementById("resultContainer");

/**
 * Élément contenant des statistiques sur la recherche
 */
let statsRecherche = document.getElementById("stats");

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
let texteRecherche = urlParameters.get('recherche');



if (texteRecherche) {
    texteRecherche = texteRecherche.replace(/_/g, " ");
    champRecherche.value = texteRecherche;
    searchAllMonument();
} else {
    console.log("Aucun texte de recherche renseigné");
}

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
        const lastIndex = result.length -1;
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
 * Prend des informations sur un monument et crée sa carte Bootstrap
 * @param {string} imgSrc le lien vers l'image du monument
 * @param {string} title le nom du monument
 * @param {string} description la description du monument
 * @returns {HTMLDivElement} la carte du monument
 */
function createCard(imgSrc, title, description) {
    /**
     * Colonne de la grille Bootstrap contenant la carte
     * @type {HTMLDivElement}
     */
    const col = document.createElement("div");
    col.className = "col";

    /**
     * Carte du monument
     * @type {HTMLDivElement}
     */
    const card = document.createElement("div");
    card.className = "card shadow-sm";

    /**
     * Image du monument
     * @type {HTMLImageElement}
     */
    let img = document.createElement("img");
    img.className = "card-img-top";
    img.src = imgSrc;
    img.alt = title;

    /**
     * Corps de la carte
     * @type {HTMLDivElement}
     */
    let cardBody = document.createElement("div");
    cardBody.className = "card-body";

    /**
     * Nom du monument
     * @type {HTMLHeadingElement}
     */
    let cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.innerHTML = title;

    /** 
     * Description du monument
     * @type {HTMLParagraphElement}
     */
    let cardText = document.createElement("p");
    cardText.className = "card-text";
    cardText.innerHTML = description;

    let goal = window.location.href.split("/");
    goal.pop()
    goal.push("contenu.html?monumentName=" + title.replace(/ /g, "_"));
    /**
     * URL de la page du monument
     * @type {string}
     */
    const monumentUrl = goal.join("/");

    /**
     * Lien vers la page du monument
     * @type {HTMLAnchorElement}
     */
    let cardLink = document.createElement("a");
    cardLink.className = "stretched-link";
    cardLink.target = "_blank";
    cardLink.href = monumentUrl;

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    card.appendChild(img);
    card.appendChild(cardBody);
    card.appendChild(cardLink);
    col.appendChild(card);

    return col;
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
                PREFIX dbo: <http://dbpedia.org/ontology/>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

                SELECT ?monumentLabel ?picture ?desc WHERE {
                ?monument a dbo:WorldHeritageSite .
                ?monument rdfs:label ?monumentLabel .
                ?monument dbo:abstract ?desc .
                ?monument foaf:depiction ?picture .
                FILTER (lang(?monumentLabel) = "fr")
                FILTER (lang(?desc) = "fr") 
                FILTER regex(?monumentLabel, "${userInput}", "i")
                }
            `;
    
    const start = new Date().getTime();
    
    // Effectue la requête SPARQL à DBpedia
    requestDBpedia(query)
        .then(data => {
            console.log(data);
            let k = formatResult(data);
            k.forEach( element => {
                resultContainer.innerHTML += createCard(element.picture[0], element.monumentLabel.value, element.desc.value).outerHTML;
            })
            const timeTaken = new Date().getTime() - start;
            statsRecherche.innerHTML = `${k.length} résultats pour "${userInput}" en ${timeTaken}ms`;
        })
        .catch(error => {
            researchStats.innerHTML = "Une erreur est survenue : " + error;
            console.error('Error:', error);
        });
}

// Si l'utilisateur clique sur le bouton de recherche, on lance la recherche
document.getElementById("searchButton").addEventListener("click", searchAllMonument);
// Si l'utilisateur appuie sur la touche "Entrée" dans le champ de recherche, on lance la recherche
champRecherche.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchAllMonument();
    }
});