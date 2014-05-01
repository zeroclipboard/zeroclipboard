/*
 * Event emission bridge from the Flash object, forwarding to relevant JavaScript client instances.
 *
 * returns nothing, or `_clipData` in response to a `copy` event.
 */
ZeroClipboard.emit = function (event) {
  var eventType, eventObj, performCallbackAsync, clients, i, len, eventCopy, returnVal, tmp;
  if (typeof event === "string" && event) {
    eventType = event;
  }
  if (typeof event === "object" && event && typeof event.type === "string" && event.type) {
    eventType = event.type;
    eventObj = event;
  }

  // Bail if we don't have an event type
  if (!eventType) {
    return;
  }

  // Create an event object for this event type
  event = _createEvent(eventType, eventObj);

  // Preprocess any special behaviors, reactions, or state changes after receiving this event
  _preprocessEvent(event);

  // If this was a Flash "ready" event that was overdue, bail out and fire an "error" event instead
  if (event.type === "ready" && _flashState.overdue === true) {
    return ZeroClipboard.emit({ "type": "error", "name": "flash-overdue" });
  }

  // Determine if the event handlers for this event can be performed asynchronously.
  //  - `beforecopy`: This event's callback cannot be performed asynchronously because the
  //                  subsequent `copy` event cannot.
  //  - `copy`: This event's callback cannot be performed asynchronously as it would prevent the
  //            user from being able to call `.setText` successfully before the pending clipboard
  //            injection associated with this event fires.
  //  - The handlers for all other event types should be performed asynchronously.
  performCallbackAsync = !/^(before)?copy$/.test(event.type);

  // If a particular `client` is already identified, assume the event is limited to just that client
  if (event.client) {
    _dispatchClientCallbacks.call(event.client, event, performCallbackAsync);
  }
  // Get an array of clients that have been clipped to the `_currentElement`, or
  // get ALL clients if no `_currentElement` (e.g. for the global Flash events like "load", etc.)
  else {
    clients = (event.target && event.target !== window && _globalConfig.autoActivate === true) ?
                _getAllClientsClippedToElement(event.target) :
                _getAllClients();
    for (i = 0, len = clients.length; i < len; i++) {
      eventCopy = _extend({}, event, { client: clients[i] });
      _dispatchClientCallbacks.call(clients[i], eventCopy, performCallbackAsync);
    }
  }

  // For the `copy` event, be sure to return the `_clipData` to Flash to be injected into the clipboard
  if (event.type === "copy") {
    tmp = _mapClipDataToFlash(_clipData);
    returnVal = tmp.data;
    _clipDataFormatMap = tmp.formatMap;
  }
  return returnVal;
};


/**
 * Handle the actual dispatching of events to client instances.
 *
 * returns object instance
 */
var _dispatchClientCallbacks = function(event, async) {
  // User defined handlers for events
  var handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers[event.type];
  if (handlers && handlers.length) {
    var i, len, func, context,
        originalContext = this;
    for (i = 0, len = handlers.length; i < len; i++) {
      func = handlers[i];
      context = originalContext;

      // If the user provided a string for their callback, grab that function
      if (typeof func === "string" && typeof window[func] === "function") {
        func = window[func];
      }
      if (typeof func === "object" && func && typeof func.handleEvent === "function") {
        context = func;
        func = func.handleEvent;
      }
      if (typeof func === "function") {
        // actual function reference
        _dispatchCallback(func, context, [event], async);
      }
    }
  }
  return this;
};


/**
 * The `message` store for events
 * @private
 */
var _eventMessages = {
  "ready": "Flash communication is established",
  "error": {
    "flash-disabled": "Flash is disabled or not installed",
    "flash-outdated": "Flash is too outdated to support ZeroClipboard",
    "flash-unavailable": "Flash is unable to communicate bidirectionally with JavaScript",
    "flash-deactivated": "Flash is too outdated for your browser and/or is configured as click-to-activate",
    "flash-overdue": "Flash communication was established but NOT within the acceptable time limit"
  }
};

/**
 * Create or update an `event` object based on the `eventType`.
 * @private
 */
