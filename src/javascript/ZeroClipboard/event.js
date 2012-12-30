/*
 * Bridge from the flash object back to the javascript
 *
 * returns nothing
 */
ZeroClipboard.dispatch = function (eventName, args) {
  // receive event from flash movie, send to client
  ZeroClipboard._client.receiveEvent(eventName, args);
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
    currentElement.addClass('zeroclipboard-is-hover');
    break;

  case 'mouseout':
    currentElement.removeClass('zeroclipboard-is-hover');
    this.resetBridge();
    break;

  case 'mousedown':
    currentElement.addClass('zeroclipboard-is-active');
    break;

  case 'mouseup':
    currentElement.removeClass('zeroclipboard-is-active');
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
 * The private mouseOver function for an element
 *
 * returns nothing
 */
function _elementMouseOver() {
  ZeroClipboard._client.setCurrent(this);
}

/*
 * Register a new query of objects to the client.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.glue = function (query) {

  // private function for adding events to the dom, IE before 9 is suckage
  function _addEventHandler(element, method, func) {
    if (element.addEventListener) { // all browsers except IE before version 9
      element.addEventListener(method, func, false);
    } else if (element.attachEvent) { // IE before version 9
      element.attachEvent("on" + method, func);
    }
  }

  // store the element from the page
  var elements = ZeroClipboard.$(query);

  for (var i = 0; i < elements.length ; i++) {
    _addEventHandler(elements[i], "mouseover", _elementMouseOver);
  }
};

/*
 * Unregister the clipboard actions of an element on the page
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.unglue = function (query) {

  // private function for removing events from the dom, IE before 9 is suckage
  function _removeEventHandler(element, method, func) {
    if (element.removeEventListener) { // all browsers except IE before version 9
      element.removeEventListener(method, func, false);
    } else if (element.detachEvent) { // IE before version 9
      element.detachEvent("on" + method, func);
    }
  }

  // store the element from the page
  var elements = ZeroClipboard.$(query);

  for (var i = 0; i < elements.length ; i++) {
    _removeEventHandler(elements[i], "mouseover", _elementMouseOver);
  }
};