ZeroClipboard.version = "{{version}}";
ZeroClipboard.moviePath = 'ZeroClipboard.swf'; // URL to movie
ZeroClipboard.currentClient = null; // The current html object

/*
 * Set the movie path for the flash file.
 *
 * returns nothing
 */
ZeroClipboard.setMoviePath = function (path) {
  // set path to ZeroClipboard.swf
  this.moviePath = path;
};

/*
 * use this method in JSNI calls to obtain a new Client instance
 *
 * returns a new client
 */
ZeroClipboard.newClient = function () {
  return new ZeroClipboard.Client();
};

/*
 * Simple Flash Detection
 *
 * returns true if flash is detected
 */
ZeroClipboard.detectFlashSupport = function () {

  // Assume we don't have it
  var hasFlash = false;

  try {

    // If we can create an ActiveXObject
    if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
      hasFlash = true;
    }
  } catch (error) {

    // If the navigator knows what to do with the flash mimetype
    if (navigator.mimeTypes["application/x-shockwave-flash"] !== undefined) {
      hasFlash = true;
    }
  }

  // If we don't have flash, tell an adult
  if (!hasFlash) {
    this.dispatch("onNoFlash", null);
  }

  return hasFlash;
};