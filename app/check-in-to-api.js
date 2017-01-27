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

    mongo.init({"request": request, "response": response});

    // ------------------------------------------------------------------
    // Find place
    if ("place" == pathParts[1] && "GET" == request.method) {

        // Validation
        if (!validator.isAlphanumeric(pathParts[2])) {
            return; // Todo: app-wide error handler? (how to scope?)
        }

        mongo.find({
            "placeCode" : pathParts[2],
            "type" : "place"
        }, "MLAB_COLL_PLACES");
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
            "placeCode" : pathParts[2]/*,
            "checkInId" : shortHash(Math.random().toString(10), "no salt")*/
        };
//        checkIn.userId = shortHash("email@example.com", process.env.SALT); // Later when there are users...
//        response.end(JSON.stringify(checkIn));

        mongo.insert(checkIn, "MLAB_COLL_CHECKINS");
        response.end("CHECKING IN NOW: " + JSON.stringify(checkIn));
    }
    // ------------------------------------------------------------------
    // Seed with testing data
    else if ("seed" == pathParts[1] && "GET" == request.method) {
        let place = {
            "type": "place",
            "placeCode": "FM",
            "placeType": "tower",
            "name": "Fiskarsinmäen lintutorni",
            "ornithologicalSociety": "tringa",
            "lat": 60.176438,
            "lon": 24.571117
        };
        mongo.insert(place, "MLAB_COLL_PLACES");
        response.end("SEEDING NOW: " + JSON.stringify(place));
    }
    // ------------------------------------------------------------------
    // Test
    else if ("test" == pathParts[1] && "GET" == request.method) {
        /*
        Needed:
        - find ip's checkins during the last 6 hours
        - pick the latest
        - pick the latest to this one
        - if latest < 15 min || latest to this one < 6 h
            end with error
        - else
            do a check-in
        */

        // Validation
        if (!validator.isAlphanumeric(pathParts[2])) {
            return; // Todo: app-wide error handler? (how to scope?)
        }

        // Create check-in object
        let checkIn = {
            "type" : "check-in",
            "placeCode" : pathParts[2]/*,
             "checkInId" : shortHash(Math.random().toString(10), "no salt")*/
        };

        mongo.checkInThrottled(pathParts[2], checkIn);
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
