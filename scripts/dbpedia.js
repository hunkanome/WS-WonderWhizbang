/**
 * Queries the Sparql endpoint of DBpedia and returns the results
 * @param {string} query 
 * @returns 
 * 
 * @example
 * requestDBpedia('select distinct ?Concept where {[] a ?Concept} LIMIT 1')
 *    .then(data => {
 *       console.log(data);
 *   });
 * 
 *  */

async function requestDBpedia(query) {
    const url = new URL('https://dbpedia.org/sparql');
    url.searchParams.append('default-graph-uri', 'http://dbpedia.org');
    url.searchParams.append('format', 'application/sparql-results+json');
    url.searchParams.append('query', query);

    const response = await fetch(url);
    const data = await response.json();
    return data;
}