//import express module
var express = require('express');
//import JSON body parser
var bodyParser = require('body-parser');
//import database functions
var database = require('./database');
var PostUpdateSchema = require('./schemas/postupdate.json');


var readDocument = database.readDocument;
var writeDocument = database.writeDocument;
var addDocument = database.addDocument;
var validate = require('express-jsonschema').validate;
var app = express();
app.use(bodyParser.text());
app.use(bodyParser.json());
//pull static contends from build
app.use(express.static('../client/build'));

/**
* Get the user ID from a token. Returns -1 (an invalid ID)
* if it fails.
*/
  // var token ="eyJpZCI6MX0=";
function getUserIdFromToken(authorizationLine) {
  try {
    // Cut off "Bearer " from the header value.
    var token = authorizationLine.slice(7);
    // Convert the base64 string to a UTF-8 string.
    var regularString = new Buffer(token, 'base64').toString('utf8');
    // Convert the UTF-8 string into a JavaScript object.
    var tokenObj = JSON.parse(regularString);
    var id = tokenObj['id'];
    // Check that id is a number.
    if (typeof id === 'number') {
    return id;
    } else {
    // Not a number. Return -1, an invalid ID.
    return -1;
    }
  } catch (e) {
// Return an invalid ID.
return -1;
}
}

/**
 * Given a feed item ID, returns a FeedItem object with references resolved.
 * Internal to the server, since it's synchronous.
 */
function getFeedItemSync(feedItemId) {
  var feedItem = readDocument('feedItems', feedItemId);
  // Resolve 'like' counter.
  feedItem.likeCounter =
    feedItem.likeCounter.map((id) => readDocument('users', id));
    // Assuming a StatusUpdate. If we had other types of
    // FeedItems in the DB, we would
    // need to check the type and have logic for each type.
    feedItem.contents.author =
      readDocument('users', feedItem.contents.author);
    feedItem.tag = readDocument("servicetags",feedItem.tag);
    return feedItem;
}

function getFeedData(user,type) {
  console.log("Get called");
  // Get the User object with the id "user".
  var userData = readDocument('users', user);
  // Get the Feed object for the user.
  var feedData;
  if(type === 1) {
     feedData = readDocument('academicfeeds', userData.Academic_feed);
  }else {
     feedData = readDocument('servicefeeds', userData.Service_feed);
  }
  // Map the Feed's FeedItem references to actual FeedItem objects.
  // Note: While map takes a callback function as an argument, it is
  // synchronous, not asynchronous. It calls the callback immediately.
  feedData.list_of_feeditems = feedData.list_of_feeditems.map(getFeedItemSync);
  return feedData;
}

function postStatusUpdate(user, contents,imgUrl,request,type) {
  var time = new Date().getTime();
  var newPost = {
    "view_count": 0,
    "likeCounter": [],
    // Taggs are by course_id
    "tag": 1,
    "list_of_comments":[],
    "contents": {
      "author": user,
      "timestamp": time,
      "request": request,
      "contents": contents,
      "imgUrl":imgUrl
    }
  }
  console.log(contents);
  console.log(newPost);
  newPost = addDocument('feedItems',newPost);
  var userData = readDocument('users', user);
  var feedData;
  if(type === 1) {
     feedData = readDocument('academicfeeds', userData.Academic_feed);
     feedData.list_of_feeditems.unshift(newPost._id);
     writeDocument('academicfeeds', feedData);
  }else {
     feedData = readDocument('servicefeeds', userData.Service_feed);
     feedData.list_of_feeditems.unshift(newPost._id);
     writeDocument('servicefeeds', feedData);
  }
  return newPost;
}
/**
 * Get the feed data for a particular user.
 1 is academic feed
 2 is Service feed
*/
app.get('/user/:userid/feed/:feedtype', function(req, res) {
console.log(req.params.userid);
console.log(req.get("Authorization"));
var userid =  parseInt(req.params.userid,10);
  var feedType = parseInt(req.params.feedtype,10);
  // userid is a string. We need it to be a number.
  // Parameters are always strings.
var fromUser = getUserIdFromToken(req.get('Authorization'));

console.log("fromUser:"+fromUser);
console.log("userid :"+userid);
console.log("feedtype:"+feedType);
if(fromUser === userid){
  // Send response.
  res.send(getFeedData(userid,feedType));
}
else{
  // 401: Unauthorized request.
  res.status(401).end();

}

});

