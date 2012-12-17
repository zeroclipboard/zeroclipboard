/*
 * Creates a new ZeroClipboard client. from an selector query.
 *
 * returns _client instance if it's already created
 */
ZeroClipboard.Client = function (query) {

  // If there's a client already, return null
  if (ZeroClipboard._client) return ZeroClipboard._client;

  // event handlers
  this.handlers = {};

  // setup the flash->Javascript bridge
  if (ZeroClipboard.detectFlashSupport()) this.bridge();

  // If we're query now, then register
  if (query) this.glue(query);

  ZeroClipboard._client = this;
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
      element.attachEvent(method, func);
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
      element.detachEvent(method, func);
    }
  }

  // store the element from the page
  var elements = ZeroClipboard.$(query);

  for (var i = 0; i < elements.length ; i++) {
    _removeEventHandler(elements[i], "mouseover", _elementMouseOver);
  }
};

/*
 * Find or create an htmlBridge and flashBridge for the client.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.bridge = function () {

  // try and find the current global bridge
  this.htmlBridge = ZeroClipboard.$('#global-zeroclipboard-html-bridge');

  if (this.htmlBridge.length) {
    this.htmlBridge = this.htmlBridge[0];
    this.flashBridge = document["global-zeroclipboard-flash-bridge"];
    return;
  }

  // because externalenterface craps out when flash is cached.
  function noCache(path) {
    return ((path.indexOf("?") >= 0) ? "&" : "?") + "nocache=" + (new Date().getTime());
  }

  var html = "\
    <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" id=\"global-zeroclipboard-flash-bridge\" width=\"100%\" height=\"100%\"> \
      <param name=\"movie\" value=\"" + ZeroClipboard.moviePath + noCache(ZeroClipboard.moviePath) + "\"/> \
      <param name=\"allowScriptAccess\" value=\"always\" /> \
      <param name=\"scale\" value=\"exactfit\"> \
      <param name=\"loop\" value=\"false\" /> \
      <param name=\"menu\" value=\"false\" /> \
      <param name=\"quality\" value=\"best\" /> \
      <param name=\"bgcolor\" value=\"#ffffff\" /> \
      <param name=\"wmode\" value=\"transparent\"/> \
      <param name=\"flashvars\" value=\"id=1\"/> \
      <embed src=\"" + ZeroClipboard.moviePath + noCache(ZeroClipboard.moviePath) + "\" \
        loop=\"false\" menu=\"false\" \
        quality=\"best\" bgcolor=\"#ffffff\" \
        width=\"100%\" height=\"100%\" \
        name=\"global-zeroclipboard-flash-bridge\" \
        allowScriptAccess=\"always\" \
        allowFullScreen=\"false\" \
        type=\"application/x-shockwave-flash\" \
        wmode=\"transparent\" \
        pluginspage=\"http://www.macromedia.com/go/getflashplayer\" \
        flashvars=\"id=1&width=100&height=100\" \
        scale=\"exactfit\"> \
      </embed> \
    </object>";

  this.htmlBridge = document.createElement('div');
  this.htmlBridge.id = "global-zeroclipboard-html-bridge";
  this.htmlBridge.setAttribute("class", "global-zeroclipboard-container");
  this.htmlBridge.setAttribute("data-clipboard-ready", false);
  this.htmlBridge.style.position = "absolute";
  this.htmlBridge.style.left = "-9999px";
  this.htmlBridge.style.top = "-9999px";
  this.htmlBridge.style.width = "15px";
  this.htmlBridge.style.height = "15px";
  this.htmlBridge.style.zIndex = "9999";

  this.htmlBridge.innerHTML = html;

  document.body.appendChild(this.htmlBridge);
  this.flashBridge = document["global-zeroclipboard-flash-bridge"];

};

/*
 * Reset the html bridge to be hidden off screen and not have title or text.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.resetBridge = function () {
  this.htmlBridge.style.left = "-9999px";
  this.htmlBridge.style.top = "-9999px";
  this.htmlBridge.removeAttribute("title");
  this.htmlBridge.removeAttribute("data-clipboard-text");
  ZeroClipboard.currentElement.removeClass('zeroclipboard-is-active');
  delete ZeroClipboard.currentElement;
};

/*
 * Helper function to determine if the flash bridge is ready. Gets this info from
 * a data-clipboard-ready attribute on the global html element.
 *
 * returns true if the flash bridge is ready
 */
ZeroClipboard.Client.prototype.ready = function () {
  return !!this.htmlBridge.getAttribute("data-clipboard-ready");
};

/*
 * Private function _getCursor is used to try and guess the element cursor;
 *
 * returns the computed cursor
 */
function _getCursor(el) {
  var y = el.style.cursor;
  if (el.currentStyle)
    y = el.currentStyle.cursor;
  else if (window.getComputedStyle)
    y = document.defaultView.getComputedStyle(el, null).getPropertyValue("cursor");

  if (y == "auto") {
    var possiblePointers = ["a"];
    for (var i = 0; i < possiblePointers.length; i++) {
      if (el.tagName.toLowerCase() == possiblePointers[i]) {
        return "pointer";
      }
    }
  }

  return y;
}

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

  // If the dom element contains data-clipboard-text set text
  if (element.getAttribute("data-clipboard-text")) {
    this.setText(element.getAttribute("data-clipboard-text"));
  }

  // If the dom element has a title
  if (element.getAttribute("title")) {
    this.setTitle(element.getAttribute("title"));
  }

  // If the element has a pointer style, set to hand cursor
  if (_getCursor(element) == "pointer") {
    this.setHandCursor(true);
  } else {
    this.setHandCursor(false);
  }
};

/*
 * Reposition the flash object, if the page size changes.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.reposition = function () {
  var pos = ZeroClipboard.getDOMObjectPosition(ZeroClipboard.currentElement);

  // new css
  this.htmlBridge.style.top = pos.top + "px";
  this.htmlBridge.style.left = pos.left + "px";
  this.htmlBridge.style.width = pos.width + "px";
  this.htmlBridge.style.height = pos.height + "px";
  this.htmlBridge.style.zIndex = pos.zIndex + 1;

  this.setSize(pos.width, pos.height);
};

/*
 * Sends a signal to the flash object to set the clipboard text.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.setText = function (newText) {
  if (newText && newText !== "") {
    this.htmlBridge.setAttribute("data-clipboard-text", newText);
    if (this.ready()) this.flashBridge.setText(newText);
  }
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