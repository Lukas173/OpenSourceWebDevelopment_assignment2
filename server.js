// server file with routes and function calling for the operation
// I send in parameter for database and collection
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/inf5750";
var database = require('./database');
var routes = require('./routes');
var http = require('http');
var url = require('url');
var collection1 = "cars";
var collection2 = "owners";
// creating database and car and owner collection
startMongo(MongoClient, mongoUrl, collection1, collection2);

function onRequest(request, response) {

  // function to write a text message as response
  function sendResponse(error, message) {
    response.writeHead(error, {'Content-Type': 'text/html'});
    response.write(message);
    response.end();
  }



  if (request.method == 'GET' && request.url == '/api/cars') {
    database.allObjects(mongoUrl, MongoClient, request, response, collection1);

  } else if (request.method == 'GET' && request.url.substring(0,17) == '/api/cars?filter=') {
    database.filterObject(mongoUrl, MongoClient, request, response, collection1, url);

  } else if (request.method == 'POST' && request.url == '/api/cars') {
    database.insertObject(mongoUrl, MongoClient, request, response, collection1);

  } else if (request.method == 'GET' && request.url == '/api/owners') {
    database.allObjects(mongoUrl, MongoClient, request, response, collection2);

  } else if (request.method == 'GET' && request.url.substring(0,19) == '/api/owners?filter=') {
    database.filterObject(mongoUrl, MongoClient, request, response, collection2, url);

  } else if (request.method == 'POST' && request.url == '/api/owners') {
    database.insertObject(mongoUrl, MongoClient, request, response, collection2);

  } else if (request.method == 'GET' && request.url.substring(0,10) == '/api/cars/') {
    database.findObject(mongoUrl, MongoClient, request, response, collection1);

  } else if (request.method == 'GET' && request.url.substring(0,12) == '/api/owners/') {
    database.findObject(mongoUrl, MongoClient, request, response, collection2);

  } else if (request.method == 'DELETE' && request.url == '/api/cars') {
    sendResponse(405, 'Method not allowed');

  } else if (request.method == 'DELETE' && request.url == '/api/owners') {
    sendResponse(405, 'Method not allowed');

  } else if (request.method == 'DELETE' && request.url.substring(0,10) == '/api/cars/') {
    database.deleteObject(mongoUrl, MongoClient, request, response, collection1);

  } else if (request.method =='DELETE' && request.url.substring(0,12) == '/api/owners/') {
    database.deleteObject(mongoUrl, MongoClient, request, response, collection2);

  } else if (request.method == 'PATCH' && request.url == '/api/cars') {
    sendResponse(405, 'Method not allowed');

  } else if (request.method == 'PATCH' && request.url == '/api/owners') {
    sendResponse(405, 'Method not allowed');

  } else if (request.method =='PATCH' && request.url.substring(0,10) == '/api/cars/') {
    database.modifyObject(mongoUrl, MongoClient, request, response, collection1);

  } else if (request.method =='PATCH' && request.url.substring(0,12) == '/api/owners/') {
    database.modifyObject(mongoUrl, MongoClient, request, response, collection2);

  } else if (request.method == 'PUT' && request.url == '/api/cars') {
    sendResponse(405, 'Method not allowed');

  } else if (request.method == 'PUT' && request.url == '/api/owners') {
    sendResponse(405, 'Method not allowed');

  } else if (request.method =='PUT' && request.url.substring(0,10) == '/api/cars/') {
    database.putObject(mongoUrl, MongoClient, request, response, collection1);

  } else if (request.method =='PUT' && request.url.substring(0,12) == '/api/owners/') {
    database.putObject(mongoUrl, MongoClient, request, response, collection2);
  }
}
function startMongo(MongoClient, mongoUrl, collection1, collection2) {
  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
  });
  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    db.createCollection(collection1, function(err, res) {
      if (err) throw err;
      console.log("Collection cars created!");
      db.close();
    });
  });
  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    db.createCollection(collection2, function(err, res) {
      if (err) throw err;
      console.log("Collection owners created!");
      db.close();
    });
  });
}
http.createServer(onRequest).listen(8081);
console.log("Listening on port 8081");
