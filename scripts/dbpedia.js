/**
 * Queries the Sparql endpoint of DBpedia and returns the results.
 * 
 * Automatically adds the prefixes of DBpedia to the query.
 * The prefixes come from https://dbpedia.org/snorql
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
    console.debug(query);

    query = `
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
    url.searchParams.append('query', query)

    const response = await fetch(url);
    const data = await response.json();
    return data;
}