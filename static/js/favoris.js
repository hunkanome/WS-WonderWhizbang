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
 * Charge les favoris et envoie une requête SPARQL à DBpedia pour obtenir les informations des monuments
 */
resultContainer.innerHTML = "";
let favorites = JSON.parse(localStorage.getItem("favorites"));
if (favorites) {
    favorites.forEach(element => {
        let query = `PREFIX dbo: <http://dbpedia.org/ontology/>
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

                    SELECT ?monumentLabel ?picture ?desc WHERE {
                    ?monument a dbo:WorldHeritageSite .
                    ?monument rdfs:label ?monumentLabel .
                    ?monument dbo:abstract ?desc .
                    ?monument foaf:depiction ?picture .
                    FILTER (lang(?monumentLabel) = "fr")
                    FILTER (lang(?desc) = "fr") 
                    FILTER regex(?monumentLabel, "${element}", "i")
                    }`;
        requestDBpedia(query)
            .then(data => {
                console.log(data);
                let k = formatResult(data);
                k.forEach( element => {
                    resultContainer.innerHTML += createCard(element.picture[0], element.monumentLabel.value, element.desc.value).outerHTML;
                })
            })
            .catch(error => {
                researchStats.innerHTML = "Une erreur est survenue : " + error;
                console.error('Error:', error);
            });
    });s
} else {
    console.log("Aucun favori enregistré");
    messageField.innerHTML = "Aucun favori enregistré";
}