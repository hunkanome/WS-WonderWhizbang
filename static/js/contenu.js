/**
 * Envoie une requête SPARQL à DBpedia pour récupérer les informations d'un monument
 * Le nom de la page recherchée est passé dans un paramètre de l'url nommé "monumentName"
 * par exemple ".../monument.html?monumentName=Cappadoce"
 * Note : Si le nom contient plusieurs mots séparés par des espaces if faut les remplacer par des tirets du bas / tirets du 8 / underscores
 */

/**
 * Monument
 * @type {JSON}
 */
let monument;

/**
 * Remove the image from the carousel if the image can't be loaded
 * @param {Event} event 
 */
function carouselImageLoadError(event) {
    event.target.parentNode.remove();
}

/**
 * Affiche les informations d'un monument sur la page
 * @param {JSON} data 
 */
function loadMonument(monument) {
    console.debug(monument);
    const imageElement = document.getElementById("picture");
    loadImage(imageElement, monument.thumbnail, (_) => {
        const blocDetail = document.getElementById("bloc-detail");
        if (imageElement.clientWidth > imageElement.clientHeight) {
            blocDetail.className = "row horizontal";
            imageElement.parentNode.className = "col-6 ps-3 pt-3";
        } else {
            blocDetail.className = "row vertical";
            imageElement.parentNode.className = "col-3 ps-3 pt-3";
        }
    });

    const titreElement = document.getElementById("title");
    titreElement.innerHTML = monument.label;

    const descriptionElement = document.getElementById("description");
    descriptionElement.innerHTML = monument.abstract;
    year = monument.year ? monument.year : "Année non renseignée";

    const locationContainer = document.getElementById('location');
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
        const iconElement = document.getElementById('wikiLink');
        iconElement.href = monument.wikiPage;
    }

    if (monument.pictures?.length > 0) {
        const conteneurCarousel = document.getElementById("conteneurCarousel");
        const carousel = createCarousel(monument.pictures)
        conteneurCarousel.appendChild(carousel);
    }
    // Ajoute le coeur vide/plein en fonction de si le monument est dans les favoris ou non
    let favorites = localStorage.getItem("favorites");
    favorites = favorites ? JSON.parse(favorites) : [];
    coeurSurvol();

    if (favorites.includes(monument.uri))
        coeur.className = "bi bi-heart-fill mb-0";

    if (monument.position?.latitude && monument.position.longitude)
        createMap(monument);

    const boutonFavoris = document.getElementById('btnAddFavorite');
    boutonFavoris.addEventListener("click", addOrDeleteFavorite);
}

/**
 * 
 * @param {Array<string>} pictures Tableau contenant les liens des images
 * @returns {HTMLElement} Le carousel avec les images
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
    const carouselInner = document.createElement("div");
    carouselInner.className = "carousel-inner";

    // Rempmlissage du carousel avec les images
    let active = true;
    pictures.forEach(image => {
        /**
         * Item du carousel
         * @type {HTMLDivElement}
         */
        const carouselItem = document.createElement("div");
        carouselItem.className = "carousel-item";
        if (active) {
            carouselItem.className += " active";
            active = false;
        }

        /**
         * Image du carousel
         * @type {HTMLImageElement}
         */
        const imageElement = document.createElement("img");
        imageElement.src = image;
        imageElement.className = "d-block";
        imageElement.addEventListener("error", carouselImageLoadError);

        carouselItem.appendChild(imageElement);
        carouselInner.appendChild(carouselItem);
    });

    carousel.appendChild(carouselInner);

    // Ajout des boutons du carousel
    const prevButton = document.createElement("button");
    prevButton.className = "carousel-control-prev";
    prevButton.type = "button";
    prevButton.dataset.bsTarget = "#carouselImages";
    prevButton.dataset.bsSlide = "prev";

    const prevIcon = document.createElement("span");
    prevIcon.className = "carousel-control-prev-icon";
    prevIcon.setAttribute("aria-hidden", "true");

    const prevText = document.createElement("span");
    prevText.className = "visually-hidden";
    prevText.innerText = "Previous";

    prevButton.appendChild(prevIcon);
    prevButton.appendChild(prevText);

    const nextButton = document.createElement("button");
    nextButton.className = "carousel-control-next";
    nextButton.type = "button";
    nextButton.dataset.bsTarget = "#carouselImages";
    nextButton.dataset.bsSlide = "next";

    const nextIcon = document.createElement("span");
    nextIcon.className = "carousel-control-next-icon";
    nextIcon.setAttribute("aria-hidden", "true");

    const nextText = document.createElement("span");
    nextText.className = "visually-hidden";
    nextText.innerText = "Next";

    nextButton.appendChild(nextIcon);
    nextButton.appendChild(nextText);

    carousel.appendChild(prevButton);
    carousel.appendChild(nextButton);
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
        coeur.className = "bi bi-heart-fill mb-0";
        texteToast.innerText = "Monument supprimé des favoris !";
        toast.show();
    } else { // Sinon on l'ajoute
        favorites.push(monument.uri);
        // Trier les favoris par ordre alphabétique
        favorites.sort();
        coeur.className = "bi bi-heartbreak-fill mb-0";
        texteToast.innerText = "Monument ajouté aux favoris !";
        toast.show();
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function coeurSurvol() {
    let btnAddFavorite = document.getElementById("btnAddFavorite");
    btnAddFavorite.addEventListener("mouseenter", () => {
        if (coeur.className.indexOf("bi-heart-fill") != -1)
            coeur.classList.replace("bi-heart-fill", "bi-heartbreak-fill");
        else
            coeur.classList.replace("bi-heart", "bi-heart-fill");
    });
    btnAddFavorite.addEventListener("mouseleave", () => {
        if (coeur.className.indexOf("bi-heartbreak-fill") != -1)
            coeur.classList.replace("bi-heartbreak-fill", "bi-heart-fill");
        else
            coeur.classList.replace("bi-heart-fill", "bi-heart");
    });
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

}


// Hydrate the page or prepare the hydration
if (document.readyState === "complete") {
    hydratePage();
} else {
    window.addEventListener("load", hydratePage);
}