ZeroClipboard.version = "<%= version %>";

// ZeroClipboard options defaults
var _globalConfig = {
  // URL to movie, relative to the page. Default value will be "ZeroClipboard.swf" under the
  // same path as the ZeroClipboard JS file.
  swfPath: _swfPath,

  // SWF inbound scripting policy: page domains that the SWF should trust. (single string or array of strings)
  trustedDomains: window.location.host ? [window.location.host] : [],

  // Include a "nocache" query parameter on requests for the SWF
  cacheBust: true,

  // Forcibly set the hand cursor ("pointer") for all clipped elements
  forceHandCursor: false,

  // Enable use of the fancy "Desktop" clipboard, even on Linux where it is known to suck
  forceEnhancedClipboard: false,

  // The z-index used by the Flash object. Max value (32-bit): 2147483647
  zIndex: 999999999,

  // Debug enabled: send `console` messages with deprecation warnings, etc.
  debug: false,

  // Sets the title of the `div` encapsulating the Flash object
  title: null,

  // Setting this to `false` would allow users to handle calling `ZeroClipboard.activate(...);`
  // themselves instead of relying on our per-element `mouseover` handler
  autoActivate: true,

  // How many milliseconds to wait for the Flash SWF to load and respond before assuming that
  // Flash is deactivated (e.g. click-to-play) in the user's browser. If you don't care about
  // how long it takes to load the SWF, you can set this to `null`.
  flashLoadTimeout: 30000

};


/*
 * Check if Flash is unusable for any reason: disabled, outdated, deactivated, etc.
 *
 * returns true if Flash should NOT be considered usable, otherwise false
 */
ZeroClipboard.isFlashUnusable = function() {
  return !!(
    flashState.disabled ||
    flashState.outdated ||
    flashState.unavailable ||
    flashState.deactivated
  );
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
  // Return a deep copy of the config object
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
  var flashBridge = flashState.bridge;
  if (flashBridge) {
    var htmlBridge = _getHtmlBridge(flashBridge);
    if (htmlBridge) {
      // Some extra caution is necessary to prevent Flash from causing memory leaks in oldIE
      // NOTE: Removing the SWF in IE may not be completed synchronously
      if (flashState.pluginType === "activex" && "readyState" in flashBridge) {
        flashBridge.style.display = "none";
        (function removeSwfFromIE() {
          if (flashBridge.readyState === 4) {
            // This step prevents memory leaks in oldIE
            for (var prop in flashBridge) {
              if (typeof flashBridge[prop] === "function") {
                flashBridge[prop] = null;
              }
            }
            flashBridge.parentNode.removeChild(flashBridge);
            if (htmlBridge.parentNode) {
              htmlBridge.parentNode.removeChild(htmlBridge);
            }
          }
          else {
            setTimeout(removeSwfFromIE, 10);
          }
        })();
      }
      else {
        flashBridge.parentNode.removeChild(flashBridge);
        if (htmlBridge.parentNode) {
          htmlBridge.parentNode.removeChild(htmlBridge);
        }
      }
    }
    flashState.ready = null;
    flashState.bridge = null;
    // Reset the `deactivated` status in case the user wants to "try again", e.g. after receiving
    // an `overdueFlash` event
    flashState.deactivated = null;
  }

  // Clear out any pending data
  ZeroClipboard.clearData();
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
    htmlBridge.removeAttribute("title");
    htmlBridge.style.left = "0px";
    htmlBridge.style.top = "-9999px";
    _setSize(1, 1);
  }

  // "Ignore" the currently active element
  if (currentElement) {
    _removeClass(currentElement, _globalConfig.hoverClass);
    _removeClass(currentElement, _globalConfig.activeClass);
    currentElement = null;
  }
};


/*
 * Diagnostic method that describes the state of the browser, Flash Player, and ZeroClipboard.
 *
 * return object
 */
ZeroClipboard.state = function() {
  return {
    browser: _pick(window.navigator, ["userAgent", "platform", "appName"]),
    flash: _omit(flashState, ["bridge"]),
    zeroclipboard: {
      version: ZeroClipboard.version,
      config: ZeroClipboard.config()
    }
  };
};


/**
 * Set the pending data for clipboard injection.
 *
 * @return undefined
 * @static
 */
ZeroClipboard.setData = function(format, data) {
  var dataObj;

  if (typeof format === "object" && format && typeof data === "undefined") {
    dataObj = format;

    // Clear out existing pending data if an object is provided
    ZeroClipboard.clearData();
  }
  else if (typeof format === "string" && format) {
    dataObj = {};
    dataObj[format] = data;
  }
  else {
    return;
  }

  // Copy over owned properties with non-empty string values
  for (var dataFormat in dataObj) {
    if (dataFormat && dataObj.hasOwnProperty(dataFormat) && typeof dataObj[dataFormat] === "string" && dataObj[dataFormat]) {
      _clipData[dataFormat] = dataObj[dataFormat];
    }
  }
};


/**
 * Clear the pending data for clipboard injection.
 *
 * @return undefined
 * @static
 */
ZeroClipboard.clearData = function(format) {
  // If no format is passed, delete all of the pending data
  if (typeof format === "undefined") {
    _deleteOwnProperties(_clipData);
    _clipDataFormatMap = null;
  }
  // Otherwise, delete only the pending data of the specified format
  else if (typeof format === "string" && _clipData.hasOwnProperty(format)) {
    delete _clipData[format];
  }
};
