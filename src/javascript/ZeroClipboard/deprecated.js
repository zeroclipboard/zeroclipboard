/*
 * @deprecated in [v1.2.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Simple Flash Detection
 *
 * returns true if Flash is detected, otherwise false
 *
 * Originally from "core.js", then "flash.js"
 */
ZeroClipboard.detectFlashSupport = function () {
  var debugEnabled = (ZeroClipboard.prototype._singleton && ZeroClipboard.prototype._singleton.options.debug) || _defaults.debug;
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
  _deprecationWarning("ZeroClipboard.prototype.setHandCursor", this.options.debug);
  enabled = typeof enabled === "boolean" ? enabled : !!enabled;
  _setHandCursor.call(this, enabled);
  this.options.forceHandCursor = enabled;

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
  _deprecationWarning("ZeroClipboard.prototype.reposition", this.options.debug);
  return _reposition.call(this);
};



/*
 * @deprecated in [v1.2.0], slated for removal in [v2.0.0]. See docs for more info.
 *
 * Receive an event for a specific client, typically from Flash.
 *
 * returns nothing
 */
ZeroClipboard.prototype.receiveEvent = function (eventName, args) {
  _deprecationWarning("ZeroClipboard.prototype.receiveEvent", this.options.debug);
  if (typeof eventName === "string" && eventName) {
    // Sanitize the event name
    var cleanEventName = eventName.toLowerCase().replace(/^on/, "");

    // receive event from Flash movie, send to client
    if (cleanEventName) {
      _receiveEvent.call(this, cleanEventName, args);
    }
  }
};