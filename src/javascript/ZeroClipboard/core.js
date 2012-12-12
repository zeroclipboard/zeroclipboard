ZeroClipboard.version = "{{version}}";
ZeroClipboard.clients = {}; // registered upload clients on page, indexed by id
ZeroClipboard.moviePath = 'ZeroClipboard.swf'; // URL to movie
ZeroClipboard.nextId = 1; // ID of next movie

ZeroClipboard.setMoviePath = function (path) {
  // set path to ZeroClipboard.swf
  this.moviePath = path;
};

// use this method in JSNI calls to obtain a new Client instance
ZeroClipboard.newClient = function () {
  return new ZeroClipboard.Client();
};

ZeroClipboard.register = function (id, client) {
  // register new client to receive events
  this.clients[id] = client;
};