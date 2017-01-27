const MongoClient = require('mongodb').MongoClient;

// Todo: async mongodb operations with promises? Then get rid of init, also form exports section

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
                    console.log(err, 500, "Database insertion failed.");
                }
                else
                {
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
                    console.log(err, 500, "Database insertion failed.");
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

module.exports = {
    "init" : init,
    "insert" : insert,
    "find" : find
};