const url = require("url");
const querystring = require("querystring");
var hash33 = require("hash-string")
const mongo = require("./mongo");

function requestHandler(request, response) {
    let urlParts = url.parse(request.url);
    let queryParts = querystring.parse(urlParts.query);
    let pathname = urlParts.pathname;
    let pathParts = pathToArray(pathname);

    // ------------------------------------------------------------------
    // Find place
    if ("place" == pathParts[1] && "GET" == request.method) {
        mongo.find({"placeId": pathParts[2]}, response);
    }
    // ------------------------------------------------------------------
    // Insert check-in to a place
    else if ("check-in" == pathParts[1] && "GET" == request.method) {

        // Create check-in object
        let checkIn = {
            "type" : "check-in",
            "placeId" : pathParts[2]
        };
//        checkIn.userId = shortHash("email@example.com"); // Later when there are users...
        checkIn.unixtime = Date.now();
        checkIn.checkInId = shortHash(Math.random()); // Todo: better random hash?

//        response.end(JSON.stringify(checkIn));

        mongo.insert(checkIn);
        response.end("CHECK-IN " + JSON.stringify(checkIn));
    }
    // ------------------------------------------------------------------
    // Seed with testing data
    else if ("seed" == pathParts[1] && "GET" == request.method) {
        let place = {
            // Seed place here
        };
        mongo.insert(place);
        response.end("SEEDING NOW");
    }
    // ------------------------------------------------------------------
    // Not found
    else {
        console.log(pathParts);
        response.end("404");
    }
}

function shortHash(input) {
    let since = Math.floor((Date.now() - 1485462732505)/1000);
    return (hash33(input + process.env.SALT + since).toString(36)) + "-" + since;
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
