/**
 * Event listener for resizing the image when loaded
 * 
 * @param {Event} event 
 */
function resizeImage(event) {
    const image = event.target;
    const description = document.getElementById("description");  
    
    image.style.display = "";
    if (image.src.toLowerCase().includes("static/img/unesco.png")) {
        description.parentNode.className = "col-12";
        image.parentNode.className = "d-none";
    } else if (image.clientWidth > image.clientHeight) {
        description.parentNode.className = "col-12 col-md-6";
        image.parentNode.className = "col-12 col-md-6";
    } else {
        description.parentNode.className = "col-12 col-sm-6 col-md-9";
        image.parentNode.className = "col-12 col-sm-6 col-md-3";
    }
}

/**
 * Display the choosen random monument in the page
 * 
 * @param {object} monument 
 */
function displayRandomMonument(monument) {
    console.debug(monument);

    const image = document.getElementById("picture");
    loadImage(image, monument.thumbnail, resizeImage);

    const title = document.getElementById("title");
    title.innerText = monument.label;

    const articleLink = document.getElementById("article-link");
    articleLink.href = `contenu.html?monument=${monument.uri}`;

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