/**
 * Queries the Sparql endpoint of Europeana and returns the results
 * 
 * @param {string} query 
 * @returns 
 * 
 * @example
 * requestSparql('select distinct ?Concept where {[] a ?Concept} LIMIT 1')
 *    .then(data => {
 *       console.log(data);
 *   });
 */
async function requestSparql(query) {
    const url = new URL('https://sparql.europeana.eu/');
    url.searchParams.append('default-graph-uri', 'http://data.europeana.eu/');
    url.searchParams.append('format', 'application/sparql-results+json');
    url.searchParams.append('query', query);

    const response = await fetch(url);
    const data = await response.json();
    return data;
}
