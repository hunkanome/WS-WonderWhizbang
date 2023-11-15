/**
 * Create a new card element for a monument and return it
 * 
 * @param {object} monument the monument to add to the page
 * @returns {HTMLElement} the card element
 */
function createCard(monument) {
    const colElement = document.createElement("div");
    colElement.className = "col";

    const cardElement = document.createElement("div");
    cardElement.className = "card shadow-sm";
    colElement.appendChild(cardElement);

    const imageElement = document.createElement("img");
    imageElement.className = "card-img-top";
    let imageSrc = monument.thumbnail;
    if (imageSrc === undefined || imageSrc === null) {
        if (monument.pictures && monument.pictures.length > 0) {
            imageSrc = monument.pictures[0];
        } else {
            imageSrc = "static/img/unesco.png";
        }
    }
    // TODO : en cas d'erreur au chargement (onload), mettre l'image par défaut UNESCO
    imageElement.src = imageSrc;
    imageElement.alt = monument.label;
    cardElement.appendChild(imageElement);

    const cardBodyElement = document.createElement("div");
    cardBodyElement.className = "card-body";
    cardElement.appendChild(cardBodyElement);

    const cardTitleElement = document.createElement("h5");
    cardTitleElement.className = "card-title";
    cardTitleElement.innerText = monument.label;
    cardBodyElement.appendChild(cardTitleElement);

    const cardDescriptionElement = document.createElement("p");
    cardDescriptionElement.className = "card-text";
    cardDescriptionElement.innerText = monument.abstract;
    cardBodyElement.appendChild(cardDescriptionElement);

    const contentPageUrl = `contenu.html?monument=${encodeURIComponent(monument.uri)}`;

    const cardLinkElement = document.createElement("a");
    cardLinkElement.className = "stretched-link";
    cardLinkElement.href = contentPageUrl;
    cardElement.appendChild(cardLinkElement);

    return colElement;
}