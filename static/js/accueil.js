/**
 * Event listener for resizing the image when loaded
 * 
 * @param {Event} event 
 */
function resizeImage(event) {
    const image = event.target;
    const blocDetail = document.getElementById("bloc-detail");
    const titre = document.getElementById("title");

    image.style.display = "";
    if (image.clientWidth > image.clientHeight) {
        blocDetail.className = "row horizontal";
        image.parentNode.className = "col-6 ps-3 pt-3";
    } else {
        blocDetail.className = "row vertical";
        image.parentNode.className = "col-3 ps-3 pt-3";
    }

    const loadingGif = document.getElementById("loading-gif");
    loadingGif.style.display = "none";
}

/**
 * Event listener for setting the default image when the image is not loaded
 * 
 * @param {Event} event 
 */
function loadDefaultImage(event) {
    const image = event.target;
    image.src = "static/img/unesco.png";
    image.style.display = "";

    const loadingGif = document.getElementById("loading-gif");
    loadingGif.style.display = "none";
}

/**
 * Display the choosen random monument in the page
 * 
 * @param {object} monument 
 */
function displayRandomMonument(monument) {
    console.debug(monument);
    const loadingGif = document.getElementById("loading-gif");
    loadingGif.style.display = "";

    const image = document.getElementById("picture");
    image.src = monument.thumbnail;
    image.style.display = "none";

    const title = document.getElementById("title");
    title.innerText = monument.label;
    title.href = `contenu.html?monument=${monument.uri}`;

    const description = document.getElementById("description");
    description.innerText = monument.abstract;

    if (monument.year) {
        year.innerHTML = monument.year;
    } else {
        year.innerHTML = "Année non renseignée";
    }

    let locationContainer = document.getElementById('location');
    // Remove the country link from previous monument
    locationContainer.innerHTML = "";
    if (monument.country && monument.country != "" && monument.country != "World") {
        locations = monument.country.split("#");
        locations.forEach(lieu => {
            let lienPay = document.createElement('a');
            lienPay.innerText = lieu;
            lienPay.className = "badge rounded text-bg-dark";
            lienPay.href = `resultats.html?search=${lieu}&type=Pays`;
            locationContainer.appendChild(lienPay);
        });
    }

    image.addEventListener("load", resizeImage);
    image.addEventListener("error", loadDefaultImage);
}

/**
 * Update the page with a random monument
 */
function changeRandomMonument() {
    getRandomMonument()
        .then(data => {
            displayRandomMonument(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Une erreur est survenue lors de la récupération du monument aléatoire");
        });
}

/**
 * Hydrate the page with the statistics and a random monument
 * Also set the event listeners
 * 
 * @returns {void}
 */
function hydratePage() {
    getMonumentCount().then(count => {
        const countElement = document.getElementById("monumentCount");
        countElement.innerText = count;
    });
    changeRandomMonument();

    const randomButton = document.getElementById("random-btn");
    randomButton.addEventListener("click", changeRandomMonument);
}

// Hydrate the page or prepare the hydration
if (document.readyState === "complete") {
    hydratePage();
} else {
    window.addEventListener("load", hydratePage);
}