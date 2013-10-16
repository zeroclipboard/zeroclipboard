/*
 * Bridge from the flash object back to the javascript
 *
 * returns nothing
 */
ZeroClipboard.dispatch = function (eventName, args) {
  // receive event from flash movie, send to client
  ZeroClipboard.prototype._singleton.receiveEvent(eventName, args);
};

/*
 * Add an event to the client.
 *
 * returns object instance
 */
ZeroClipboard.prototype.on = function (eventName, func) {
  // add user event listener for event
  // event types: load, queueStart, fileStart, fileComplete, queueComplete, progress, error, cancel
  var events = eventName.toString().split(/\s/g);
  for (var i = 0; i < events.length; i++) {
    eventName = events[i].toLowerCase().replace(/^on/, '');
    if (!this.handlers[eventName]) this.handlers[eventName] = func;
  }

  // If we don't have flash, tell an adult
  if (this.handlers.noflash && !ZeroClipboard.detectFlashSupport()) {
    this.receiveEvent("onNoFlash", null);
  }

  return this;
};
// shortcut to old stuff
ZeroClipboard.prototype.addEventListener = ZeroClipboard.prototype.on;

/*
 * Remove an event from the client.
 *
 * returns object instance
 */
ZeroClipboard.prototype.off = function (eventName, func) {
  // remove user event listener for event
  var events = eventName.toString().split(/\s/g);
  for (var i = 0; i < events.length; i++) {
    eventName = events[i].toLowerCase().replace(/^on/, "");
    for (var event in this.handlers) {
      if (event === eventName && this.handlers[event] === func) {
        delete this.handlers[event];
      }
    }
  }

  return this;
};
// shortcut to old stuff
ZeroClipboard.prototype.removeEventListener = ZeroClipboard.prototype.off;

/*
 * @deprecated in [v1.2.0], slated for removal from the public API in [v2.0.0]. See docs for more info.
 *
 * Receive an event for a specific client.
 *
 * returns nothing
 */
ZeroClipboard.prototype.receiveEvent = function (eventName, args) {
  // receive event from flash
  eventName = eventName.toString().toLowerCase().replace(/^on/, '');

  var element = currentElement;
  var performCallbackAsync = true;

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
    _addClass(element, this.options.hoverClass);
    break;

  case 'mouseout':
    _removeClass(element, this.options.hoverClass);
    this.resetBridge();
    break;

  case 'mousedown':
    _addClass(element, this.options.activeClass);
    break;

  case 'mouseup':
    _removeClass(element, this.options.activeClass);
    break;

  case 'datarequested':
    var targetId = element.getAttribute('data-clipboard-target'),
       targetEl = !targetId ? null : document.getElementById(targetId);
    if (targetEl) {
      var textContent = targetEl.value || targetEl.textContent || targetEl.innerText;
      if (textContent) this.setText(textContent);
    }
    else {
      var defaultText = element.getAttribute('data-clipboard-text');
      if (defaultText) this.setText(defaultText);
    }

    // This callback cannot be performed asynchronously as it would prevent the
    // user from being able to call `.setText` successfully before the pending
    // clipboard injection associated with this event fires.
    performCallbackAsync = false;
    break;

  case 'complete':
    this.options.text = null;
    break;
  } // switch eventName

  if (this.handlers[eventName]) {
    var func = this.handlers[eventName];

    // If the user provided a string for their callback, grab that function
    if (typeof func === 'string' && typeof window[func] === 'function') {
      func = window[func];
    }
    if (typeof func === 'function') {
      // actual function reference
      _dispatchCallback(func, element, this, args, performCallbackAsync);
    }
  } // user defined handler for event
};

/*

/*
 * Register new element(s) to the object.
 *
 * returns object instance
 */
ZeroClipboard.prototype.glue = function (elements) {

  elements = _prepGlue(elements);

  for (var i = 0; i < elements.length ; i++) {

    // if the element has not been glued
    if (_inArray(elements[i], gluedElements) == -1) {

      // push to glued elements
      gluedElements.push(elements[i]);

      _addEventHandler(elements[i], "mouseover", _elementMouseOver);
    }
  }

  return this;
};

/*
 * Unregister the clipboard actions of an element on the page
 *
 * returns object instance
 */
ZeroClipboard.prototype.unglue = function (elements) {

  elements = _prepGlue(elements);

  for (var i = 0; i < elements.length; i++) {

    _removeEventHandler(elements[i], "mouseover", _elementMouseOver);

    // get the index of the item
    var arrayIndex = _inArray(elements[i], gluedElements);

    // if the index is not -1, remove from array
    if (arrayIndex != -1) gluedElements.splice(arrayIndex, 1);
  }

  return this;
};