var _createEvent = function(eventType, event) {
  // Bail if we don't have an event type
  if (!(eventType || (event && event.type))) {
    return;
  }

  // Default the `event` object and sanitize the event type
  event = event || {};
  eventType = (eventType || event.type).toLowerCase();

  // Sanitize the event name and set the `target` and `relatedTarget` properties if not already set
  _extend(event, {
    type: eventType,
    target: event.target || _currentElement || null,
    relatedTarget: event.relatedTarget || null,
    currentTarget: (_flashState && _flashState.bridge) || null
  });

  var msg = _eventMessages[event.type];
  if (event.type === "error" && event.name && msg) {
    msg = msg[event.name];
  }
  if (msg) {
    event.message = msg;
  }

  if (event.type === "ready") {
    _extend(event, {
      target: null,
      version: _flashState.version
    });
  }

  if (event.type === "error") {
    event.target = null;

    if (/^flash-(outdated|unavailable|deactivated|overdue)$/.test(event.name)) {
      _extend(event, {
        version: _flashState.version,
        minimumVersion: "11.0.0"
      });
    }
  }

  // Add all of the special properties and methods for a `copy` event
  if (event.type === "copy") {
    event.clipboardData = {
      setData: ZeroClipboard.setData,
      clearData: ZeroClipboard.clearData
    };
  }

  if (event.type === "aftercopy") {
    event = _mapClipResultsFromFlash(event, _clipDataFormatMap);
  }

  if (event.target && !event.relatedTarget) {
    event.relatedTarget = _getRelatedTarget(event.target);
  }

  return event;
};


/**
 * Get a relatedTarget from the target's `data-clipboard-target` attribute
 * @private
 */
var _getRelatedTarget = function(targetEl) {
  var relatedTargetId = targetEl && targetEl.getAttribute && targetEl.getAttribute("data-clipboard-target");
  return relatedTargetId ? document.getElementById(relatedTargetId) : null;
};


/**
 * Preprocess any special behaviors, reactions, or state changes after receiving this event.
 * Executes only once per event emitted, NOT once per client.
 * @private
 */
var _preprocessEvent = function (event) {
  var element = event.target || _currentElement;
  switch (event.type) {
    case "error":
      if (_inArray(event.name, ["flash-disabled", "flash-outdated", "flash-deactivated", "flash-overdue"])) {
        _extend(_flashState, {
          disabled:    event.name === "flash-disabled",
          outdated:    event.name === "flash-outdated",
          unavailable: event.name === "flash-unavailable",
          deactivated: event.name === "flash-deactivated",
          overdue:     event.name === "flash-overdue",
          ready:       false
        });
      }
      break;

    case "ready":
      var wasDeactivated = _flashState.deactivated === true;
      _extend(_flashState, {
        disabled:    false,
        outdated:    false,
        unavailable: false,
        deactivated: false,
        overdue:     wasDeactivated,
        ready:       !wasDeactivated
      });
      break;

    case "copy":
      var textContent,
          htmlContent,
          targetEl = event.relatedTarget;
      if (
        !(_clipData["text/html"] || _clipData["text/plain"]) &&
        targetEl &&
        (htmlContent = targetEl.value || targetEl.outerHTML || targetEl.innerHTML) &&
        (textContent = targetEl.value || targetEl.textContent || targetEl.innerText)
      ) {
        event.clipboardData.clearData();
        event.clipboardData.setData("text/plain", textContent);
        if (htmlContent !== textContent) {
          event.clipboardData.setData("text/html", htmlContent);
        }
      }
      else if (!_clipData["text/plain"] && event.target && (textContent = event.target.getAttribute("data-clipboard-text"))) {
        event.clipboardData.clearData();
        event.clipboardData.setData("text/plain", textContent);
      }
      break;

    case "aftercopy":
      // If the copy has [or should have] occurred, clear out all of the data
      ZeroClipboard.clearData();

      // Focus the context back on the trigger element (blur the Flash element)
      if (element && element !== _safeActiveElement() && element.focus) {
        element.focus();
      }
      break;

    /** @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives. */
    // NOTE: This `mouseover` event is coming from Flash, not DOM/JS
    case "mouseover":
      _addClass(element, _globalConfig.hoverClass);
      break;

    /** @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives. */
    // NOTE: This `mouseout` event is coming from Flash, not DOM/JS
    case "mouseout":
      if (_globalConfig.autoActivate === true) {
        ZeroClipboard.deactivate();
      }
      break;

    /** @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives. */
    // NOTE: This `mousedown` event is coming from Flash, not DOM/JS
    case "mousedown":
      _addClass(element, _globalConfig.activeClass);
      break;

    /** @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives. */
    // NOTE: This `mouseup` event is coming from Flash, not DOM/JS
    case "mouseup":
      _removeClass(element, _globalConfig.activeClass);
      break;
  } // end `switch`
};


