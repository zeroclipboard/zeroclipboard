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
      eventName = events[i].replace(/^on/, '');
      added[eventName] = true;
      if (!handlers[eventName]) {
        handlers[eventName] = [];
      }
      handlers[eventName].push(func);
    }

    // The following events must be memorized and fired immediately if relevant as they only occur
    // once per Flash object load.

    // If we don't have Flash, tell an adult
    if (added.noflash && flashState.disabled) {
      _receiveEvent.call(this, "noflash", {});
    }
    // If we have old Flash, cry about it
    if (added.wrongflash && flashState.outdated) {
      _receiveEvent.call(this, "wrongflash", {
        flashVersion: flashState.version
      });
    }
    // If the SWF was already loaded, we're à gogo!
    if (added.load && flashState.ready) {
      _receiveEvent.call(this, "load", {
        flashVersion: flashState.version
      });
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


/**
 * Handle the actual dispatching of events to client instances.
 *
 * returns object instance
 */
var _dispatchClientCallbacks = function(eventName, context, args, async) {
  // User defined handlers for events
  var handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers[eventName];
  if (handlers && handlers.length) {
    var i, len, func,
        originalContext = context || this;
    for (i = 0, len = handlers.length; i < len; i++) {
      func = handlers[i];
      context = originalContext;

      // If the user provided a string for their callback, grab that function
      if (typeof func === 'string' && typeof window[func] === 'function') {
        func = window[func];
      }
      if (typeof func === 'object' && func && typeof func.handleEvent === 'function') {
        context = func;
        func = func.handleEvent;
      }
      if (typeof func === 'function') {
        // actual function reference
        _dispatchCallback(func, context, args, async);
      }
    }
  }
  return this;
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
        elements[i].zcClippingId = "zcClippingId_" + (elementIdCounter++);
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

  if (meta) {
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
