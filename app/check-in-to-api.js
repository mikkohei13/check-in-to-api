const url = require("url");
const querystring = require("querystring");
const hash33 = require("hash-string");
const validator = require("validator");
const mongo = require("./mongo");

function requestHandler(request, response) {
    let urlParts = url.parse(request.url);
    let queryParts = querystring.parse(urlParts.query);
    let pathname = urlParts.pathname;
    let pathParts = pathToArray(pathname);

    // ------------------------------------------------------------------
    // Find place
    if ("place" == pathParts[1] && "GET" == request.method) {

        // Validation
        if (!validator.isAlphanumeric(pathParts[2])) {
            return; // Todo: app-wide error handler? (how to scope?)
        }

        mongo.find({
            "placeId" : pathParts[2],
            "type" : "place"
        }, response);
    }
    // ------------------------------------------------------------------
    // Insert check-in to a place
    else if ("check-in" == pathParts[1] && "GET" == request.method) {

        // Validation
        if (!validator.isAlphanumeric(pathParts[2])) {
            return; // Todo: app-wide error handler? (how to scope?)
        }

        // Create check-in object
        let checkIn = {
            "type" : "check-in",
            "placeId" : pathParts[2],
            "checkInId" : shortHash(Math.random().toString(10), "no salt")
        };
//        checkIn.userId = shortHash("email@example.com", process.env.SALT); // Later when there are users...
//        response.end(JSON.stringify(checkIn));

        mongo.insert(checkIn, request);
        response.end("CHECKING IN NOW: " + JSON.stringify(checkIn));
    }
    // ------------------------------------------------------------------
    // Seed with testing data
    else if ("seed" == pathParts[1] && "GET" == request.method) {
        let place = {
            // Seed place here
        };
        mongo.insert(place);
        response.end("SEEDING NOW: " + JSON.stringify(place));
    }
    // ------------------------------------------------------------------
    // Not found
    else {
        console.log(pathParts);
        response.end("404");
    }
}

function shortHash(input, salt) {
    let since = Math.floor((Date.now() - 1485462732505)/1000); // some more uniqueness
    return (hash33(input + salt + since).toString(36)) + "-" + since;
}

// Return path direcotries in a array. Note that [0] is always empty.
function pathToArray(pathname) {
    let pathParts = pathname.split("/");
    return pathParts;
}

/*
// Static copy from bowerbird
const logStatus = function logStatus(e, statusCode, errorMessage) {
    console.log(errorMessage + " (" + statusCode + "): " + e);
    parameters.response.writeHead(statusCode);
    parameters.response.end(errorMessage + " (" + statusCode + ")");
};
*/

module.exports = {
    "requestHandler" : requestHandler
};