/*
 * Add an event handler to the client.
 *
 * returns object instance
 */
ZeroClipboard.prototype.on = function (eventName, func) {
  // add user event handler for event
  var i, len, events,
      added = {},
      handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;

  if (typeof eventName === "string" && eventName) {
    events = eventName.toLowerCase().split(/\s+/);
  }
  else if (typeof eventName === "object" && eventName && typeof func === "undefined") {
    for (i in eventName) {
      if (eventName.hasOwnProperty(i) && typeof i === "string" && i && typeof eventName[i] === "function") {
        this.on(i, eventName[i]);
      }
    }
  }

  if (events && events.length) {
    for (i = 0, len = events.length; i < len; i++) {
      eventName = events[i].replace(/^on/, "");
      added[eventName] = true;
      if (!handlers[eventName]) {
        handlers[eventName] = [];
      }
      handlers[eventName].push(func);
    }

    // The following events must be memorized and fired immediately if relevant as they only occur
    // once per Flash object load.

    // If the SWF was already loaded, we're à gogo!
    if (added.ready && _flashState.ready) {
      ZeroClipboard.emit({
        type: "ready",
        client: this
      });
    }
    if (added.error) {
      var errorTypes = ["disabled", "outdated", "unavailable", "deactivated", "overdue"];
      for (i = 0, len = errorTypes.length; i < len; i++) {
        if (_flashState[errorTypes[i]]) {
          ZeroClipboard.emit({
            type: "error",
            name: "flash-" + errorTypes[i],
            client: this
          });
          break;
        }
      }
    }
  }

  return this;
};

/*
 * Remove an event handler from the client.
 * If no handler function/object is provided, it will remove all handlers for the provided event type.
 * If no event name is provided, it will remove all handlers for every event type.
 *
 * returns object instance
 */
ZeroClipboard.prototype.off = function (eventName, func) {
  var i, len, foundIndex, events, perEventHandlers,
      handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
  if (arguments.length === 0) {
    // Remove ALL of the handlers for ALL event types
    events = _objectKeys(handlers);
  }
  else if (typeof eventName === "string" && eventName) {
    events = eventName.split(/\s+/);
  }
  else if (typeof eventName === "object" && eventName && typeof func === "undefined") {
    for (i in eventName) {
      if (eventName.hasOwnProperty(i) && typeof i === "string" && i && typeof eventName[i] === "function") {
        this.off(i, eventName[i]);
      }
    }
  }

  if (events && events.length) {
    for (i = 0, len = events.length; i < len; i++) {
      eventName = events[i].toLowerCase().replace(/^on/, "");
      perEventHandlers = handlers[eventName];
      if (perEventHandlers && perEventHandlers.length) {
        if (func) {
          foundIndex = _inArray(func, perEventHandlers);
          while (foundIndex !== -1) {
            perEventHandlers.splice(foundIndex, 1);
            foundIndex = _inArray(func, perEventHandlers, foundIndex);
          }
        }
        else {
          // If no `func` was provided, remove ALL of the handlers for this event type
          handlers[eventName].length = 0;
        }
      }
    }
  }
  return this;
};


/*
 * Retrieve event handlers for an event type from the client.
 * If no event name is provided, it will remove all handlers for every event type.
 *
 * returns array of handlers for the event type; if no event type, then a map/hash object of handlers for all event types; or `null`
 */
