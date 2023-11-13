
// Get a random monument to initialize the page
// Define the SPARQL query with the user input

function randomMonument() {
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
        OFFSET ${Math.floor(Math.random() * 1000)}`;

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

document.getElementById("searchButton").addEventListener("click", searchMonument); 
document.getElementById("hasard").addEventListener("click", randomMonument); 
randomMonument();