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

    // if the data is bigger than 5Mo, don't cache it
    if (sizeOfObject(data) > 5 * 1024 * 1024) {
        console.log('data too big for caching');
    } else {
        const cacheData = {
            timestamp: Date.now(),
            content: data
        };
        try {
            localStorage.setItem(query, JSON.stringify(cacheData));
        } catch (error) {
            console.error('local storage full, emptying it');
            cleanCache();
        }
    }

    return data;
}

/**
 * Calculate the size of an object in bytes
 * 
 * Code from https://stackoverflow.com/a/11900218/18898936
 * 
 * @param {object} object 
 * @returns {number} size in bytes
 */
function sizeOfObject(object) {

    var objectList = [];
    var stack = [object];
    var bytes = 0;

    while (stack.length) {
        var value = stack.pop();

        if (typeof value === 'boolean') {
            bytes += 4;
        }
        else if (typeof value === 'string') {
            bytes += value.length * 2;
        }
        else if (typeof value === 'number') {
            bytes += 8;
        }
        else if
            (
            typeof value === 'object'
            && objectList.indexOf(value) === -1
        ) {
            objectList.push(value);

            for (var i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}

/**
 * Clean the cache of the local storage.
 * 
 * All the data with a timestamp older than the cache duration is removed.
 */
function cleanCache() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key in ['favorites']) {
            continue;
        }

        const value = localStorage.getItem(key);
        const data = JSON.parse(value);
        if (data.timestamp < Date.now() - cacheDuration) {
            console.log('removing', key);
            localStorage.removeItem(key);
        }
    }
}