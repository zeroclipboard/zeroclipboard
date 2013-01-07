/*
 * Bridge from the flash object back to the javascript
 *
 * returns nothing
 */
ZeroClipboard.dispatch = function (eventName, args) {
  // receive event from flash movie, send to client
  ZeroClipboard.Client.prototype._singleton.receiveEvent(eventName, args);
};

/*
 * Add an event to the client.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.on = function (eventName, func) {
  // add user event listener for event
  // event types: load, queueStart, fileStart, fileComplete, queueComplete, progress, error, cancel
  var events = eventName.toString().split(/\s/g);
  for (var i = 0; i < events.length; i++) {
    eventName = events[i].toLowerCase().replace(/^on/, '');
    if (!this.handlers[eventName]) this.handlers[eventName] = [];
    this.handlers[eventName].push(func);
  }

  // If we don't have flash, tell an adult
  if (this.handlers.noflash && !ZeroClipboard.detectFlashSupport()) {
    this.receiveEvent("onNoFlash", null);
  }
};
// shortcut to old stuff
ZeroClipboard.Client.prototype.addEventListener = function (eventName, func) {
  this.on(eventName, func);
};

/*
 * Receive an event for a specific client.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.receiveEvent = function (eventName, args) {
  // receive event from flash
  eventName = eventName.toString().toLowerCase().replace(/^on/, '');

  var currentElement = ZeroClipboard.currentElement;

  // special behavior for certain events
  switch (eventName) {
  case 'load':
    // If the flash version is less than 10, throw event.
    if (args && parseFloat(args.flashVersion.replace(",", ".").replace(/[^0-9\.]/gi, '')) < 10) {
      this.receiveEvent("onWrongFlash", { flashVersion: args.flashVersion });
      return;
    }

    this.htmlBridge.setAttribute("data-clipboard-ready", true);
    break;

  case 'mouseover':
    _addClass(currentElement, 'zeroclipboard-is-hover');
    break;

  case 'mouseout':
    _removeClass(currentElement, 'zeroclipboard-is-hover');
    this.resetBridge();
    break;

  case 'mousedown':
    _addClass(currentElement, 'zeroclipboard-is-active');
    break;

  case 'mouseup':
    _removeClass(currentElement, 'zeroclipboard-is-active');
    break;

  case 'complete':
    this.resetText();
    break;
  } // switch eventName

  if (this.handlers[eventName]) {
    for (var idx = 0, len = this.handlers[eventName].length; idx < len; idx++) {
      var func = this.handlers[eventName][idx];

      if (typeof(func) == 'function') {
        // actual function reference
        func.call(currentElement, this, args);
      }
      else if (typeof(func) == 'string') {
        // name of function
        window[func].call(currentElement, this, args);
      }
    } // foreach event handler defined
  } // user defined handler for event
};

/*

/*
 * Register new element(s) to the object.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.glue = function (elements) {

  // if elements is a string
  if (typeof elements === "string") throw new TypeError("ZeroClipboard doesn't accept query strings.");

  // if the elements isn't an array
  if (!elements.length) elements = [elements];

  for (var i = 0; i < elements.length ; i++) {
    _addEventHandler(elements[i], "mouseover", _elementMouseOver);
  }
};

/*
 * Unregister the clipboard actions of an element on the page
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.unglue = function (elements) {

  // if elements is a string
  if (typeof elements === "string") throw new TypeError("ZeroClipboard doesn't accept query strings.");

  // if the elements isn't an array
  if (!elements.length) elements = [elements];

  for (var i = 0; i < elements.length ; i++) {
    _removeEventHandler(elements[i], "mouseover", _elementMouseOver);
  }
};