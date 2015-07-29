var querystring = require('querystring');

var Server = {};

// settings
Server.HOSTNAME = 'localhost';
Server.PORT = 8800;
Server.PROTOCOL = 'http';

Server.buildUrl = function (path) {
  var url = Server.PROTOCOL + '://' + Server.HOSTNAME + ':' + Server.PORT;

  for (let i in arguments) {
    url += '/' + arguments[i];
  }

  return url;
}

Server.mergeUrlQuery = function (url, query) {
  if ('object' === typeof query) {
    query = querystring.stringify(query);
  }

  return url + '?' + query;
}

module.exports = Server;
