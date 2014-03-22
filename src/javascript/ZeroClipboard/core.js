ZeroClipboard.version = "<%= version %>";

// ZeroClipboard options defaults
var _globalConfig = {
  // NOTE: For versions >= v1.3.x and < v2.x, you must use `swfPath` by setting `moviePath`:
  //   `ZeroClipboard.config({ moviePath: ZeroClipboard.config("swfPath") });`
  // URL to movie, relative to the page. Default value will be "ZeroClipboard.swf" under the
  // same path as the ZeroClipboard JS file.
  swfPath: _swfPath,

  // SWF inbound scripting policy: page domains that the SWF should trust. (single string or array of strings)
  trustedDomains: window.location.host ? [window.location.host] : [],

  // Include a "nocache" query parameter on requests for the SWF
  cacheBust: true,

  // Forcibly set the hand cursor ("pointer") for all clipped elements
  forceHandCursor: false,

  // The z-index used by the Flash object. Max value (32-bit): 2147483647
  zIndex: 999999999,

  // Debug enabled: send `console` messages with deprecation warnings, etc.
  debug: true,

  // Sets the title of the `div` encapsulating the Flash object
  title: null,

  // Setting this to `false` would allow users to handle calling `ZeroClipboard.activate(...);`
  // themselves instead of relying on our per-element `mouseover` handler
  autoActivate: true
};


/*
 * Update or get a copy of the ZeroClipboard global configuration.
 *
 * returns a copy of the updated configuration
 */
ZeroClipboard.config = function (options) {
  if (typeof options === "object" && options !== null) {
    _extend(_globalConfig, options);
  }
  if (typeof options === "string" && options) {
    if (_globalConfig.hasOwnProperty(options)) {
      return _globalConfig[options];
    }
    // else `return undefined;`
    return;
  }
  // Make a deep copy of the config object
  var copy = {};
  for (var prop in _globalConfig) {
    if (_globalConfig.hasOwnProperty(prop)) {
      if (typeof _globalConfig[prop] === "object" && _globalConfig[prop] !== null) {
        if ("length" in _globalConfig[prop]) {
          copy[prop] = _globalConfig[prop].slice(0);
        }
        else {
          copy[prop] = _extend({}, _globalConfig[prop]);
        }
      }
      else {
        copy[prop] = _globalConfig[prop];
      }
    }
  }
  return copy;
};


/*
 * Self-destruction and clean up everything
 *
 * returns nothing
 */
ZeroClipboard.destroy = function () {
  // Deactivate the active element, if any
  ZeroClipboard.deactivate();

  // Invoke `destroy` on each client instance
  for (var clientId in _clientMeta) {
    if (_clientMeta.hasOwnProperty(clientId) && _clientMeta[clientId]) {
      var client = _clientMeta[clientId].instance;
      if (client && typeof client.destroy === "function") {
        client.destroy();
      }
    }
  }

  // Remove the Flash bridge
  var htmlBridge = _getHtmlBridge(flashState.bridge);
  if (htmlBridge && htmlBridge.parentNode) {
    htmlBridge.parentNode.removeChild(htmlBridge);
    flashState.ready = null;
    flashState.bridge = null;
  }
};


/*
 * Sets the current HTML object that the Flash object should overlay. This will put the global Flash object on top of
 * the current element; depending on the setup, this may also set the pending clipboard text data as well as the Flash
 * object's wrapping element's title attribute based on the underlying HTML element and ZeroClipboard configuration.
 *
 * returns nothing
 */
ZeroClipboard.activate = function(element) {
  // "Ignore" the currently active element
  if (currentElement) {
    _removeClass(currentElement, _globalConfig.hoverClass);
    _removeClass(currentElement, _globalConfig.activeClass);
  }

  // Mark the element as currently activated
  currentElement = element;

  // Add the hover class
  _addClass(element, _globalConfig.hoverClass);

  // Move the Flash object
  _reposition();

  // If the element has a title, mimic it
  var newTitle = _globalConfig.title || element.getAttribute("title");
  if (newTitle) {
    var htmlBridge = _getHtmlBridge(flashState.bridge);
    if (htmlBridge) {
      htmlBridge.setAttribute("title", newTitle);
    }
  }

  // If the element has a pointer style, set to hand cursor
  var useHandCursor = _globalConfig.forceHandCursor === true || _getStyle(element, "cursor") === "pointer";
  // Update the hand cursor state without updating the `forceHandCursor` option
  _setHandCursor(useHandCursor);
};


/*
 * Un-overlays the Flash object. This will put the global Flash object off-screen; depending on the setup, this may
 * also unset the Flash object's wrapping element's title attribute based on the underlying HTML element and
 * ZeroClipboard configuration.
 *
 * returns nothing
 */
ZeroClipboard.deactivate = function() {
  // Hide the Flash object off-screen
  var htmlBridge = _getHtmlBridge(flashState.bridge);
  if (htmlBridge) {
    htmlBridge.style.left = "0px";
    htmlBridge.style.top = "-9999px";
    htmlBridge.removeAttribute("title");
  }

  // "Ignore" the currently active element
  if (currentElement) {
    _removeClass(currentElement, _globalConfig.hoverClass);
    _removeClass(currentElement, _globalConfig.activeClass);
    currentElement = null;
  }
};