function formatResult(data) {
    return data.results.bindings;
}

/**
 * Retrieve the value of the property if it exists
 * 
 * @param {object} data a field of a SPARQL query result
 * @returns {string|null} value
 * 
 */
function getValue(data) {
    if (data === undefined || data === null || data.value === undefined || data.value === null) {
        return null;
    }
    return data.value;
}

/**
 * Retrieve the float value of the property if it exists
 * 
 * @param {object} data a field of a SPARQL query result
 * @returns {float|null} value
 */
function getFloatValue(data) {
    const value = getValue(data);
    if (value !== null) {
        return parseFloat(value);
    }
    return null;
}

/**
 * Retrieve the values of the property if it exists
 * 
 * @param {object} data a SPARQL query result
 * @param {string} key the key to aggregate
 * @returns {array} values
 */
function getValuesArray(data, key) {
    const values = [];
    data.forEach(element => {
        const value = getValue(element[key]);
        if (value !== null) {
            values.push(value);
        }
    });
    if (values.length > 0) {
        // delete duplicates
        return [...new Set(values)];
    }
    return null;
}

/**
 * Format the result of a SPARQL query to a monument object
 * 
 * @param {object} queryResult the result of a SPARQL query
 * @returns {object|null} monument
 */
function formatMonument(queryResult) {
    const data = queryResult.results.bindings;
    const result = {};

    result.uri = getValue(data[0].uri);
    result.label = getValue(data[0].label);
    result.abstract = getValue(data[0].abstract);
    result.comment = getValue(data[0].comment);
    result.thumbnail = getValue(data[0].thumbnail);
    result.imagecaption = getValue(data[0].imagecaption);
    result.pictures = getValuesArray(data, 'picture');
    result.country = getValue(data[0].locmapin);

    result.position = {
        latitude: getFloatValue(data[0].latitude),
        longitude: getFloatValue(data[0].longitude)
    };
    if (result.position.latitude === null || result.position.longitude === null) {
        result.position = null;
    }

    result.homepage = getValue(data[0].homepage);
    if (result.homepage === null) {
        result.homepage = getValue(data[0].homepageAlt);
    }

    result.locations = getValuesArray(data, 'location');
    result.year = getValue(data[0].year);
    result.wikiPage = getValue(data[0].wikiPage);

    return result;
}


/**
 * Format the result of a SPARQL query to a list of monument objects
 * 
 * @param {string} queryResult 
 * @returns {array} monuments
 */
function formatMonuments(queryResult) {
    const data = queryResult.results.bindings;
    const result = [];

    // to avoid duplicate monuments, format each monument individually.
    const monuments = sliceMonumentsArray(data);
    monuments.forEach(element => {
        result.push(formatMonument({ results: { bindings: element } }));
    });
    
    return result;
}

/**
 * Slice the monuments array by separting each monument in a subarray.
 * 
 * For example, if the array contains 10 monuments on 30 lines, the result will be an array of 10 subarrays.
 * Each subarray will contain the data related to only one monument.
 * 
 * The monuments must be sorted by uri.
 * 
 * @param {array} monuments 
 * @returns {array<array>} monuments
 */
function sliceMonumentsArray(monuments) {
    const result = [];

    let monument = [];
    monuments.forEach(element => {
        if (monument.length === 0 || getValue(monument[0].uri) === getValue(element.uri)) {
            monument.push(element);
        } else {
            result.push(monument);
            monument = [element];
        }
    });
    if (monument.length > 0) {
        result.push(monument);
    }

    return result;
}

/**
 * Crée une carte du monde avec des points sur la localisation de chaque monument
 * @param {Array<JSON> | JSON} monuments Un monument ou un tableau de monuments 
 */
function createMap(monuments) {
    // If monuments is not an array, convert it to an array
    if (!Array.isArray(monuments)) {
        monuments = [monuments];
    }

    // Get geographical center of all monuments
    var totalLat = 0;
    var totalLong = 0;
    var count = 0;
    monuments.forEach(function(monument) {
        if (monument.position && monument.position.latitude && monument.position.longitude) {
            totalLat += monument.position.latitude;
            totalLong += monument.position.longitude;
            count++;
        }
    });
    var centerLat = totalLat / count;
    var centerLong = totalLong / count;

    var map = L.map('map').setView([centerLat, centerLong], 5);

    // Use a different tile provider for a different style
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add a scale
    L.control.scale().addTo(map);

    // Add the monuments to the map
    monuments.forEach(function(monument) {
        if (monument.position && monument.position.latitude && monument.position.longitude) {
            L.marker([monument.position.latitude, monument.position.longitude]).addTo(map)
            .bindPopup(monument.label);
        } else {
            console.log(`Pas de position pour le monument : ${monument.label}`);
        }
    });
}

/**
 * Fonction Handler qui essaye de résoudre certains problèmes d'images qui ne chargent pas
 * @param {Error} event 
 */
function imageLoadError(event){
    /**
     * Image qui n'a pas pue être chargée
     * @type {HTMLImageElement}
     */
    let img = event.target;
    // Erreur courante : l'extension de l'image est en minuscule alors que sur wikimedia, elle est en majuscule.
    // On règle ce problème en remplaçant l'extension par une version en majuscule, si l'image n'est pas trouvée.
    img.src = event.target.src.replace("jpg","JPG");    
    // si cela ne marche toujours pas, on met l'image "UNESCO" par défaut
    img.onerror = (evt) => {
        evt.target.src = "static/img/unesco.png";
        evt.target.onerror = null;
    };
}