/*
 * Creates a new ZeroClipboard client; optionally, from an element or array of elements.
 *
 * returns the client instance if it's already created
 */
var ZeroClipboard = function (elements) {

  // Ensure the constructor is invoked with the `new` keyword, even if the user forgets it
  if (!(this instanceof ZeroClipboard)) {
    return new ZeroClipboard(elements);
  }

  // Assign an ID to the client instance
  this.id = "" + (_clientIdCounter++);

  // Create the meta information store for this client
  _clientMeta[this.id] = {
    instance: this,
    elements: [],
    handlers: {}
  };

  // If the elements argument exists, clip it
  if (elements) {
    this.clip(elements);
  }


  // Setup the Flash <-> JavaScript bridge
  if (typeof _flashState.ready !== "boolean") {
    _flashState.ready = false;
  }
  if (!ZeroClipboard.isFlashUnusable() && _flashState.bridge === null) {
    var _client = this;
    var maxWait = _globalConfig.flashLoadTimeout;
    if (typeof maxWait === "number" && maxWait >= 0) {
      setTimeout(function() {
        // If it took longer the `_globalConfig.flashLoadTimeout` milliseconds to receive
        // a `ready` event, consider Flash "deactivated".
        if (typeof _flashState.deactivated !== "boolean") {
          _flashState.deactivated = true;
        }
        if (_flashState.deactivated === true) {
          ZeroClipboard.emit({ "type": "error", "name": "flash-deactivated", "client": _client });
        }
      }, maxWait);
    }

    // If creating a new `ZeroClipboard` instance, it is safe to ignore the `overdue` status
    _flashState.overdue = false;

    // Load the SWF
    _bridge();
  }
};


/**
 * Stores the pending plain text to inject into the clipboard.
 *
 * @return object instance
 */
ZeroClipboard.prototype.setText = function (text) {
  ZeroClipboard.setData("text/plain", text);
  return this;
};


/**
 * Stores the pending HTML text to inject into the clipboard.
 *
 * @return object instance
 */
ZeroClipboard.prototype.setHtml = function (html) {
  ZeroClipboard.setData("text/html", html);
  return this;
};


/**
 * Stores the pending rich text (RTF) to inject into the clipboard.
 *
 * @return object instance
 */
ZeroClipboard.prototype.setRichText = function (richText) {
  ZeroClipboard.setData("application/rtf", richText);
  return this;
};


/**
 * Stores the pending data to inject into the clipboard.
 *
 * @return object instance
 */
ZeroClipboard.prototype.setData = function () {
  ZeroClipboard.setData.apply(ZeroClipboard, _args(arguments));
  return this;
};


/**
 * Clears the pending data to inject into the clipboard.
 *
 * @return object instance
 */
ZeroClipboard.prototype.clearData = function () {
  ZeroClipboard.clearData.apply(ZeroClipboard, _args(arguments));
  return this;
};


/*
 * Change the size/dimensions of the Flash object's stage.
 *
 * returns object instance
 */
ZeroClipboard.prototype.setSize = function (width, height) {
  _setSize(width, height);
  return this;
};


/*
 * @private
 *
 * Sends a signal to the Flash object to display the hand cursor if true.
 * Does NOT update the value of the `forceHandCursor` option.
 *
 * returns nothing
 */
var _setHandCursor = function (enabled) {
  if (_flashState.ready === true && _flashState.bridge && typeof _flashState.bridge.setHandCursor === "function") {
    _flashState.bridge.setHandCursor(enabled);
  }
  else {
    _flashState.ready = false;
  }
};


/*
 * Self-destruction and clean up everything for a single client.
 *
 * returns nothing
 */
ZeroClipboard.prototype.destroy = function () {
  // Unclip all the elements
  this.unclip();

  // Remove all event handlers
  this.off();

  // Delete the client's metadata store
  delete _clientMeta[this.id];
};


/*
 * Get all clients.
 *
 * returns array of clients
 */
var _getAllClients = function () {
  var i, len, client,
      clients = [],
      clientIds = _objectKeys(_clientMeta);
  for (i = 0, len = clientIds.length; i < len; i++) {
    client = _clientMeta[clientIds[i]].instance;
    if (client && client instanceof ZeroClipboard) {
      clients.push(client);
    }
  }
  return clients;
};