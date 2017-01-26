
let port = 3000;

const http = require('http');

if (process.env.PORT) {
  port = process.env.PORT;
}

const server = http.createServer(requestHandler); 
server.listen((port), startServer);


// Functions
// -----------------------------------------------------

function startServer(err) {  
  if (err) {
    return console.log('Something went wrong.', err);
  }
  console.log(`Server is listening on port ${port}`);
}

function requestHandler(request, response) {
    response.end(JSON.parse({"answer" : "Hoi maailma!"));
}
