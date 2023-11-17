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
 * Conteneur du carousel
 * @type {HTMLDivElement}
 */
let conteneurCarousel = document.getElementById("conteneurCarousel");
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
 * @type {JSON}
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
    console.debug(monument);
    img.src = "static/img/unesco.png";
    if (monument.pictures?.length > 0) {
        img.src = monument.pictures[0];
        img.onerror = imageLoadError;
    }

    titre.innerHTML = monument.label;
    description.innerHTML = monument.abstract;
    if (monument.year) {
        year.innerHTML = monument.year;
    } else {
        year.innerHTML = "Année non renseignée";
    }

    let locationContainer = document.getElementById('location');
    locationContainer.innerHTML = "";
    if (monument.country && monument.country != "" && monument.country != "World") {
        const locations = monument.country.split("#");
        locations.forEach(location => {
            let lienPay = document.createElement('a');
            lienPay.href = `resultats.html?search=${location}&type=Pays`;
            lienPay.innerText = location;
            lienPay.className = "badge rounded text-bg-dark me-1 text-decoration-none";
            locationContainer.appendChild(lienPay);
        });
    }

    if (monument.wikiPage) {
        let icon = document.getElementById('wikiLink');
        icon.href = monument.wikiPage;
    }

    if (monument.pictures?.length > 0)
        conteneurCarousel.appendChild(createCarousel(monument.pictures));

    /**
     * Ajoute le coeur vide/plein en fonction de si le monument est dans les favoris ou non
     */
    let favorites = localStorage.getItem("favorites");
    favorites = favorites ? JSON.parse(favorites) : [];

    if (favorites.includes(monument.uri))
        coeur.src = "static/img/heart-full.svg";

    if (monument.position?.latitude && monument.position.longitude)
        createMap(monument);

    img.addEventListener("load", (_) => {
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
 * 
 * @param {Array<string>} pictures Tableau contenant les liens des images
 * @returns {HTMLDivElement} Le carousel avec les images
 */
function createCarousel(pictures) {
    /**
     * Création du carousel
     * @type {HTMLDivElement}
     */
    const carousel = document.createElement("div");
    carousel.className = "carousel slide";
    carousel.id = "carouselImages";

    /**
     * Création du conteneur des images du carousel
     * @type {HTMLDivElement}
     */
    let carouselInner = document.createElement("div");
    carouselInner.className = "carousel-inner";

    // Rempmlissage du carousel avec les images
    let active = true;
    pictures.forEach(image => {

        /**
         * Item du carousel
         * @type {HTMLDivElement}
         */
        let carouselItem = document.createElement("div");
        carouselItem.className = "carousel-item";
        if (active) {
            carouselItem.className += " active";
            active = false;
        }

        /**
         * Image du carousel
         * @type {HTMLImageElement}
         */
        let img = document.createElement("img");
        img.src = image;
        img.className = "d-block";

        carouselItem.appendChild(img);
        carouselInner.appendChild(carouselItem);
    });

    carousel.appendChild(carouselInner);

    // Ajout des boutons du carousel
    carousel.innerHTML += `<button class="carousel-control-prev" type="button" data-bs-target="#carouselImages"
                                    data-bs-slide="prev">
                                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Previous</span>
                                </button>
                                <button class="carousel-control-next" type="button" data-bs-target="#carouselImages"
                                    data-bs-slide="next">
                                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Next</span>
                                </button>`;
    return carousel;
}

/** 
 * Ajoute un article aux favoris ou le supprime quand on appuie sur le bouton coeur
 */
function addOrDeleteFavorite() {
    let favorites = localStorage.getItem("favorites");
    favorites = favorites ? JSON.parse(favorites) : [];

    const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById("toast-favoris"));
    const texteToast = document.getElementById("texte-toast-favoris");

    // Si le monument est dans les favoris, on l'enlève
    if (favorites.includes(monument.uri)) {
        favorites.splice(favorites.indexOf(monument.uri), 1);
        coeur.src = "static/img/heart-empty.svg";
        texteToast.innerText = "Monument supprimé des favoris !";
        toast.show();
    } else { // Sinon on l'ajoute
        favorites.push(monument.uri);
        // Trier les favoris par ordre alphabétique
        favorites.sort();

        coeur.src = "static/img/heart-full.svg";

        texteToast.innerText = "Monument ajouté aux favoris !";
        toast.show();
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
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
        }).finally(() => {
            // Ajout de la fonction imageErrorHandler
            // Ne marche que quand toute les divs on été ajoutées dans la page HTML
            Array.prototype.slice.call(document.getElementsByTagName("img")).forEach(img => {
                img.addEventListener("error", imageLoadError);
            });
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