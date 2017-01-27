const MongoClient = require('mongodb').MongoClient;

// Todo: async mongodb operations with promises? Then get rid of init, also form exports section
// See: http://stackoverflow.com/questions/35246713/node-js-mongo-find-and-return-data

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

function findPreviousCheckInsOfIP(ip) {
    let hours = 6;
    let time = Date.now() - hours * 60 * 60 * 1000;
    let findObj = {
        "insertIP" : ip,
        "insertTime" : {
            $gt: time
        }
    };

    let connectionPromise = MongoClient.connect(process.env.MLAB_CONNECTION);

    let database;
    connectionPromise
        .then((db)=>{
            database = db;
            return db.collection(process.env.MLAB_COLL_CHECKINS);
        })
        .then((collection)=>{
            return collection.find(findObj).toArray();
        })
        .then((result)=>{
            database.close();
            console.log("res:"+result);
            return result;
        })
        .catch((err)=>{
            console.log("ERROR:" + err);
        });
/*
        function(db) {
        db.collection(process.env.MLAB_COLL_CHECKINS).find(findObj).toArray().then(function(result) {
//          parameters.response.setHeader('content-type', 'application/json');
//            parameters.response.end(JSON.stringify(result));
//            console.log(result);
            console.log("FOO:");
            console.log(result);
            return result;
        });
        db.close();
    });
    */
}






module.exports = {
    "init" : init,
    "insert" : insert,
    "find" : find,
    "findPreviousCheckInsOfIP" : findPreviousCheckInsOfIP
};