function loadMonument(data) {
    document.getElementById("duck").style.display = "";

    data = formatResult(data);
    var monument = data[0];
    var monumentName = monument.monumentLabel.value;
    var picture = data[0].picture.value;

    var img = document.getElementById("picture");
    img.src = picture;
    var titre = document.getElementById("title");
    titre.innerHTML = monumentName;
    document.getElementById("description").innerHTML = data[0].desc.value;
    var blocDetail = document.getElementById("bloc-detail");

    img.addEventListener("load", (event) => {
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
    });
}