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
 * Find or create an htmlBridge and flashBridge for the client.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.bridge = function () {

  // try and find the current global bridge
  this.htmlBridge = document.getElementById('global-zeroclipboard-html-bridge');

  if (this.htmlBridge) {
    this.flashBridge = document["global-zeroclipboard-flash-bridge"];
    return;
  }

  // because externalenterface craps out when flash is cached.
  function noCache(path) {
    return ((path.indexOf("?") >= 0) ? "&" : "?") + "nocache=" + (new Date().getTime());
  }

  // creates a query string for the flasvars
  function vars() {
    var str = [];

    // if trusted domain is set
    if (ZeroClipboard._trustedDomain) str.push("trustedDomain=" + ZeroClipboard._trustedDomain);

    // join the str by &
    return str.join("&");
  }

  var html = "\
    <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" id=\"global-zeroclipboard-flash-bridge\" width=\"100%\" height=\"100%\"> \
      <param name=\"movie\" value=\"" + ZeroClipboard._moviePath + noCache(ZeroClipboard._moviePath) + "\"/> \
      <param name=\"allowScriptAccess\" value=\"always\" /> \
      <param name=\"scale\" value=\"exactfit\"> \
      <param name=\"loop\" value=\"false\" /> \
      <param name=\"menu\" value=\"false\" /> \
      <param name=\"quality\" value=\"best\" /> \
      <param name=\"bgcolor\" value=\"#ffffff\" /> \
      <param name=\"wmode\" value=\"transparent\"/> \
      <param name=\"flashvars\" value=\"" + vars() + "\"/> \
      <embed src=\"" + ZeroClipboard._moviePath + noCache(ZeroClipboard._moviePath) + "\" \
        loop=\"false\" menu=\"false\" \
        quality=\"best\" bgcolor=\"#ffffff\" \
        width=\"100%\" height=\"100%\" \
        name=\"global-zeroclipboard-flash-bridge\" \
        allowScriptAccess=\"always\" \
        allowFullScreen=\"false\" \
        type=\"application/x-shockwave-flash\" \
        wmode=\"transparent\" \
        pluginspage=\"http://www.macromedia.com/go/getflashplayer\" \
        flashvars=\"" + vars() + "\" \
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
  _removeClass(ZeroClipboard.currentElement, 'zeroclipboard-is-active');
  delete ZeroClipboard.currentElement;
};

/*
 * Helper function to determine if the flash bridge is ready. Gets this info from
 * a data-clipboard-ready attribute on the global html element.
 *
 * returns true if the flash bridge is ready
 */
ZeroClipboard.Client.prototype.ready = function () {
  // I don't want to eval() here
  var ready = this.htmlBridge.getAttribute("data-clipboard-ready");
  return ready === "true" || ready === true;
};

/*
 * Private function _getStyle is used to try and guess the element style; If
 * if we're looking for cursor, then we make a guess for <a>.
 *
 * returns the computed style
 */
function _getStyle(el, prop) {
  var y = el.style[prop];
  if (el.currentStyle)
    y = el.currentStyle[prop];
  else if (window.getComputedStyle)
    y = document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);

  if (y == "auto" && prop == "cursor") {
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
 * Reposition the flash object, if the page size changes.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.reposition = function () {

  // If there is no currentElement return
  if (!ZeroClipboard.currentElement) return false;

  var pos = _getDOMObjectPosition(ZeroClipboard.currentElement);

  // new css
  this.htmlBridge.style.top    = pos.top + "px";
  this.htmlBridge.style.left   = pos.left + "px";
  this.htmlBridge.style.width  = pos.width + "px";
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