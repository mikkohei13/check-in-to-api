
const url = require("url");
const querystring = require("querystring");
const mongo = require("./mongo");

function requestHandler(request, response) {
    let getParameters = { "response" : response };
    get.init(getParameters);

    let urlParts = url.parse(request.url);
    let queryParts = querystring.parse(urlParts.query);
    let pathname = urlParts.pathname;
    let pathParts = pathToArray(pathname);

    if ("place" == pathParts[1] && "GET" == request.method) {
        mongo.find({"placeId": pathParts[2]}, response);
    }
    else if ("seed" == pathParts[1] && "GET" == request.method) {
        let place = {
            "placeId": "LM",
            "type":"tower",
            "name":"Maarin lintutorni, Laajalahti",
            "ornithologicalSociety":"tringa",
            "lat": 60.189483,
            "lon": 24.818959
        };
        mongo.insert(place);
        response.end("SEEDING NOW");
    }

    else {
        console.log(pathParts);
        response.end("404");
    }
}

// Return path direcotries in a array. Note that [0] is always empty.
function pathToArray(pathname) {
    /*
    if ("/favicon.ico" == pathname) {
        return false;
    }
    */

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
