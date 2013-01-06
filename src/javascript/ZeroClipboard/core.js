ZeroClipboard.version = "{{version}}";
ZeroClipboard._moviePath = 'ZeroClipboard.swf'; // URL to movie
ZeroClipboard._client = null; // The client

/*
 * Set the movie path for the flash file.
 *
 * returns nothing
 */
ZeroClipboard.setMoviePath = function (path) {
  // set path to ZeroClipboard.swf
  this._moviePath = path;
};

/*
 * Sets trusted domain to configure the flash file with.
 *
 * returns nothing
 */
ZeroClipboard.setTrustedDomain = function (domain) {
  this._trustedDomain = domain;
};

/*
 * Self-destruction and clean up everything
 *
 * returns nothing
 */
ZeroClipboard.destroy = function () {
  // get the bridge
  var bridge = document.getElementById("global-zeroclipboard-html-bridge");

  // if no bridge exists return
  if (!bridge) return;

  // delete the client object
  delete ZeroClipboard._client;
  delete ZeroClipboard._trustedDomain;
  ZeroClipboard._moviePath = 'ZeroClipboard.swf';

  // remove the bridge
  bridge.parentNode.removeChild(bridge);
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
    if (navigator.mimeTypes["application/x-shockwave-flash"]) {
      hasFlash = true;
    }
  }

  return hasFlash;
};