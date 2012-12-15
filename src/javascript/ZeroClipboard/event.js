/*
 * Bridge from the flash object back to the javascript
 *
 * returns nothing
 */
ZeroClipboard.dispatch = function (eventName, args) {
  // receive event from flash movie, send to client
  ZeroClipboard.currentClient.receiveEvent(eventName, args);
};

/*
 * Add an event to the client.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.on = function (eventName, func) {
  // add user event listener for event
  // event types: load, queueStart, fileStart, fileComplete, queueComplete, progress, error, cancel
  eventName = eventName.toString().toLowerCase().replace(/^on/, '');
  if (!this.handlers[eventName]) this.handlers[eventName] = [];
  this.handlers[eventName].push(func);
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
    ZeroClipboard.currentElement.addClass('zeroclipboard-is-hover');
    break;

  case 'mouseout':
    ZeroClipboard.currentElement.removeClass('zeroclipboard-is-hover');
    this.resetBridge();
    break;

  case 'mousedown':
    ZeroClipboard.currentElement.addClass('zeroclipboard-is-active');
    break;

  case 'mouseup':
    ZeroClipboard.currentElement.removeClass('zeroclipboard-is-active');
    break;
  } // switch eventName

  if (this.handlers[eventName]) {
    for (var idx = 0, len = this.handlers[eventName].length; idx < len; idx++) {
      var func = this.handlers[eventName][idx];

      if (typeof(func) == 'function') {
        // actual function reference
        func(this, args);
      }
      else if (typeof(func) == 'string') {
        // name of function
        window[func](this, args);
      }
    } // foreach event handler defined
  } // user defined handler for event
};