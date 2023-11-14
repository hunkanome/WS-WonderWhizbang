
/**
 * Get the number of World Heritage Sites  subjects in DBPedia
 * 
 * @returns {Promise<int|null>} count
 */
async function getMonumentCount() {
    const query = `
        SELECT (count(?site) as ?count) WHERE {
            ?site a dbo:WorldHeritageSite;
                rdfs:label ?label.
            FILTER (lang(?label) = "fr")
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

/**
 * Search all the monuments in a country
 * 
 * @param {string} countryUri
 * @returns {array} monuments
 * 
 */
async function getMonumentsByCountry(countryUri) {
    const query = `
        SELECT ?uri ?label ?abstract ?thumbnail WHERE {
            ?uri dbp:location <${countryUri}>;
                a dbo:WorldHeritageSite;
                rdfs:label ?label.
            OPTIONAL {?uri dbo:abstract ?abstract}.
            OPTIONAL {?uri dbo:thumbnail ?thumbnail}.
         
            FILTER (lang(?abstract) = "fr")
            FILTER (lang(?label) = "fr")
        } ORDER BY ?uri
    `;

    const result = await requestDBpedia(query)
        .then(data => {
            return formatMonuments(data);
        })
        .catch(error => {
            console.error('Error:', error);
            return [];
        });

    return result;
}

/**
 * Retrieve a random monument from DBpedia
 * 
 * @returns {object|null} monument
 */
async function getRandomMonument() {
    const count = await getMonumentCount();
    const offset = Math.floor(Math.random() * count);
    const query = `
        SELECT ?uri ?label ?abstract ?thumbnail WHERE {
            ?uri a dbo:WorldHeritageSite;
                rdfs:label ?label.
            OPTIONAL {?uri dbo:abstract ?abstract}.
            OPTIONAL {?uri dbo:thumbnail ?thumbnail}.
         
            FILTER (lang(?abstract) = "fr")
            FILTER (lang(?label) = "fr")
        } ORDER BY ?uri
        LIMIT 1
        OFFSET ${offset}
    `;

    const result = await requestDBpedia(query)
        .then(data => {
            return formatMonument(data);
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });

    return result;
}


// Get a monument based on user input
function searchMonument() {
    // Get the user input from the search bar
    let userInput = document.getElementById('searchInput').value;
    // Define the SPARQL query with the user input
    var query = `
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

