ZeroClipboard.version = "{{version}}";
// ZeroClipboard options defaults
var _defaults = {
  moviePath:         "ZeroClipboard.swf",        // URL to movie
  trustedDomains:    null,                       // Domains that we should trust
  text:              null,                       // The text to be copied
  hoverClass:        "zeroclipboard-is-hover",   // The class used to hover over the object
  activeClass:       "zeroclipboard-is-active",  // The class used to set object active
  allowScriptAccess: "sameDomain"                // SWF outbound scripting policy
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
