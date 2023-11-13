/**
 * @file barreRecherche.js
 * Script JS pour la barre de recherche
 * Redirige l'utilisateur vers la page de résultats
 * Le texte de la recherche est passé en paramètre de l'URL
 */

/**
 * Entrée contenant le texte de la recherche
 * @type {HTMLInputElement}
 */
const champRecherche = document.getElementById('searchInput');
/**
 * Bouton de recherche
 * @type {HTMLButtonElement}
 */
const boutonRecherche = document.getElementById('searchButton');

function rechercherMonuments(){
    const texte = champRecherche.value;
    if (texte) {
        let goal = window.location.href.split("/");
        goal.pop()
        goal.push("resultats.html?recherche=" + texte.replace(/ /g, "_"))
        window.location.href = goal.join("/");
    }
}

// Si l'utilisateur appuie sur la touche "Entrée" dans le champ de recherche, on lance la recherche
champRecherche.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        rechercherMonuments();
    }
});

// Si l'utilisateur clique sur le bouton de recherche, on lance la recherche
boutonRecherche.addEventListener("click", rechercherMonuments);