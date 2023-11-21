
/**
 * Compte le nombre de tentatives
 * @type {number}
 */
let nbTentatives = 0;

/**
 * 
 */
let isAlreadyWin = false;

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

function insertHiddenText(balise, texte) {
    const nonAlphaNumericCharacters = [".", ",", ";", ":", "!", "?", "(", ")", "[", "]", "{", "}", "«", "»", "“", "”", "'", "`", "-", "_", ":"]
    nonAlphaNumericCharacters.forEach(character => {
        texte = texte.replaceAll(character, ` ${character} `);
    });
    texte = texte.replaceAll("  ", " ");
    let texteSepare = texte.split(" ");
    texteSepare.forEach(word => {
        if (word.length > 0) {
            let mot = document.createElement('span');
            // if word not in nonAlphaNumericCharacters
            mot.className = "me-1 mb-1 text-dark";
            if (!nonAlphaNumericCharacters.includes(word)){
                // Replace the word by the same number of underscores
                mot.innerText = "_".repeat(word.length);
                mot.className += " bg-dark badge rounded";
                mot.setAttribute("reponse", word);
            } else {
                mot.className += " d-inline";
                mot.innerText = word;
            }
            balise.appendChild(mot);
        }
    });
}

function displayRandomHiddenMonument(monument) {
    const image = document.getElementById("picture");
    loadImage(image, monument.thumbnail, resizeImage);

    const title = document.getElementById("title");
    title.innerHTML = "";

    const articleLink = document.getElementById("article-link");
    articleLink.href = `contenu.html?monument=${monument.uri}`;

    const description = document.getElementById("description");
    description.innerHTML = "";

    /**
     * @type {Array<string>}
     */
    insertHiddenText(title, monument.label);
    insertHiddenText(description, monument.abstract);
    title.className += "d-flex flex-wrap";

    if (monument.year) {
        year.innerHTML = monument.year;
    } else {
        year.innerHTML = "Année non renseignée";
    }

    let locationContainer = document.getElementById('location');
    // Remove the country link from previous monument
    locationContainer.innerHTML = "";
    if (monument.country && monument.country != "" && monument.country != "World") {
        let locations = monument.country.split("#");
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
function changeRandomHiddenMonument() {
    getRandomMonument()
        .then(data => {
            nbTentatives = 0;
            isAlreadyWin = false;
            document.getElementById('liveAlertPlaceholder').innerHTML = "";
            displayRandomHiddenMonument(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Une erreur est survenue lors de la récupération du monument aléatoire");
        });
}

/**
 * @description Fonction qui donne la distance de Damerau-Levenshtein entre deux chaines de caractères passée en entrée
 * @param {string} chaine1
 * @param {string} chaine2
 * @returns {number} La distance entre la chaîne une et deux
 * @see {@link https://fr.wikipedia.org/wiki/Distance_de_Damerau-Levenshtein}
 */
function distanceDamerauLevenshtein(chaine1, chaine2) {
    let distance = 0;
    let d = [];
    for (let i = 0; i <= chaine1.length; i++) {
        d[i] = [];
        d[i][0] = i;
    }
    for (let j = 0; j <= chaine2.length; j++) {
        d[0][j] = j;
    }
    for (let i = 1; i <= chaine1.length; i++) {
        for (let j = 1; j <= chaine2.length; j++) {
            distance = chaine1[i - 1] === chaine2[j - 1] ? 0 : 1;

            d[i][j] = Math.min(
                d[i - 1][j] + 1, 
                d[i][j - 1] + 1, 
                d[i - 1][j - 1] + distance
            );
            if (i > 1 && j > 1 && chaine1[i - 1] === chaine2[j - 2] && chaine1[i - 2] === chaine2[j - 1])
                d[i][j] = Math.min(
                    d[i][j], 
                    d[i - 2][j - 2] + distance
                );
        }
    }
    return d[chaine1.length][chaine2.length];
};

/**
 * Fonction qui change la classe d'un élément en fonction de la distance de Damerau-Levenshtein entre la réponse et le texte de l'élément
 * @param {HTMLElement} element
 * @param {string} textInput
 */
function changerClasseElement(element, textInput){
    const reponse = element.getAttribute("reponse");
    // If the element has already been found make it look like normal text
    if (element.innerText == reponse){
        element.className = "text-dark d-inline me-1 mb-1";
        element.removeAttribute("reponse");
        return;
    }
    // Reset text color
    if (element.className.includes("warning"))
        element.className = element.className.replaceAll("text-warning", "text-white");
    else if (element.className.includes("danger"))
        element.className = element.className.replaceAll("text-danger", "text-white");

    const distance = distanceDamerauLevenshtein(reponse.toLocaleLowerCase(), textInput.toLocaleLowerCase());
    const distanceOld = distanceDamerauLevenshtein(element.getAttribute("reponse"), element.innerText);

    if ((distance <= distanceOld || element.innerText.includes("_")) && distance <= 2){
        element.innerText = distance == 0 ? reponse : textInput;
        switch (distance) {
            case 0:
                element.className = element.className = "text-white bg-success badge rounded me-1 mb-1";
                break;
            case 1:
                element.className = element.className.replaceAll("text-dark", "text-danger").replaceAll("text-white", "text-danger");
                break;
            case 2:
                element.className = element.className.replaceAll("text-dark", "text-warning").replaceAll("text-white", "text-warning");
                break;
        }
    }
}

function changeClassChildNodes(parentElement, textInput){
    Array.from(parentElement.childNodes)
        .filter(elem => { return elem.hasAttribute("reponse") })
        .forEach(element => { changerClasseElement(element, textInput); });
}

function checkWin() {
    let win = Array.from(title.childNodes).every(element => {
        return !element.className.includes("bg-dark");
    });
    if (!win) return;
    isAlreadyWin = true;
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
    const alert = document.createElement('div');
    alert.className = "alert alert-success alert-dismissible fade show";
    alert.setAttribute("role", "alert");
    alert.innerText = `Vous avez gagné en ${nbTentatives} tentatives !`;	
    alertPlaceholder.appendChild(alert);
}

function uncoverWords() {
    nbTentatives++;
    /**
     * @type {string}
     */
    let word = wordInput.value;
    wordInput.value = "";
    word = word.trim();
    if (word.length === 0) return;
    changeClassChildNodes(title, word);
    changeClassChildNodes(description, word);
    if (!isAlreadyWin) checkWin();
}

/**
 * Hydrate the page with the statistics and a random monument
 * Also set the event listeners
 * 
 * @returns {void}
 */
function hydratePage() {
    changeRandomHiddenMonument();

    const randomButton = document.getElementById("random-btn");
    randomButton.addEventListener("click", changeRandomHiddenMonument);
    wordInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") uncoverWords();
    });
}

// Hydrate the page or prepare the hydration
if (document.readyState === "complete") {
    hydratePage();
} else {
    window.addEventListener("load", hydratePage);
}