/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * The CSS class used to indicate that the object is being hovered over. Similar to `:hover`.
 *
 * Originally from "core.js"
 */
_globalConfig.hoverClass = "zeroclipboard-is-hover";


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * The CSS class used to indicate that the object is active. Similar to `:active`.
 *
 * Originally from "core.js"
 */
_globalConfig.activeClass = "zeroclipboard-is-active";


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Page origins that the SWF should trust (single string or array of strings)
 *
 * Originally from "core.js"
 */
_globalConfig.trustedOrigins = null;


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for more info.
 *
 * SWF outbound scripting policy
 *
 * Originally from "core.js"
 */
_globalConfig.allowScriptAccess = null;


/*
 * @deprecated in [v1.2.0], slated for removal in [v2.0.0]. See docs for more info.
 *
 * Simple Flash Detection
 *
 * returns true if Flash is detected, otherwise false
 *
 * Originally from "core.js", then "flash.js"
 */
ZeroClipboard.detectFlashSupport = function () {
  var debugEnabled = _globalConfig.debug;
  _deprecationWarning("ZeroClipboard.detectFlashSupport", debugEnabled);
  return _detectFlashSupport();
};


/*
 * @deprecated in [v1.2.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Sends a signal to the flash object to display the hand cursor if true.
 * Updates the value of the `forceHandCursor` option.
 *
 * returns object instance
 */
ZeroClipboard.prototype.setHandCursor = function (enabled) {
  _deprecationWarning("ZeroClipboard.prototype.setHandCursor", _globalConfig.debug);
  enabled = typeof enabled === "boolean" ? enabled : !!enabled;
  _setHandCursor(enabled);
  _globalConfig.forceHandCursor = enabled;

  return this;
};


/*
 * @deprecated in [v1.2.0], slated for removal in [v2.0.0]. See docs for more info.
 *
 * Reposition the Flash object to cover the current element being hovered over.
 *
 * returns object instance
 */
ZeroClipboard.prototype.reposition = function () {
  _deprecationWarning("ZeroClipboard.prototype.reposition", _globalConfig.debug);
  return _reposition();
};



/*
 * @deprecated in [v1.2.0], slated for removal in [v2.0.0]. See docs for more info.
 *
 * Receive an event for a specific client, typically from Flash.
 *
 * returns nothing
 */
ZeroClipboard.prototype.receiveEvent = function (eventName, args) {
  _deprecationWarning("ZeroClipboard.prototype.receiveEvent", _globalConfig.debug);
  if (typeof eventName === "string" && eventName) {
    // Sanitize the event name
    var cleanEventName = eventName.toLowerCase().replace(/^on/, "");

    // receive event from Flash movie, send to client
    if (cleanEventName) {
      _receiveEvent.call(this, cleanEventName, args);
    }
  }
};


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Sets the current HTML object that the Flash object should overlay. This will put the global Flash object on top of
 * the current element; depending on the setup, this may also set the pending clipboard text data as well as the Flash
 * object's wrapping element's title attribute based on the underlying HTML element and ZeroClipboard configuration.
 *
 * returns object instance
 */
ZeroClipboard.prototype.setCurrent = function (element) {
  _deprecationWarning("ZeroClipboard.prototype.setCurrent", _globalConfig.debug);
  ZeroClipboard.activate(element);
  return this;
};


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Reset the html bridge to be hidden off screen and not have title or text.
 *
 * returns object instance
 */
ZeroClipboard.prototype.resetBridge = function () {
  _deprecationWarning("ZeroClipboard.prototype.resetBridge", _globalConfig.debug);
  ZeroClipboard.deactivate();
  return this;
};


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Adds a title="..." attribute to the htmlBridge to give it tooltip capabilities
 *
 * returns object instance
 */
ZeroClipboard.prototype.setTitle = function (newTitle) {
  _deprecationWarning("ZeroClipboard.prototype.setTitle", _globalConfig.debug);
  // If the element has a title, mimic it
  newTitle = newTitle || _globalConfig.title || (currentElement && currentElement.getAttribute("title"));
  if (newTitle) {
    var htmlBridge = _getHtmlBridge(flashState.bridge);
    if (htmlBridge) {
      htmlBridge.setAttribute("title", newTitle);
    }
  }

  return this;
};


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Set defaults.
 *
 * returns nothing
 */
ZeroClipboard.setDefaults = function (options) {
  _deprecationWarning("ZeroClipboard.setDefaults", _globalConfig.debug);
  ZeroClipboard.config(options);
};


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * An original API method name, now only an alias for `on`.
 *
 * returns object instance
 */
ZeroClipboard.prototype.addEventListener = function() {
  _deprecationWarning("ZeroClipboard.prototype.addEventListener", _globalConfig.debug);
  return this.on.apply(this, [].slice.call(arguments, 0));
};


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * An original API method name, now only an alias for `off`.
 *
 * returns object instance
 */
ZeroClipboard.prototype.removeEventListener = function() {
  _deprecationWarning("ZeroClipboard.prototype.removeEventListener", _globalConfig.debug);
  return this.off.apply(this, [].slice.call(arguments, 0));
};


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for more info.
 *
 * Helper function to determine if the Flash bridge is ready. Gets this info from
 * a per-bridge status tracker.
 *
 * returns true if the Flash bridge is ready
 */
ZeroClipboard.prototype.ready = function () {
  _deprecationWarning("ZeroClipboard.prototype.ready", _globalConfig.debug);
  return flashState.ready === true;
};