ZeroClipboard.prototype.handlers = function (eventName) {
  var prop,
      copy = null,
      handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;

  if (handlers) {
    if (typeof eventName === "string" && eventName) {
      return handlers[eventName] ? handlers[eventName].slice(0) : null;
    }

    // Make a deep copy of the handlers object
    copy = {};
    for (prop in handlers) {
      if (handlers.hasOwnProperty(prop) && handlers[prop]) {
        copy[prop] = handlers[prop].slice(0);
      }
    }
  }
  return copy;
};


/*
 * Register new element(s) to the object.
 *
 * returns object instance
 */
ZeroClipboard.prototype.clip = function (elements) {

  elements = _prepClip(elements);

  for (var i = 0; i < elements.length ; i++) {
    if (elements.hasOwnProperty(i) && elements[i] && elements[i].nodeType === 1) {
      // If the element hasn't been clipped to ANY client yet, add a metadata ID and event handler
      if (!elements[i].zcClippingId) {
        elements[i].zcClippingId = "zcClippingId_" + (_elementIdCounter++);
        _elementMeta[elements[i].zcClippingId] = [this.id];
        if (_globalConfig.autoActivate === true) {
          _addEventHandler(elements[i], "mouseover", _elementMouseOver);
        }
      }
      else if (_inArray(this.id, _elementMeta[elements[i].zcClippingId]) === -1) {
        _elementMeta[elements[i].zcClippingId].push(this.id);
      }

      // If the element hasn't been clipped to THIS client yet, add it
      var clippedElements = _clientMeta[this.id].elements;
      if (_inArray(elements[i], clippedElements) === -1) {
        clippedElements.push(elements[i]);
      }
    }
  }

  return this;
};

/*
 * Unregister the clipboard actions of previously registered element(s) on the page.
 * If no elements are provided, ALL registered elements will be unregistered.
 *
 * returns object instance
 */
ZeroClipboard.prototype.unclip = function (elements) {
  var meta = _clientMeta[this.id];

  if (!meta) {
    return this;
  }

  var clippedElements = meta.elements;
  var arrayIndex;

  // if no elements were provided, unclip ALL of this client's clipped elements
  if (typeof elements === "undefined") {
    elements = clippedElements.slice(0);
  }
  else {
    elements = _prepClip(elements);
  }

  for (var i = elements.length; i--; ) {
    if (elements.hasOwnProperty(i) && elements[i] && elements[i].nodeType === 1) {
      // If the element was clipped to THIS client yet, remove it
      arrayIndex = 0;
      while ((arrayIndex = _inArray(elements[i], clippedElements, arrayIndex)) !== -1) {
        clippedElements.splice(arrayIndex, 1);
      }

      // If the element isn't clipped to ANY other client, remove its metadata ID and event handler
      var clientIds = _elementMeta[elements[i].zcClippingId];
      if (clientIds) {
        arrayIndex = 0;
        while ((arrayIndex = _inArray(this.id, clientIds, arrayIndex)) !== -1) {
          clientIds.splice(arrayIndex, 1);
        }
        if (clientIds.length === 0) {
          if (_globalConfig.autoActivate === true) {
            _removeEventHandler(elements[i], "mouseover", _elementMouseOver);
          }
          delete elements[i].zcClippingId;
        }
      }
    }
  }
  return this;
};


/*
 * Get all of the elements to which this client is clipped.
 *
 * returns array of clipped elements
 */
ZeroClipboard.prototype.elements = function () {
  var meta = _clientMeta[this.id];
  return (meta && meta.elements) ? meta.elements.slice(0) : [];
};


/*
 * Get all of the clients that are clipped to an element.
 *
 * returns array of clients
 */
var _getAllClientsClippedToElement = function (element) {
  var elementMetaId, clientIds, i, len, client,
      clients = [];
  if (element && element.nodeType === 1 && (elementMetaId = element.zcClippingId) && _elementMeta.hasOwnProperty(elementMetaId)) {
    clientIds = _elementMeta[elementMetaId];
    if (clientIds && clientIds.length) {
      for (i = 0, len = clientIds.length; i < len; i++) {
        client = _clientMeta[clientIds[i]].instance;
        if (client && client instanceof ZeroClipboard) {
          clients.push(client);
        }
      }
    }
  }
  return clients;
};
