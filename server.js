// everything should run in the browser
// here is just skeleton server to serve index.html
const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const server = http.Server(app);

app.use('/', express.static(__dirname + '/game'));// Routing

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '/index.html'));
});

server.listen(3007, function() {
  console.log('Starting server on port 3007');
});