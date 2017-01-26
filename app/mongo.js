const MongoClient = require('mongodb').MongoClient;

function insert(payloadObj) {

    // Todo: async mongodb operations with promises?

    MongoClient.connect(process.env.MLAB_CONNECTION, function(err, db) {
        if (err) {
            console.log(err, 503, "Database connection failed.");
        }
        else {
            let options = {};
            let collection = db.collection(process.env.MLAB_COLL);
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

function find(findObj, response) {

    // Todo: async mongodb operations with promises?

    MongoClient.connect(process.env.MLAB_CONNECTION, function(err, db) {
        if (err) {
            console.log(err, 503, "Database connection failed.");
        }
        else {
            let collection = db.collection(process.env.MLAB_COLL);
            collection.find(findObj).limit(1).toArray(function(err, result) {
                if(err) {
                    console.log(err, 500, "Database insertion failed.");
                }
                else
                {
                    response.setHeader('content-type', 'application/json');
                    response.end(JSON.stringify(result[0]));
                    console.log(result);
                }
                db.close();
            });
        }
    });
}

module.exports = {
    "insert" : insert,
    "find" : find
};