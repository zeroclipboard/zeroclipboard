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

// Simple Flash Detection
ZeroClipboard.detectFlashSupport = function () {

  // Assume we don't have it
  this.hasFlash = false;

  try {

    // If we can create an ActiveXObject
    if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
      this.hasFlash = true;
    }
  } catch (error) {

    // If the navigator knows what to do with the flash mimetype
    if (navigator.mimeTypes["application/x-shockwave-flash"] !== undefined) {
      this.hasFlash = true;
    }
  }

  // If we don't have flash, tell an adult
  if (!this.hasFlash) {
    // tell everyone
    for (var id in this.clients) {
      this.dispatch(id, "onNoFlash", null);
    }
  }

  return this.hasFlash;
};