app.post('/feeditem/:feeditemtype',validate({body:PostUpdateSchema}),function(req,res) {
  console.log("Get post feeditem");
  var body = req.body;
  var feedItemType = parseInt(req.params.feeditemtype,10);
  var newPost = postStatusUpdate(body.author,body.contents,body.imgUrl,body.request,feedItemType);
  res.status(201);
  res.set('Location','/feeditem/'+newPost._id);
  res.send(newPost);
});

//Rest database.
app.post('/restdb',function(req,res) {
  console.log("Resetting database");
  // This is a debug route, so don't do any Validation.
  database.resetDatabase();
  // res.send() sends an empty response with status code 200
  res.send();
});

app.put('/feeditem/:feeditemid',function(req,res) {
  var feedItemId = parseInt(req.params.feeditemid);
  var feedItem = readDocument("feedItems",feedItemId);
  feedItem.view_count = feedItem.view_count+1;
  writeDocument("feedItems",feedItem);
  res.status(201);
  res.send(JSON.stringify(feedItem.view_count));
});

app.put('/feeditem/:feeditemid/likelist/:userid',function(req,res) {
  var feedItemId = parseInt(req.params.feeditemid);
  var userId = parseInt(req.params.userid);
  var feedItem = readDocument('feedItems', feedItemId);
    // Normally, we would check if the user already
  // liked this comment. But we will not do that
  // in this mock server. ('push' modifies the array
  // by adding userId to the end)
  feedItem.likeCounter.push(userId);
  writeDocument('feedItems', feedItem);
  // Return a resolved version of the likeCounter
  res.status(201);
  res.send(feedItem.likeCounter.map((userId) =>
                        readDocument('users', userId)));
});

app.delete('/feeditem/:feeditemid/likelist/:userid',function(req,res) {
  var feedItemId = parseInt(req.params.feeditemid);
  var userId = parseInt(req.params.userid);
  var feedItem = readDocument('feedItems', feedItemId);
  var userIndex = feedItem.likeCounter.indexOf(userId);
  // -1 means the user is *not* in the likeCounter,
  // so we can simply avoid updating
  // anything if that is the case: the user already
  // doesn't like the item.
  if (userIndex !== -1) {
    // 'splice' removes items from an array. This
    // removes 1 element starting from userIndex.
    feedItem.likeCounter.splice(userIndex, 1);
    writeDocument('feedItems', feedItem);
  }
  res.status(201);
  // Return a resolved version of the likeCounter
  res.send(feedItem.likeCounter.map((userId) =>
                        readDocument('users', userId)));
});
// Search for feed item
app.post('/search', function(req, res) {
  var fromUser = getUserIdFromToken(req.get('Authorization'));
  var userData = readDocument('users', fromUser);
  if (typeof(req.body) === 'string') {
    var query = req.body.trim().toLowerCase();
    var feedData = readDocument('academicfeeds', userData.Academic_feed).list_of_feeditems;
    console.log("query: "+query);
    console.log("feedData: "+feedData);
  res.send(feedData.filter((feedItemId) => {
    var feedItem = readDocument('feedItems',feedItemId);
    return feedItem.contents.contents.toLowerCase().indexOf(query)!==-1;
  }).map(getFeedItemSync));
}
else{
res.status(400).end();
}
});
/**
 * Translate JSON Schema Validation failures into error 400s.
*/
app.use(function(err, req, res, next) {
  if (err.name === 'JsonSchemaValidation') {
    // Set a bad request http response status
    res.status(400).end();
  } else {
    // It's some other sort of error; pass it to next error middleware handler
    next(err); }
});

// listening on port 3000
app.listen(3000,function() {
  console.log('Example app listening on port 3000');
});
// Implement your server in this file.
// We should be able to run your server with node src/server.js