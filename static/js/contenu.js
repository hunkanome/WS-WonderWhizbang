/**
 * Envoie une requête SPARQL à DBpedia pour récupérer les informations d'un monument
 * Le nom de la page recherchée est passé dans un paramètre de l'url nommé "monumentName"
 * par exemple ".../monument.html?monumentName=Cappadoce"
 * Note : Si le nom contient plusieurs mots séparés par des espaces if faut les remplacer par des tirets du bas / tirets du 8 / underscores
 */


/**
 * Entrée contenant le texte de la recherche
 * @type {HTMLInputElement}
 */
let searchInput = document.getElementById('searchInput');
/**
 * Container du result
 * @type {HTMLDivElement}
 */
let blocDetail = document.getElementById("bloc-detail");
/**
 * Image du monument
 * @type {HTMLImageElement}
 */
let img = document.getElementById("picture");
/**
 * Nom du monument
 * @type {HTMLHeadingElement}
 */
let titre = document.getElementById("title");
/**
 * Description du monument
 * @type {HTMLParagraphElement}
 */
let description = document.getElementById("description");
/**
 * Bouton de recherche
 * @type {HTMLButtonElement}
 */
const boutonFavorites = document.getElementById('btnAddFavorite');

/**
 * Parametres de l'url
 * @type {URLSearchParams}
 */
const urlParameters = new URLSearchParams(window.location.search);

/**
 * Nom du monument recherché
 * @type {string}
 */
let monumentName = urlParameters.get('monumentName');

if (monumentName) {
    monumentName = monumentName.replace(/_/g, " ");
    searchMonument();
} else {
    titre.innerHTML = "Aucun monument renseigné";
    titre.className = "bg-danger";
}

/**
 * Ajoute un article aux favoris quand on appuie sur le bouton addFavorite
 */
boutonFavorites.addEventListener("click", addFavorite);

/**
 * Envoie une requête SPARQL à DBpedia pour récupérer les informations d'un monument
 * Ensuite appelle une fonction pour afficher le monument
 */
function searchMonument() {
    // Define the SPARQL query with the user input
    var query = `
                SELECT ?monumentLabel ?picture ?desc WHERE {
                ?monument a dbo:WorldHeritageSite .
                ?monument rdfs:label ?monumentLabel .
                ?monument dbo:abstract ?desc .
                ?monument foaf:depiction ?picture .
                FILTER (lang(?monumentLabel) = "fr")
                FILTER (lang(?desc) = "fr") 
                FILTER regex(?monumentLabel, "${monumentName}", "i")
                }
                LIMIT 1
            `;
    console.log(query);
    // Send the query to the SPARQL endpoint
    requestDBpedia(query)
        .then(data => {
            loadMonument(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

/**
 * Affiche les informations d'un monument sur la page
 * @param {JSON} data 
 */
function loadMonument(data) {
    data = data.results.bindings;
    const monument = data[0];
    img.src = monument.picture.value;

    titre.innerHTML = monument.monumentLabel.value;
    description.innerHTML = monument.desc.value;

    img.addEventListener("load", (event) => {
        if (img.clientWidth > img.clientHeight) {
            blocDetail.className = "row horizontal";
            titre.parentNode.parentNode.className = "col-6 ps-3 pe-0";
            img.parentNode.className = "col-6 ps-3 pt-3";
        } else {
            blocDetail.className = "row vertical";
            titre.parentNode.parentNode.className = "col-9 ps-3 pe-0";
            img.parentNode.className = "col-3 ps-3 pt-3";
        }
    });
}

/**
 * Ajoute un article aux favoris quand on appuie sur le bouton addFavorite
 * 
 */
function addFavorite() {
    console.log("addFavorite");
    let favorites = localStorage.getItem("favorites");
    if (favorites) {
        favorites = JSON.parse(favorites);
    } else {
        favorites = [];
    }
    // Si le monument n'est pas déjà dans les favoris, on l'ajoute
    if (favorites.includes(monumentName)) {
        alert("Ce monument est déjà dans vos favoris !");
        return;
    } else {
        favorites.push(monumentName);
        alert("Monument ajouté aux favoris !");
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

/**
 * Supprime un article des favoris quand on appuie sur le bouton deleteFavorite
 * @param {string} name
 */
function deleteFavorite(name) {
    console.log("deleteFavorite");
    let favorites = localStorage.getItem("favorites");
    if (favorites) {
        favorites = JSON.parse(favorites);
    } else {
        favorites = [];
        return;
    }
    // Si le monument est dans les favoris, on le supprime
    if (favorites.includes(name)) {
        favorites.splice(favorites.indexOf(name), 1);
        alert("Monument supprimé des favoris !");
    } else {
        alert("Ce monument n'est pas dans vos favoris !");
        return;
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
}