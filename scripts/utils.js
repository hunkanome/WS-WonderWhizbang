function formatResult(data) {
    return data.results.bindings;
}

/**
 * Retrieve the value of the proerty if it exists
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
 * Retrieve the float value of the proerty if it exists
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
    result.pictures = [];
    data.forEach(element => {
        result.pictures.push(getValue(element.picture));
    });
    // delete duplicate pictures
    result.pictures = [...new Set(result.pictures)];

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

    result.location = [];
    data.forEach(element => {
        result.location.push(getValue(element.location));
    });
    // delete duplicate locations
    result.location = [...new Set(result.location)];

    result.year = getValue(data[0].year);

    result.wikiPage = getValue(data[0].wikiPage);

    return result;
}