ZeroClipboard.version = "<%= version %>";
// ZeroClipboard options defaults
var _defaults = {
  moviePath:         "ZeroClipboard.swf",        // URL to movie
  trustedOrigins:    null,                       // Page origins that the SWF should trust (single string or array of strings)
  text:              null,                       // The text to be copied
  hoverClass:        "zeroclipboard-is-hover",   // The class used to hover over the object
  activeClass:       "zeroclipboard-is-active",  // The class used to set object active
  allowScriptAccess: "sameDomain",               // SWF outbound scripting policy
  useNoCache:        true,                       // Ability to turn off Flash cache hack for IE
  forceHandCursor:   false                       // Forcibly set the hand cursor ("pointer") for all glued elements
};

/*
 * Set defaults.
 *
 * returns nothing
 */
ZeroClipboard.setDefaults = function (options) {
  for (var ko in options) _defaults[ko] = options[ko];
};

/*
 * Self-destruction and clean up everything
 *
 * returns nothing
 */
ZeroClipboard.destroy = function () {

  // unglue all the elements
  ZeroClipboard.prototype._singleton.unglue(gluedElements);

  var bridge = ZeroClipboard.prototype._singleton.htmlBridge;

  // remove the bridge
  bridge.parentNode.removeChild(bridge);

  // delete the client object
  delete ZeroClipboard.prototype._singleton;
};

/*
 * @deprecated in [v1.2.0], slated for removal from the public API in [v2.0.0]. See docs for more info.
 *
 * Simple Flash Detection
 *
 * returns true if Flash is detected
 */
ZeroClipboard.detectFlashSupport = function () {
  var hasFlash = false;

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

  return hasFlash;
};
