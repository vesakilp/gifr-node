// server.js

// BASE SETUP
// ==============================================

require('es6-promise').polyfill();
var express = require('express');
var bodyParser = require('body-parser');
var axios = require('axios');
var app = express();
var port = process.env.PORT || 8080;

var giphyApiKey = 'dc6zaTOxFJmzC';
var giphyRandomApiUrl = 'http://api.giphy.com/v1/gifs/random';
var originalSearchTerm = '';

app.use(bodyParser.json());
// route with parameters (http://localhost:8080/token/:searchTerm)
app.post('/token', function(req, res) {
    console.log('request', req.body);
    if(req.body && req.body.inline_query && req.body.inline_query.query) {
        originalSearchTerm = req.body.inline_query.query;
        makeGiffyApiCall(originalSearchTerm, res);
    }
    else {
        //TODO error message response
    }
});

function makeGiffyApiCall(searchTerm, res) {
    console.log('createGiffyApiCall', searchTerm);
    searchTerm = recastSearchTerm(searchTerm);
    console.log('make giphy api call with search term: ' + searchTerm);
    axios.get(giphyRandomApiUrl + '?api_key=' + giphyApiKey + '&tag' + searchTerm + '&fmt')
      .then(function (response) {
          console.log('response1', response.data.data);
          if(response.data.data && response.data.data.image_url) {
              if(response.data.data.type !== 'gif') {
                  makeGiffyApiCall(searchTerm, res);
              }
              var responseJson = constructResponseJson(response.data.data);
              console.log('responseJson', responseJson);
              res.status(200);
              res.setHeader('Content-Type', 'application/json');
              console.log('send json');
              res.json(responseJson);
          } else {
              res.status(501).send('error in giphy api');
          }
      })
      .catch(function (error) {
          console.log('response catch', error);
          res.status(501).send(error);
      });
    //http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=american+psycho
}

function recastSearchTerm(searchTerm) {
    return searchTerm.split(' ').join('+');
}

function constructResponseJson(response) {
    var responseJson = {
        type: response.type,
        id: response.id,
        gif_url: response.image_url,
        thumb_url: response.fixed_width_small_still_url,
        caption: originalSearchTerm
    }


    return responseJson;
    console.log('constructResponseJson', responseJson);
}

// apply the routes to our application
//app.use('/', router);

// START THE SERVER
// ==============================================
app.listen(port);
console.log('Magic happens on port ' + port);
