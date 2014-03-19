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
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Include a "nocache" query parameter on requests for the SWF
 *
 * Originally from "core.js"
 */
_globalConfig.useNoCache = true;


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * URL to movie
 *
 * Originally from "core.js"
 */
_globalConfig.moviePath = "ZeroClipboard.swf";


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Bridge from the Flash object back to the JavaScript
 *
 * returns nothing
 *
 * Originally from "event.js"
 */
ZeroClipboard.dispatch = function (eventName, args) {
  if (typeof eventName === "string" && eventName) {
    // Sanitize the event name
    var cleanEventName = eventName.toLowerCase().replace(/^on/, "");

    // Receive event from Flash movie, forward to clients
    if (cleanEventName) {
      // Get an array of clients that have been glued to the `currentElement`, or
      // get ALL clients if no `currentElement` (e.g. for the global Flash events like "load", etc.)
      var clients = (currentElement && _globalConfig.autoActivate === true) ?
                      _getAllClientsClippedToElement(currentElement) :
                      _getAllClients();
      for (var i = 0, len = clients.length; i < len; i++) {
        _receiveEvent.call(clients[i], cleanEventName, args);
      }
    }
  }
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
ZeroClipboard.prototype.addEventListener = function (eventName, func) {
  _deprecationWarning("ZeroClipboard.prototype.addEventListener", _globalConfig.debug);
  return this.on(eventName, func);
};


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * An original API method name, now only an alias for `off`.
 *
 * returns object instance
 */
ZeroClipboard.prototype.removeEventListener = function (eventName, func) {
  _deprecationWarning("ZeroClipboard.prototype.removeEventListener", _globalConfig.debug);
  return this.off(eventName, func);
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


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0].
 * @private
 *
 * Receive an event from Flash for a specific element/client.
 *
 * returns object instance
 *
 * Originally from "event.js"
 */
var _receiveEvent = function (eventName, args) {
  args = args || {};
  eventName = eventName.toLowerCase().replace(/^on/, '');

  var element = currentElement;
  var context = element;
  var performCallbackAsync = true;

  // special behavior for certain events
  switch (eventName) {
    case 'load':
      // If it took longer the `_globalConfig.flashLoadTimeout` milliseconds to receive
      // this `load` event, Flash will have been marked as "deactivated" by ZeroClipboard.
      // If that is the case:
      //   1. Remove the `deactivated` status (blocker)
      //   2. Add the `overdue` status (non-blocker)
      //   3. Fire an `overdueFlash` event instead of the `load` event
      var isOverdue = flashState.deactivated || flashState.overdue || flashState.ready === null || flashState.bridge === null;

      // SWF loaded successfully, so it shouldn't be considered `deactivated` even if it was
      // overdue on click-to-play authorization
      flashState.deactivated = false;

      if (isOverdue) {
        flashState.overdue = true;
        return _receiveEvent.call(this, 'overdueFlash');
      }

      flashState.ready = true;
      context = null;
      args.flashVersion = flashState.version;
      break;

    case 'noflash':
      flashState.ready = false;
      context = null;
      break;

    case 'wrongflash':
    case 'deactivatedflash':
    case 'overdueflash':
      flashState.ready = false;
      context = null;
      args.flashVersion = flashState.version;
      break;

    // NOTE: This `mouseover` event is coming from Flash, not DOM/JS
    case 'mouseover':
      _addClass(element, _globalConfig.hoverClass);
      break;

    // NOTE: This `mouseout` event is coming from Flash, not DOM/JS
    case 'mouseout':
      if (_globalConfig.autoActivate === true) {
        ZeroClipboard.deactivate();
      }
      break;

    // NOTE: This `mousedown` event is coming from Flash, not DOM/JS
    case 'mousedown':
      _addClass(element, _globalConfig.activeClass);
      break;

    // NOTE: This `mouseup` event is coming from Flash, not DOM/JS
    case 'mouseup':
      _removeClass(element, _globalConfig.activeClass);
      break;

    case 'datarequested':
      if (element) {
        var targetId = element.getAttribute('data-clipboard-target'),
            targetEl = !targetId ? null : document.getElementById(targetId);
        if (targetEl) {
          var textContent = targetEl.value || targetEl.textContent || targetEl.innerText;
          if (textContent) {
            this.setText(textContent);
          }
        }
        else {
          var defaultText = element.getAttribute('data-clipboard-text');
          if (defaultText) {
            this.setText(defaultText);
          }
        }
      }

      // This callback cannot be performed asynchronously as it would prevent the
      // user from being able to call `.setText` successfully before the pending
      // clipboard injection associated with this event fires.
      performCallbackAsync = false;
      break;

    case 'complete':
      _deleteOwnProperties(_clipData);

      // Focus the context back on the trigger element (blur the Flash element)
      if (element && element !== _safeActiveElement() && element.focus) {
        element.focus();
      }
      break;
  } // switch eventName

  context = context || window;
  var eventArgs = [this, args];
  return _dispatchClientCallbacks.call(this, eventName, context, eventArgs, performCallbackAsync);
};