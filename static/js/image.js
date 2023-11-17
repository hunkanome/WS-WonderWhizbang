/**
 * Called when an image loading failed. Load the default image instead.
 * 
 * @param {Event} event 
 */
function loadDefaultImage(event) {
    event.target.src = "static/img/unesco.png";
    event.target.onerror = null;
}

/**
 * Called when an image loading failed. Try changing the extension case.
 * 
 * @param {Event} event 
 */
function tryFixImageUrl(event) {
    const image = event.target;
    // Erreur courante : l'extension de l'image est en minuscule alors que sur wikimedia, elle est en majuscule.
    // On règle ce problème en remplaçant l'extension par une version en majuscule, si l'image n'est pas trouvée.
    const newUrl = image.src.replace("jpg", "JPG").replace("png", "PNG").replace("jpeg", "JPEG").replace("gif", "GIF");
    image.src = newUrl;
    image.removeEventListener("error", tryFixImageUrl);

    // si cela ne marche toujours pas, on met l'image "UNESCO" par défaut
    image.addEventListener("error", loadDefaultImage);
}


/**
 * Load an image from a link and place it in an image element.
 * 
 * If the image is not loaded, a default image is placed instead.
 * 
 * @param {HTMLImageElement} imageElement the image element where to place the image
 * @param {string} imageLink the link to the image
 * @param {Function} onload the callbacks to call when the image is loaded
 * 
 * @example
 * loadImage(imageElement, imageLink, () => console.log("Image loaded"));
 */
function loadImage(imageElement, imageLink, onload = null) {
    if (!imageLink) {
        loadDefaultImage({ target: imageElement });
        return;
    }
    imageElement.src = imageLink;

    if (onload) {
        imageElement.addEventListener("load", onload);
    }

    imageElement.addEventListener("error", tryFixImageUrl);
}