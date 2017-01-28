const MongoClient = require('mongodb').MongoClient;
const parallel = require('async/parallel');

// Todo: async mongodb operations with promises? Then get rid of init, also form exports section
// See: http://stackoverflow.com/questions/35246713/node-js-mongo-find-and-return-data
// See: mongoose?

let parameters;

function init(params) {
    parameters = params;
}

function insert(payloadObj, coll) {

    // Add metadata, if available
    payloadObj.insertTime = Date.now();
    payloadObj.insertIP = parameters.request.connection.remoteAddress;
    payloadObj.insertUA = parameters.request.headers['user-agent'];

    MongoClient.connect(process.env.MLAB_CONNECTION, function(err, db) {
        if (err) {
            console.log(err, 503, "Database connection failed.");
        }
        else {
            let options = {};
            let collection = db.collection(process.env[coll]);
            collection.insertOne(payloadObj, options, function(err, result) {
                if(err) {
                    console.log(err, 500, "Database operation failed.");
                }
                else
                {
                    // Todo: return check-in identifier
                    console.log(result);
                }
                db.close();
            });
        }
    });
}

function find(findObj, coll) {

    MongoClient.connect(process.env.MLAB_CONNECTION, function(err, db) {
        if (err) {
            console.log(err, 503, "Database connection failed.");
        }
        else {
            let collection = db.collection(process.env[coll]);
            collection.find(findObj).limit(1).toArray(function(err, result) {
                if(err) {
                    console.log(err, 500, "Database operation failed.");
                }
                else
                {
                    parameters.response.setHeader('content-type', 'application/json');
                    parameters.response.end(JSON.stringify(result[0]));
                    console.log(result);
                }
                db.close();
            });
        }
    });
}

function checkInThrottled(placeCode, payloadObj) {

    // Todo: Check that the placeCode exists, do this parallel to finding user data
    // Todo: handle all errors similarly?

    // Settings
    const previousCheckInLimitThisPlaceHours = 6;
    const previousCheckInLimitMinutes = 1;

    // Query
    const lastThisPlaceLimitMs = 1000*60*60 * previousCheckInLimitThisPlaceHours;
    const lastLimitMs = 1000*60 * previousCheckInLimitMinutes;

    const findCheckIns = {
        "insertIP" : parameters.request.connection.remoteAddress,
        "insertTime" : {
            $gt: Date.now() - lastThisPlaceLimitMs
        }
    };

    const findPlaceCode = {
        "placeCode" : placeCode
    };

    MongoClient.connect(process.env.MLAB_CONNECTION, function(err, db) {
        if (err) {
            console.log(err, 503, "Database connection failed.");
        }
        else {
            // ABBA async parallel
            parallel({
                "checkIns": function(callback) {
                    let collection = db.collection(process.env.MLAB_COLL_CHECKINS);
                    collection.find(findCheckIns).toArray(callback);
                },
                "places": function(callback) {
                    let collection = db.collection(process.env.MLAB_COLL_PLACES);
                    collection.find(findPlaceCode).toArray(callback);
                }
            }, function(err, resultObj) {
                if(err) {
                    console.log(err, 500, "Database operation failed.");
                }
                else
                {
                    // If place not found
                    if (typeof resultObj.places[0] !== "object") {
                        console.log("Place not found");
                        parameters.response.end(JSON.stringify({"error":"place not found"}));
                    }
                    else
                    {
                        // Analyze data
                        console.log("HERE:" + JSON.stringify(resultObj.checkIns));

                        // Defaults for no check-ins
                        let lastCheckInTime = 0;
                        let lastCheckInTimeThisPlace = 0;

                        // get latest check-ins from documents
                        resultObj.checkIns.forEach(function(document) {
                            if (document.insertTime > lastCheckInTime) {
                                lastCheckInTime = document.insertTime;
                            }
                            if (document.placeCode == placeCode && document.insertTime > lastCheckInTimeThisPlace) {
                                lastCheckInTimeThisPlace = document.insertTime;
                            }
                        });

                        // Compare are check-ins too close
                        if (lastCheckInTime > (Date.now() - lastLimitMs)) {
                            console.log("Too early, last was " + lastCheckInTime);
                        }
                        else if (lastCheckInTimeThisPlace > (Date.now() - lastThisPlaceLimitMs)) {
                            console.log("Too early at this place, last was " + lastCheckInTimeThisPlace);
                        }
                        else {
                            // All is ok, insert check-in
                            console.log("Doing check-in...");
                            insert(payloadObj, "MLAB_COLL_CHECKINS");
                        }

                        parameters.response.end(JSON.stringify(resultObj));
                    }
                }
                db.close();
            });
        }
    });
}






module.exports = {
    "init" : init,
    "insert" : insert,
    "find" : find,
    "checkInThrottled" : checkInThrottled
};