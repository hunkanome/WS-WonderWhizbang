
/**
 * Get the number of World Heritage Sites  subjects in DBPedia
 * 
 * @returns {Promise<int|null>} count
 */
async function getMonumentCount() {
    const query = `
        PREFIX dbo: <http://dbpedia.org/ontology/>

        SELECT (count(?site) as ?count) WHERE {
            ?site a dbo:WorldHeritageSite .
        }
    `;

    const result = await requestDBpedia(query)
        .then(data => {
            return data.results.bindings[0].count.value;
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });

    return result;
}



/**
 * Get the monument data from the SPARQL endpoint
 * If the monument is not found, return null
 * 
 * @param {string} uri 
 * @returns {object|null} monument
 * 
 */
async function getMonumentByURI(uri) {
    const query = `
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX : <http://dbpedia.org/resource/>
        PREFIX dbpedia2: <http://dbpedia.org/property/>
        PREFIX dbpedia: <http://dbpedia.org/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

        SELECT * WHERE {
            <${uri}> a dbo:WorldHeritageSite;
                rdfs:label ?label.
            
            OPTIONAL {<${uri}> dbo:abstract ?abstract}.
            OPTIONAL {<${uri}> rdfs:comment ?comment}.
            OPTIONAL {<${uri}> dbo:thumbnail ?thumbnail}.
            OPTIONAL {<${uri}> dbp:imagecaption ?imagecaption}.
            OPTIONAL {<${uri}> foaf:depiction ?picture}.
            OPTIONAL {<${uri}> geo:lat ?latitude}.
            OPTIONAL {<${uri}> geo:long ?longitude}.
            OPTIONAL {<${uri}> foaf:homepage ?homepage}.
            OPTIONAL {<${uri}> dbp:website ?homepageAlt}.
            OPTIONAL {<${uri}> dbp:location ?location}.
            OPTIONAL {<${uri}> dbp:locmapin ?locationAlt}.
            OPTIONAL {<${uri}> foaf:isPrimaryTopicOf ?wikiPage}.
            OPTIONAL {<${uri}> dbp:year ?year}.
            
            
            FILTER (lang(?label) = "fr")
            FILTER (lang(?abstract) = "fr")
            FILTER (lang(?comment) = "fr")
            FILTER (lang(?imagecaption) = "fr")
        }
        `;

    const result = await requestDBpedia(query)
        .then(data => {
            if (data.results.bindings.length > 0) {
                return formatMonument(data);
            } else {
                return null;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });

    return result;
}



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

