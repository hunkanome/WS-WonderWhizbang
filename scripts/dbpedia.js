const cacheDuration = 1000 * 60 * 5; // 5 minutes

/**
 * Queries the Sparql endpoint of DBpedia and returns the results.
 * 
 * Automatically adds the prefixes of DBpedia to the query.
 * The prefixes come from https://dbpedia.org/snorql
 * 
 * To improve efficiency, the result is cached in the local storage.
 * 
 * @param {string} query 
 * @returns 
 * 
 * @example
 * requestDBpedia('select distinct ?Concept where {[] a ?Concept} LIMIT 1')
 *    .then(data => {
 *       console.log(data);
 *   });
 *  */
async function requestDBpedia(query) {
    const cachedResult = localStorage.getItem(query);
    if (cachedResult && Date.now() - JSON.parse(cachedResult).timestamp < cacheDuration) {
        console.log('cached result');
        return JSON.parse(cachedResult).content;
    }

    const fullQuery = `
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

        ${query}
    `;

    const url = new URL('https://dbpedia.org/sparql');
    url.searchParams.append('format', 'json')
    url.searchParams.append('query', fullQuery)

    const response = await fetch(url);
    const data = await response.json();

    const cacheData = {
        timestamp: Date.now(),
        content: data
    };
    localStorage.setItem(query, JSON.stringify(cacheData));

    return data;
}