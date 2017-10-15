//database.js manages both cars and owners, database queries
// and server response here

//show all objects according to collection you have in parameter
function allObjects(mongoUrl, MongoClient, request, response, collection) {
  response.writeHead(200, {'Content-Type':'application/json'});
  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    db.collection(collection).find({}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      response.write(JSON.stringify(result) );
      response.end();
      db.close();
    });
  });
}
// structur of all function is code for payload, string manipulation, database action
function insertObject(mongoUrl, MongoClient, request, response, collection) {
  response.writeHead(201, {'Content-Type': 'application/json'});
  let body = [];
  request.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    console.log(body);
    body = Buffer.concat(body).toString();

    var myObj = JSON.parse(body);
//I trhrow everythinfg in an if loop to che if payload has all properties needed
    if (checkPayload(myObj, collection) == true) {

    myObj.id = generateID(MongoClient, mongoUrl, collection);
    if (collection == 'cars') {
      myObj.href = 'http://localhost:8081/api/cars/' + myObj.id;
    } else {
      myObj.href = 'http://localhost:8081/api/owners/' + myObj.id;
    }


    MongoClient.connect(mongoUrl, function(err, db) {
      if (err) throw err;
      db.collection(collection).insertOne(myObj, function(err, res) {
        if (err) throw err;
        console.log("1 object inserted");
        db.close();
        //response.write(JSON.stringify(body) ); I need response.write here?
        response.end();
      });
    });
} else {
  response.writeHead(400, {'Content-Type': 'text/html'});
  response.write('Payload is not complete');
  response.end();
}
  });
}
// if I have to check if id exists I call a method that run
// a promise in the function checkID that call one of the 2 functions here:
// failure or success
function findObject(mongoUrl, MongoClient, request, response, collection) {
  var urlSplit = request.url.split('/');
  var objID = urlSplit[3];

  function success() {
    response.writeHead(200, {'Content-Type':'application/json'});
    MongoClient.connect(mongoUrl, function(err, db) {
      if (err) throw err;

        var query = { "id": objID };
        db.collection(collection).find(query).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          response.write(JSON.stringify(result) );
          response.end();
          db.close();
        });
      });
  }
  function failure() {
    response.writeHead(404, {'Content-Type':'text/html'});
    response.write("File not found ");
    response.end();
  }
  checkID(mongoUrl, MongoClient, collection, objID, success, failure);

  }
//in this function is the same, after I got the Id I run checkID function
// that run  one of the methods Failure or success
function deleteObject(mongoUrl, MongoClient, request, response, collection) {
  var carSplit = request.url.split('/');
  var carID = carSplit[3];

    MongoClient.connect(mongoUrl, function(err, db) {
  if (err) throw err;
  var myquery = { "id": carID.toString() };

  function failure(){
    response.writeHead(404, {'Content-Type':'text/html'});
    response.write("File not found ");
    response.end();
  }
  function success(){
    db.collection(collection).deleteOne(myquery, function(err, obj) {
      if (err) throw err;
      console.log("1 document from " + collection + " is deleted");
      response.writeHead(204, {'Content-Type':'text/html'});
      response.write("No content");
      response.end();
      db.close();
    });
  }

  checkID(mongoUrl, MongoClient, collection, carID, success, failure);
});

}
//this is for patching
function modifyObject(mongoUrl, MongoClient, request, response, collection) {
  response.writeHead(201, {'Content-Type': 'application/json'});
  let body = [];
  request.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    var myObj = JSON.parse(body);
    if (checkPayload(myObj, collection) == true ) {

    var urlSplit = request.url.split('/');
    var objID = urlSplit[3];
  function success() {
    MongoClient.connect(mongoUrl, function(err, db) {
  if (err) throw err;
  var myquery = { id: objID };
  var newvalues = {$set: myObj };
  db.collection(collection).updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
    response.end();
  });
});
}
  function failure() {
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.write('File not found');
    response.end();
  }
checkID(mongoUrl, MongoClient, collection, objID, success, failure);
} else {
  response.writeHead(400, {'Content-Type': 'text/html'});
  response.write('Payload is not complete');
  response.end();
}

});
}

