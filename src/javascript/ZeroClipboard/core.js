ZeroClipboard.version = "<%= version %>";
// ZeroClipboard options defaults
var _defaults = {
  moviePath:         "ZeroClipboard.swf",        // URL to movie
  trustedOrigins:    null,                       // Page origins that the SWF should trust (single string or array of strings)
  text:              null,                       // The text to be copied
  hoverClass:        "zeroclipboard-is-hover",   // The class used to hover over the object
  activeClass:       "zeroclipboard-is-active",  // The class used to set object active
  allowScriptAccess: "sameDomain",               // SWF outbound scripting policy
  useNoCache:        true,                       // Include a nocache query parameter on requests for the SWF
  forceHandCursor:   false,                      // Forcibly set the hand cursor ("pointer") for all glued elements
  zIndex:            999999999,                  // The z-index used by the Flash object. Max value (32-bit): 2147483647
  debug:             true                        // Debug enabled: send `console` messages with deprecation warnings, etc.
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
  // If there is an existing singleton
  if (ZeroClipboard.prototype._singleton) {
    // unglue all the elements
    ZeroClipboard.prototype._singleton.unglue(gluedElements);

    var bridge = ZeroClipboard.prototype._singleton.htmlBridge;

    // remove the bridge
    if (bridge && bridge.parentNode) {
      bridge.parentNode.removeChild(bridge);
    }

    // delete the client object
    delete ZeroClipboard.prototype._singleton;
  }
};