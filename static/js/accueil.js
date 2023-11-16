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
        titre.parentNode.className = "col-6 ps-3 pe-0";
        image.parentNode.className = "col-6 ps-3 pt-3";
    } else {
        blocDetail.className = "row vertical";
        titre.parentNode.className = "col-9 ps-3 pe-0";
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

    const description = document.getElementById("description");
    description.innerText = monument.abstract;

    if(monument.year){
        year.innerHTML = monument.year;
    } else {
        year.innerHTML = "Année non renseignée";
    }
    
    // Remove the country link from previous monument
    let lienPay = document.getElementById('countryLink');
    lienPay.removeAttribute('href'); 
    if(monument.country && monument.country != "World"){
        country.innerHTML = monument.country;
        lienPay.setAttribute('href', "resultats.html");
        lienPay.addEventListener('click', function() {
            localStorage.setItem('countryName', monument.country);
        });
    } else {
        country.innerHTML = "Pays non renseignée";
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