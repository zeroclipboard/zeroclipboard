ZeroClipboard.version = "{{version}}";
ZeroClipboard.moviePath = 'ZeroClipboard.swf'; // URL to movie
ZeroClipboard.currentClient = null; // The current html object

ZeroClipboard.setMoviePath = function (path) {
  // set path to ZeroClipboard.swf
  this.moviePath = path;
};

// use this method in JSNI calls to obtain a new Client instance
ZeroClipboard.newClient = function () {
  return new ZeroClipboard.Client();
};