ZeroClipboard.version = "{{version}}";
ZeroClipboard.moviePath = 'ZeroClipboard.swf'; // URL to movie
ZeroClipboard.currentElement = null; // The current html object
ZeroClipboard.handCursorEnabled = true; // whether to show hand cursor, or default pointer cursor

ZeroClipboard.setMoviePath = function (path) {
  // set path to ZeroClipboard.swf
  this.moviePath = path;
};

// use this method in JSNI calls to obtain a new Client instance
ZeroClipboard.newClient = function () {
  return new ZeroClipboard.Client();
};

ZeroClipboard.setHandCursor = function (enabled) {
  // enable hand cursor (true), or default arrow cursor (false)
  this.handCursorEnabled = enabled;
};