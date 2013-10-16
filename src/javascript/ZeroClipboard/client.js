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


var currentElement,      // Keep track of the current element that is being hovered.
    gluedElements = [];  // Watch glued elements so we don't double glue.

/*
 * Sets the current html object that the flash object should overlay.
 * This will put the global flash object on top of the current object and set
 * the text and title from the html object.
 *
 * returns object instance
 */
ZeroClipboard.prototype.setCurrent = function (element) {

  // What element is current
  currentElement = element;

  this.reposition();

  // If the dom element has a title
  var titleAttr = element.getAttribute("title");
  if (titleAttr) {
    this.setTitle(titleAttr);
  }

  // If the element has a pointer style, set to hand cursor
  var useHandCursor = this.options.forceHandCursor === true || _getStyle(element, "cursor") === "pointer";
  // Update the hand cursor state without updating the `forceHandCursor` option
  _setHandCursor.call(this, useHandCursor);

  return this;
};

/*
 * Sends a signal to the flash object to set the clipboard text.
 *
 * returns object instance
 */
ZeroClipboard.prototype.setText = function (newText) {
  if (newText && newText !== "") {
    this.options.text = newText;
    if (this.ready()) this.flashBridge.setText(newText);
  }

  return this;
};

/*
 * Adds a title="" attribute to the htmlBridge to give it tooltip capabiities
 *
 * returns object instance
 */
ZeroClipboard.prototype.setTitle = function (newTitle) {
  if (newTitle && newTitle !== "") this.htmlBridge.setAttribute("title", newTitle);

  return this;
};

/*
 * Sends a signal to the flash object to change the stage size.
 *
 * returns object instance
 */
ZeroClipboard.prototype.setSize = function (width, height) {
  if (this.ready()) this.flashBridge.setSize(width, height);

  return this;
};

/*
 * @deprecated in [v1.2.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Sends a signal to the flash object to display the hand cursor if true.
 * Updates the value of the `forceHandCursor` option.
 *
 * returns object instance
 */
ZeroClipboard.prototype.setHandCursor = function (enabled) {
  enabled = typeof enabled === "boolean" ? enabled : !!enabled;
  _setHandCursor.call(this, enabled);
  this.options.forceHandCursor = enabled;

  return this;
};

/*
 * @private
 *
 * Sends a signal to the flash object to display the hand cursor if true.
 * Does NOT update the value of the `forceHandCursor` option.
 *
 * returns nothing
 */
var _setHandCursor = function (enabled) {
  if (this.ready()) this.flashBridge.setHandCursor(enabled);
};
