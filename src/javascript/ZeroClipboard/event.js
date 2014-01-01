/*
 * Bridge from the Flash object back to the JavaScript
 *
 * returns nothing
 */
ZeroClipboard.dispatch = function (eventName, args) {
  if (typeof eventName === "string" && eventName) {
    // Sanitize the event name
    var cleanEventName = eventName.toLowerCase().replace(/^on/, "");

    // Receive event from Flash movie, forward to clients
    if (cleanEventName) {
      // Get an array of clients that have been glued to the `currentElement`, or
      // get ALL clients if no `currentElement` (e.g. for the global Flash events like "load", etc.)
      var clients = currentElement ? _getAllClientsGluedToElement(currentElement) : _getAllClients();
      for (var i = 0, len = clients.length; i < len; i++) {
        _receiveEvent.call(clients[i], cleanEventName, args);
      }
    }
  }
};

/*
 * Add an event handler to the client.
 *
 * returns object instance
 */
ZeroClipboard.prototype.on = function (eventName, func) {
  // add user event handler for event
  var events = eventName.toString().split(/\s+/),
      added = {},
      handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
  for (var i = 0, len = events.length; i < len; i++) {
    eventName = events[i].toLowerCase().replace(/^on/, '');
    added[eventName] = true;
    if (!handlers[eventName]) {
      handlers[eventName] = [];
    }
    handlers[eventName].push(func);
  }

  // The following events must be memorized and fired immediately if relevant as they only occur
  // once per Flash object load.

  // If we don't have Flash, tell an adult
  if (added.noflash && flashState.noflash) {
    _receiveEvent.call(this, "onNoFlash", {});
  }
  // If we have old Flash,
  if (added.wrongflash && flashState.wrongflash) {
    _receiveEvent.call(this, "onWrongFlash", {
      flashVersion: flashState.version
    });
  }
  // If the SWF was already loaded, we're à gogo!
  if (added.load && flashState.ready) {
    _receiveEvent.call(this, "onLoad", {
      flashVersion: flashState.version
    });
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
 * Receive an event from Flash for a specific element/client.
 *
 * returns nothing
 */
var _receiveEvent = function (eventName, args) {
  eventName = eventName.toLowerCase().replace(/^on/, '');

  var cleanVersion = (args && args.flashVersion && _parseFlashVersion(args.flashVersion)) || null;
  var element = currentElement;
  var performCallbackAsync = true;

  // special behavior for certain events
  switch (eventName) {
    case 'load':
      if (cleanVersion) {
        // If the Flash version is less than 10, throw event.
        if (!_isFlashVersionSupported(cleanVersion)) {
          _receiveEvent.call(this, "onWrongFlash", { flashVersion: cleanVersion });
          return;
        }
        flashState.wrongflash = false;
        flashState.ready = true;
        flashState.version = cleanVersion;
      }
      break;

    case 'wrongflash':
      if (cleanVersion && !_isFlashVersionSupported(cleanVersion)) {
        flashState.wrongflash = true;
        flashState.ready = false;
        flashState.version = cleanVersion;
      }
      break;

    case 'mouseover':
      _addClass(element, _globalConfig.hoverClass);
      break;

    case 'mouseout':
      ZeroClipboard.deactivate();
      break;

    case 'mousedown':
      _addClass(element, _globalConfig.activeClass);
      break;

    case 'mouseup':
      _removeClass(element, _globalConfig.activeClass);
      break;

    case 'datarequested':
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

      // This callback cannot be performed asynchronously as it would prevent the
      // user from being able to call `.setText` successfully before the pending
      // clipboard injection associated with this event fires.
      performCallbackAsync = false;
      break;

    case 'complete':
      _deleteOwnProperties(_clipData);
      break;
  } // switch eventName

  // User defined handlers for events
  var handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers[eventName];
  if (handlers && handlers.length) {
    var i, len, func;
    for (i = 0, len = handlers.length; i < len; i++) {
      func = handlers[i];

      // If the user provided a string for their callback, grab that function
      if (typeof func === 'string' && typeof window[func] === 'function') {
        func = window[func];
      }
      if (typeof func === 'function') {
        // actual function reference
        _dispatchCallback(func, element, this, args, performCallbackAsync);
      }
    }
  }
};

/*
 * Register new element(s) to the object.
 *
 * returns object instance
 */
ZeroClipboard.prototype.glue = function (elements) {

  elements = _prepGlue(elements);

  for (var i = 0; i < elements.length ; i++) {
    if (elements.hasOwnProperty(i) && elements[i] && elements[i].nodeType === 1) {
      // If the element hasn't been glued to ANY client yet, add a metadata ID and event handler
      if (!elements[i].zcClippingId) {
        elements[i].zcClippingId = "zcClippingId_" + (elementIdCounter++);
        _elementMeta[elements[i].zcClippingId] = [this.id];
        _addEventHandler(elements[i], "mouseover", _elementMouseOver);
      }
      else if (_inArray(this.id, _elementMeta[elements[i].zcClippingId]) === -1) {
        _elementMeta[elements[i].zcClippingId].push(this.id);
      }

      // If the element hasn't been glued to THIS client yet, add it
      var gluedElements = _clientMeta[this.id].elements;
      if (_inArray(elements[i], gluedElements) === -1) {
        gluedElements.push(elements[i]);
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
ZeroClipboard.prototype.unglue = function (elements) {
  var meta = _clientMeta[this.id];

  if (meta) {
    // if no elements were provided, unglue ALL of this client's glued elements
    if (typeof elements === "undefined") {
      elements = meta.elements.slice(0);
    }

    elements = _prepGlue(elements);

    for (var i = 0; i < elements.length; i++) {
      if (elements.hasOwnProperty(i) && elements[i] && elements[i].nodeType === 1) {
        // If the element was glued to THIS client yet, remove it
        var gluedElements = meta.elements;
        var arrayIndex = 0;
        while ((arrayIndex = _inArray(elements[i], gluedElements, arrayIndex)) !== -1) {
          gluedElements.splice(arrayIndex, 1);
        }

        // If the element isn't glued to ANY other client, remove its metadata ID and event handler
        var clientIds = _elementMeta[elements[i].zcClippingId];
        if (clientIds) {
          arrayIndex = 0;
          while ((arrayIndex = _inArray(this.id, clientIds, arrayIndex)) !== -1) {
            clientIds.splice(arrayIndex, 1);
          }
          if (clientIds.length === 0) {
            _removeEventHandler(elements[i], "mouseover", _elementMouseOver);
            delete elements[i].zcClippingId;
          }
        }
      }
    }
  }
  return this;
};


/*
 * Get all of the elements to which this client is glued.
 *
 * returns array of glued elements
 */
ZeroClipboard.prototype.elements = function () {
  var meta = _clientMeta[this.id];
  return (meta && meta.elements) ? meta.elements.slice(0) : [];
};


/*
 * Get all of the clients that are glued to an element.
 *
 * returns array of clients
 */
var _getAllClientsGluedToElement = function (element) {
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