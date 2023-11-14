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
 * Logo coeur
 */
let coeur = document.getElementById("coeur");

/**
 * Monument
 */
let monument;


/**
 * Ajoute un article aux favoris quand on appuie sur le bouton addFavorite
 */
boutonFavorites.addEventListener("click", addOrDeleteFavorite);

/**
 * Affiche les informations d'un monument sur la page
 * @param {JSON} data 
 */
function loadMonument(monument) {
    img.src = monument.pictures[0];

    titre.innerHTML = monument.label;
    description.innerHTML = monument.abstract;

    /**
     * Ajoute le coeur vide/plein en fonction de si le monument est dans les favoris ou non
     */
    let favorites = localStorage.getItem("favorites");
    if (favorites) {
        favorites = JSON.parse(favorites);
    } else {
        favorites = [];
    }

    if (favorites.includes(monument.label)) {
        coeur.src = "static/img/heart-full.svg";
    }

    createMap([monument.position.latitude, monument.position.longitude], monument.label);

    img.addEventListener("load", (event) => {
        if (img.clientWidth > img.clientHeight) {
            blocDetail.className = "row horizontal";
            titre.parentNode.parentNode.parentNode.parentNode.className = "col-6 ps-3 pe-0";
            img.parentNode.className = "col-6 ps-3 pt-3";
        } else {
            blocDetail.className = "row vertical";
            titre.parentNode.parentNode.parentNode.parentNode.className = "col-9 ps-3 pe-0";
            img.parentNode.className = "col-3 ps-3 pt-3";
        }
    });
}

/** 
 * Ajoute un article aux favoris ou le supprime quand on appuie sur le bouton coeur
 */
function addOrDeleteFavorite() {
    let favorites = localStorage.getItem("favorites");
    if (favorites) {
        favorites = JSON.parse(favorites);
    } else {
        favorites = [];
    }

    const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById("toast-favoris"));
    const texteToast = document.getElementById("texte-toast-favoris");

    // Si le monument n'est pas déjà dans les favoris, on l'ajoute
    if (favorites.includes(monument.label)) {
        favorites.splice(favorites.indexOf(monument.label), 1);
        coeur.src = "static/img/heart-empty.svg";

        texteToast.innerText = "Monument supprimé des favoris !";
        toast.show();
    } else {
        favorites.push(monument.label);
        coeur.src = "static/img/heart-full.svg";

        texteToast.innerText = "Monument ajouté aux favoris !";
        toast.show();
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function createMap(coords, name) {
    var map = L.map('map').setView(coords, 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    let marker = L.marker(coords).addTo(map);
    marker.bindPopup(name).openPopup();
}


/**
 * Hydrate the page with the statistics and a random monument
 * Also set the event listeners
 * 
 * @returns {void}
 */
function hydratePage() {
    const params = new URLSearchParams(document.location.search);
    const monumentUri = params.get("monument");

    getMonumentByURI(monumentUri)
        .then(monumentJson => {
            monument = monumentJson;
            loadMonument(monumentJson);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // TODO : mettre à jour le contenu de la page
    // TODO : mettre à jour le bouton favoris
}


// Hydrate the page or prepare the hydration
if (document.readyState === "complete") {
    hydratePage();
} else {
    window.addEventListener("load", hydratePage);
}