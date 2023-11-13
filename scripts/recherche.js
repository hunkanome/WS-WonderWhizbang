
// Get a random monument to initialize the page
// Define the SPARQL query with the user input
var query = `
            PREFIX dbo: <http://dbpedia.org/ontology/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            SELECT ?monumentLabel ?picture ?desc WHERE {
            ?monument a dbo:WorldHeritageSite .
            ?monument rdfs:label ?monumentLabel .
            ?monument dbo:abstract ?desc .
            ?monument foaf:depiction ?picture .
            FILTER (lang(?monumentLabel) = "fr")
            FILTER (lang(?desc) = "fr") 
            }
            LIMIT 1
            OFFSET ${Math.floor(Math.random() * 1000)}
        `;
//Display in console the query
console.log(query);
// Send the query to the SPARQL endpoint
requestDBpedia(query)
    .then(data => {
        loadMonument(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });

// Get a monument based on user input
function searchMonument() {
    // Get the user input from the search bar
    let userInput = document.getElementById('searchInput').value;
    // Define the SPARQL query with the user input
    var query = `
                PREFIX dbo: <http://dbpedia.org/ontology/>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

                SELECT ?monumentLabel ?picture ?desc WHERE {
                ?monument a dbo:WorldHeritageSite .
                ?monument rdfs:label ?monumentLabel .
                ?monument dbo:abstract ?desc .
                ?monument foaf:depiction ?picture .
                FILTER (lang(?monumentLabel) = "fr")
                FILTER (lang(?desc) = "fr") 
                FILTER regex(?monumentLabel, "${userInput}", "i")
                }
                LIMIT 1
                #OFFSET ${Math.floor(Math.random() * 1000)}
            `;
    //Display in console the query
    console.log(query);
    // Send the query to the SPARQL endpoint
    requestDBpedia(query)
        .then(data => {
            loadMonument(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function loadMonument(data) {
    data = formatResult(data);
    var monument = data[0];
    var monumentName = monument.monumentLabel.value;
    var picture = data[0].picture.value;

    var img = document.getElementById("picture")
    img.src = picture;
    document.getElementById("title").innerHTML = monumentName;
    document.getElementById("description").innerHTML = data[0].desc.value;
    var blocDetail = document.getElementById("bloc-detail");
    
    img.addEventListener("load", (event) => {
        if (img.clientWidth > img.clientHeight) {
            blocDetail.className = "d-flex horizontal";
            console.log("horizontal");
        } else {
            blocDetail.className = "d-flex vertical";
            console.log("vertical");
        }
    });
}

document.getElementById("searchButton").addEventListener("click", searchMonument); 