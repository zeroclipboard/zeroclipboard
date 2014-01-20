/*
 * Simple Flash Detection
 *
 * returns true if Flash is detected
 */
var _detectFlashSupport = function () {
  var hasFlash = false;

  if (typeof flashState.disabled === "boolean") {
    hasFlash = flashState.disabled === false;
  }
  else {
    // IE
    if (typeof ActiveXObject === "function") {
      try {
        if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) {
          hasFlash = true;
        }
      }
      catch (error) {}
    }

    // Every other browser
    if (!hasFlash && navigator.mimeTypes["application/x-shockwave-flash"]) {
      hasFlash = true;
    }
  }

  return hasFlash;
};


/*
 * Parse a Flash version string (e.g. "MAC 11,9,100")
 *
 * returns a cleaner Flash version string (e.g. "11.9.100")
 */
function _parseFlashVersion(flashVersion) {
  return flashVersion.replace(/,/g, ".").replace(/[^0-9\.]/g, "");
}


/*
 * Flash version verification
 *
 * returns true if Flash version is acceptable
 */
function _isFlashVersionSupported(flashVersion) {
  return parseFloat(_parseFlashVersion(flashVersion)) >= 10.0;
}