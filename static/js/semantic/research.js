
/**
 * Récupère le nombre de monuments dans DBPedia
 * 
 * @returns {Promise<int|null>} count
 */
async function getMonumentCount() {
    const query = `
        SELECT (count(?site) as ?count) WHERE {
            ?site a dbo:WorldHeritageSite.
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
 * Récupère le nombre de monuments ayant un nom et une description en français dans DBPedia
 * 
 * @returns {Promise<int|null>} count
 */
async function getFrenchPageMonumentCount() {
    const query = `
        SELECT (count(?uri) as ?count) WHERE {
            ?uri a dbo:WorldHeritageSite;
                rdfs:label ?label.
            OPTIONAL {?uri dbo:abstract ?abstract}.
            FILTER (lang(?label) = "fr")
            FILTER (lang(?abstract) = "fr")
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
            OPTIONAL {<${uri}> dbo:thumbnail ?thumbnail}.
            OPTIONAL {<${uri}> dbp:imagecaption ?imagecaption}.
            OPTIONAL {<${uri}> foaf:depiction ?picture}.
            OPTIONAL {<${uri}> geo:lat ?latitude}.
            OPTIONAL {<${uri}> geo:long ?longitude}.
            OPTIONAL {<${uri}> dbp:location ?location}.
            OPTIONAL {<${uri}> dbp:locmapin ?locmapin}.
            OPTIONAL {<${uri}> foaf:isPrimaryTopicOf ?wikiPage}.
            OPTIONAL {<${uri}> dbp:year ?year}.
            
            
            FILTER (lang(?label) = "fr")
            FILTER (lang(?abstract) = "fr")
            FILTER (lang(?imagecaption) = "fr")
        }
        `;

    const result = await requestDBpedia(query)
        .then(data => {
            if (data.results.bindings.length > 0) {
                const monument = formatMonument(data);
                monument.uri = uri;
                return monument;
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

async function getLightMonumentByURI(uri) {
    const query = `
        SELECT * WHERE {
            <${uri}> a dbo:WorldHeritageSite;
                rdfs:label ?label.
            
            OPTIONAL {<${uri}> dbo:abstract ?abstract}.
            OPTIONAL {<${uri}> dbo:thumbnail ?thumbnail}.
            OPTIONAL {<${uri}> foaf:depiction ?picture}.
            OPTIONAL {<${uri}> geo:lat ?latitude}.
            OPTIONAL {<${uri}> geo:long ?longitude}.
            
            FILTER (lang(?label) = "fr")
            FILTER (lang(?abstract) = "fr")
        }
        `;

    const result = await requestDBpedia(query)
        .then(data => {
            if (data.results.bindings.length > 0) {
                const monument = formatMonument(data);
                monument.uri = uri;
                return monument;
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
 * Recherche tous les monuments d'un pays
 * @param {string} countryUri
 * @returns {Array.<JSON>} la liste des monuments
 * 
 */
async function getMonumentsByCountry(countryUri) {
    const query = `
        SELECT * WHERE {
            ?uri a dbo:WorldHeritageSite;
                rdfs:label ?label;
                dbp:locmapin ?locmapin.
            OPTIONAL {?uri dbo:abstract ?abstract}.
            OPTIONAL {?uri dbo:thumbnail ?thumbnail}.
            OPTIONAL {?uri foaf:depiction ?picture}.
            OPTIONAL {?uri geo:lat ?latitude}.
            OPTIONAL {?uri geo:long ?longitude}.
         
            FILTER (lang(?abstract) = "fr")
            FILTER (lang(?label) = "fr")
            FILTER regex(?locmapin, "${countryUri}", "i")
        } ORDER BY ?label
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
 * Recherche tous les monuments dont le nom français contient le terme recherché
 * @param {string} term the term to search
 * @returns {Array.<JSON>} la liste des monuments
 */
async function searchMonumentsByTerm(term) {
    const query = `
        SELECT * WHERE {
            ?uri a dbo:WorldHeritageSite;
                rdfs:label ?label.
            
            OPTIONAL {?uri dbo:abstract ?abstract}.
            OPTIONAL {?uri dbo:thumbnail ?thumbnail}.
            OPTIONAL {?uri foaf:depiction ?picture}.
            OPTIONAL {?uri geo:lat ?latitude}.
            OPTIONAL {?uri geo:long ?longitude}.

            FILTER (lang(?abstract) = "fr")
            FILTER (lang(?label) = "fr")
            FILTER regex(?label, "${term}", "i")
        } ORDER BY ?label
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
    const count = await getFrenchPageMonumentCount();
    const offset = Math.floor(Math.random() * count);
    const query = `
        SELECT * WHERE {
            ?uri a dbo:WorldHeritageSite;
                rdfs:label ?label.
            OPTIONAL {?uri dbo:abstract ?abstract}.
            OPTIONAL {?uri dbo:thumbnail ?thumbnail}.
            OPTIONAL {?uri dbp:locmapin ?locmapin}.
            OPTIONAL {?uri dbp:year ?year}.
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

/**
 * Retrive all the monuments with their geographical position
 * 
 * @returns {Array.<JSON>} monuments
 */
async function getAllMonumentsPosition() {
    const query = `
        SELECT ?uri ?latitude ?longitude ?thumbnail ?label WHERE {
            ?uri a dbo:WorldHeritageSite;
                rdfs:label ?label;
                geo:lat ?latitude;
                geo:long ?longitude.
            OPTIONAL {?uri dbo:thumbnail ?thumbnail}.
            OPTIONAL {?uri dbo:abstract ?abstract}.
            FILTER (lang(?abstract) = "fr")
            FILTER (lang(?label) = "fr")
        }
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
 * Retrive all the monuments part of the same whole as the given monument
 * 
 * @param {string} monumentUri 
 * @returns {Array.<JSON>} monuments
 */
async function getRelatedMonuments(monumentUri) {
    const query = `
        SELECT ?uri ?label ?abstract ?thumbnail WHERE {
            {
                <${monumentUri}> dbp:partOf ?whole.
                ?uri dbp:partOf ?whole;
                    rdfs:label ?label;
                    rdf:type dbo:WorldHeritageSite.
            
                OPTIONAL {?uri dbo:abstract ?abstract}.
                OPTIONAL {?uri dbo:thumbnail ?thumbnail}.
            
                FILTER (?uri != <${monumentUri}>)
                FILTER (lang(?label) = "fr")
                FILTER (lang(?abstract) = "fr")
            }
            UNION
            {
                <${monumentUri}> dbp:partOf ?uri.
                ?uri rdfs:label ?label;
                    rdf:type dbo:WorldHeritageSite.
            
                OPTIONAL {?uri dbo:abstract ?abstract}.
                OPTIONAL {?uri dbo:thumbnail ?thumbnail}.
            
                FILTER (?uri != <${monumentUri}>)
                FILTER (lang(?label) = "fr")
                FILTER (lang(?abstract) = "fr")
            }
            UNION
            {
                ?uri dbp:partOf <${monumentUri}>;
                    rdfs:label ?label;
                    rdf:type dbo:WorldHeritageSite.
            
                OPTIONAL {?uri dbo:abstract ?abstract}.
                OPTIONAL {?uri dbo:thumbnail ?thumbnail}.
            
                FILTER (?uri != <${monumentUri}>)
                FILTER (lang(?label) = "fr")
                FILTER (lang(?abstract) = "fr")
            }
        } ORDER BY ?label
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