// this is for put
function putObject(mongoUrl, MongoClient, request, response, collection) {

  let body = [];
  request.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();

    var myObj = JSON.parse(body);
    // at this point, `body` has the entire request body stored in it as a string
    var urlSplit = request.url.split('/');
    var objID = urlSplit[3];

    if(checkPayload(myObj, collection) == true) {

      function success() {
        MongoClient.connect(mongoUrl, function(err, db) {
          if (err) throw err;
          var myquery = { id: objID };
          myObj.id = objID;
          var newvalues = myObj;
          console.log(myObj);

          db.collection(collection).updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            response.writeHead(201, {'Content-Type': 'application/json'});
            console.log("1 document updated");
            response.end();
            db.close();
          });
        });
      }
      function failure() {
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.write('File is not found');
        response.end();
      }
      checkID(mongoUrl, MongoClient, collection, objID, success, failure);

  } else {
      response.writeHead(400, {'Content-Type': 'text/html'});
      response.write('Payload is not complete');
      response.end();
    }
});
}
// this function generate an id, call checkID to check
function generateID(MongoClient, mongoUrl, collection) {
  var value = true;
  while (value) {
    var id = "";
    for ( var i = 0; i < 10; i ++) {
      var number =  Math.floor(Math.random() * 10);
      id = id + number.toString();
    }
    function failure(){
      value = true;
    }
    function success(){
      value = false;
    }
    checkID(mongoUrl, MongoClient, collection, id, success, failure);
  }
  return id;
}

// method support basic one property filtering
function filterObject(mongoUrl, MongoClient, request, response, collection, url) {
  response.writeHead(201, {'Content-Type': 'application/json'});
  var address = request.url
  var filter = url.parse(address, true);
  filter = filter.query.filter.split(":");

  console.log(filter);
var newfilter = {
  [filter[0]]: filter[1],
}
console.log(newfilter);

MongoClient.connect(mongoUrl, function(err, db) {
  if (err) throw err;
  var query = newfilter;
  db.collection(collection).find(query).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    response.write(JSON.stringify(result) );
    db.close();
    response.end();
  });
});

}
//check Id check in the database if an id exists. with a promise and I think a callback
//I activate functions in the methods for the CRUD operation
function checkID(mongoUrl, MongoClient, collection, id, success, failure) {
  console.log('Promise starting');
  let checkIfIdExists = new Promise(function(resolve, reject) {
    console.log('Promise ongoing');
    MongoClient.connect(mongoUrl, function(err, db) {

      if (err) throw err;
      var query = { id: id };
      var exists;
      db.collection(collection).find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        let exists;
        if (result.length > 0) {
          exists = true;

        } else {
          exists = false;

        }
        if (exists) {
          resolve('Object found');
        } else {
          reject('Object not found');
        }

        db.close();
      });

    });
    console.log('Promise ended');
  });

checkIfIdExists.then(function(fromResolve) {
  console.log('Status ' + fromResolve);
  //return true;
  failure();
}).catch(function(fromReject) {
  console.log('Status ' + fromReject);
  //return false;
  success();
})


}
//this method check for the moment just if all properties are there
//extra manipulation of the payload is needed to check if
//unnecessary properties are in the payload
function checkPayload(carOrOwners, collection) {

var cars = ["make", "color","registration", "owner", "comment"];
var owner = ["name", "phone", "cars","comment", "href"];

var i = 0;

if (collection == "cars") {
  for (i = 0; i < cars.length; i ++) {
    if (carOrOwners.hasOwnProperty(cars[i]) == false);
    return false;
  }
  //here I should write additional code to check if for ex
  //registration number osv
  return true;

} else {
  for (i = 0; i < owners.length; i ++) {
    if (carOrOwners.hasOwnProperty(owners[i]) == false);
    return false;
  }
  //here I should write additional code to check if for ex
  //registration number osv
  return true;
}
}


// this is to use this module from another file as a function
module.exports = {
  allObjects,
  generateID,
  insertObject,
  findObject,
  deleteObject,
  checkID,
  modifyObject,
  putObject,
  filterObject
};
