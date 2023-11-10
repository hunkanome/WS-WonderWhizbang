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
    const url_base = 'https://dbpedia.org/sparql';

    url = url_base + '?format=json&query=' + encodeURIComponent(query)

    const response = await fetch(url);
    const data = await response.json();
    return data;
}