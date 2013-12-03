/*
 * Simple Flash Detection
 *
 * returns true if Flash is detected
 */
var _detectFlashSupport = function () {
  var hasFlash = false;

  if (typeof flashState.global.noflash === "boolean") {
    hasFlash = flashState.global.noflash === false;
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
