/*
 * Creates a new ZeroClipboard client; optionally, from an element or array of elements.
 *
 * returns the client instance if it's already created
 */
var ZeroClipboard = function (elements, /** @deprecated */ options) {

  // Ensure the constructor is invoked with the `new` keyword, even if the user forgets it
  if (!(this instanceof ZeroClipboard)) {
    return new ZeroClipboard(elements, options);
  }

  // Assign an ID to the client instance
  this.id = "" + (clientIdCounter++);

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

  // Warn about use of deprecated constructor signature
  if (typeof options !== "undefined") {
    _deprecationWarning("new ZeroClipboard(elements, options)", _globalConfig.debug);

    // Set and override the defaults
    ZeroClipboard.config(options);
  }

  /** @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for more info. */
  this.options = ZeroClipboard.config();

  // Flash status
  if (typeof flashState.disabled !== "boolean") {
    flashState.disabled = !_detectFlashSupport();
  }

  // Setup the Flash <-> JavaScript bridge
  if (flashState.disabled === false && flashState.outdated !== true) {
    if (flashState.bridge === null) {
      flashState.outdated = false;
      flashState.ready = false;
      _bridge();
    }
  }
};


/*
 * Sends a signal to the Flash object to set the clipboard text.
 *
 * returns object instance
 */
ZeroClipboard.prototype.setText = function (newText) {
  if (newText && newText !== "") {
    _clipData["text/plain"] = newText;
    if (flashState.ready === true && flashState.bridge) {
      flashState.bridge.setText(newText);
    }
    else {
      //
      // TODO: Fix Issue #295?
      //
    }
  }
  return this;
};


/*
 * Sends a signal to the Flash object to change the stage size/dimensions.
 *
 * returns object instance
 */
ZeroClipboard.prototype.setSize = function (width, height) {
  if (flashState.ready === true && flashState.bridge) {
    flashState.bridge.setSize(width, height);
  }
  else {
    //
    // TODO: ???
    //
  }
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
  if (flashState.ready === true && flashState.bridge) {
    flashState.bridge.setHandCursor(enabled);
  }
  else {
    //
    // TODO: ???
    //
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