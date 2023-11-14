function loadMonument(data) {
    data = formatResult(data);
    var monument = data[0];
    var monumentName = monument.monumentLabel.value;
    var picture = data[0].picture.value;

    document.getElementById("duck").style.display = "";
    var atw = new Audio("static/audio/aroundtheworld-long.mp3");

    var img = document.getElementById("picture");
    img.src = picture;
    img.style.display = "none";
    var titre = document.getElementById("title");
    titre.innerHTML = monumentName;
    document.getElementById("description").innerHTML = data[0].desc.value;
    var blocDetail = document.getElementById("bloc-detail");

    img.addEventListener("load", (event) => {
        img.style.display = "";
        if (img.clientWidth > img.clientHeight) {
            blocDetail.className = "row horizontal";
            titre.parentNode.className = "col-6 ps-3 pe-0";
            img.parentNode.className = "col-6 ps-3 pt-3";
        } else {
            blocDetail.className = "row vertical";
            titre.parentNode.className = "col-9 ps-3 pe-0";
            img.parentNode.className = "col-3 ps-3 pt-3";
        }
        document.getElementById("duck").style.display = "none";
        atw.pause()
    });

    img.addEventListener("error", (event) => {
        atw.volume = 0.1;
        atw.play();
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
        document.getElementById("monumentCount").innerText = count;
    });
    document.getElementById("searchButton").addEventListener("click", searchMonument);
    document.getElementById("hasard").addEventListener("click", randomMonument);
    randomMonument();
}

// Hydrate the page or prepare the hydration
if (document.readyState === "complete") {
    hydratePage();
} else {
    window.addEventListener("load", hydratePage);
}