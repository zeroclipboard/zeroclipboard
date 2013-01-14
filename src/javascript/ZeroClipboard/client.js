/*
 * Creates a new ZeroClipboard client. from an element, or array of elements.
 *
 * returns the client instance if it's already created
 */
var ZeroClipboard = function (elements, options) {

  // If the elements exist glue
  if (elements) (ZeroClipboard.prototype._singleton || this).glue(elements);

  // If there's a client already, return the singleton
  if (ZeroClipboard.prototype._singleton) return ZeroClipboard.prototype._singleton;

  ZeroClipboard.prototype._singleton = this;

  this.options = {};

  // set the defaults
  for (var kd in _defaults) this.options[kd] = _defaults[kd];

  // overried the defaults
  for (var ko in options) this.options[ko] = options[ko];

  // event handlers
  this.handlers = {};

  // setup the flash->Javascript bridge
  if (ZeroClipboard.detectFlashSupport()) _bridge();

};


var currentElement,      // keep track of the current element that is being hovered.
    gluedElements = [];  // watch glued elements so we don't double glue

/*
 * Sets the current html object that the flash object should overlay.
 * This will put the global flash object on top of the current object and set
 * the text and title from the html object.
 *
 * returns nothing
 */
ZeroClipboard.prototype.setCurrent = function (element) {

  // What element is current
  currentElement = element;

  this.reposition();

  // If the dom element has a title
  if (element.getAttribute("title")) {
    this.setTitle(element.getAttribute("title"));
  }

  // If the element has a pointer style, set to hand cursor
  this.setHandCursor(_getStyle(element, "cursor") == "pointer");
};

/*
 * Sends a signal to the flash object to set the clipboard text.
 *
 * returns nothing
 */
ZeroClipboard.prototype.setText = function (newText) {
  if (newText && newText !== "") {
    this.options.text = newText;
    if (this.ready()) this.flashBridge.setText(newText);
  }
};

/*
 * Adds a title="" attribute to the htmlBridge to give it tooltip capabiities
 *
 * returns nothing
 */
ZeroClipboard.prototype.setTitle = function (newTitle) {
  if (newTitle && newTitle !== "") this.htmlBridge.setAttribute("title", newTitle);
};

/*
 * Sends a signal to the flash object to change the stage size.
 *
 * returns nothing
 */
ZeroClipboard.prototype.setSize = function (width, height) {
  if (this.ready()) this.flashBridge.setSize(width, height);
};

/*
 * Sends a signal to the flash object to display the hand cursor if true
 *
 * returns nothing
 */
ZeroClipboard.prototype.setHandCursor = function (enabled) {
  if (this.ready()) this.flashBridge.setHandCursor(enabled);
};