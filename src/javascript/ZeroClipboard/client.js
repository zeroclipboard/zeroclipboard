/*
 * Creates a new ZeroClipboard client. from an element, or array of elements.
 *
 * returns _client instance if it's already created
 */
ZeroClipboard.Client = function (elements) {

  var singleton = ZeroClipboard._client;

  // If there's a client already, return the singleton
  if (singleton) {
    if (elements) singleton.glue(elements);
    return singleton;
  }

  // event handlers
  this.handlers = {};

  // text
  this._text = null;

  // setup the flash->Javascript bridge
  if (ZeroClipboard.detectFlashSupport()) this.bridge();

  // If the elements exist glue
  if (elements) this.glue(elements);

  ZeroClipboard._client = this;
};

/*
 * Sets the current html object that the flash object should overlay.
 * This will put the global flash object on top of the current object and set
 * the text and title from the html object.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.setCurrent = function (element) {

  // What element is current
  ZeroClipboard.currentElement = element;

  this.reposition();

  this.setText(this._text || element.getAttribute("data-clipboard-text"));

  // If the dom element has a title
  if (element.getAttribute("title")) {
    this.setTitle(element.getAttribute("title"));
  }

  // If the element has a pointer style, set to hand cursor
  if (_getStyle(element, "cursor") == "pointer") {
    this.setHandCursor(true);
  } else {
    this.setHandCursor(false);
  }
};

/*
 * Sends a signal to the flash object to set the clipboard text.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.setText = function (newText) {
  if (newText && newText !== "") {
    this._text = newText;
    if (this.ready()) this.flashBridge.setText(newText);
  }
};

/*
 * Sets the object's _text to null
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.resetText = function () {
  this._text = null;
};

/*
 * Adds a title="" attribute to the htmlBridge to give it tooltip capabiities
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.setTitle = function (newTitle) {
  if (newTitle && newTitle !== "") this.htmlBridge.setAttribute("title", newTitle);
};

/*
 * Sends a signal to the flash object to change the stage size.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.setSize = function (width, height) {
  if (this.ready()) this.flashBridge.setSize(width, height);
};

/*
 * Sends a signal to the flash object to display the hand cursor if true
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.setHandCursor = function (enabled) {
  if (this.ready()) this.flashBridge.setHandCursor(enabled);
};