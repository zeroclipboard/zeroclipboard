/*
 * Creates a new ZeroClipboard client. from an selector query.
 *
 * returns nothing
 */
ZeroClipboard.Client = function (query) {

  // event handlers
  this.handlers = {};

  // setup the flash->Javascript bridge
  if (ZeroClipboard.detectFlashSupport()) this.bridge();

  if (query) this.glue(query);

  // set currentClient to the last created
  ZeroClipboard.currentClient = this;
};

/*
 * Glue a new query of objects to the client.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.glue = function (query) {
  var self = this;

  // store the element from the page
  this.element = ZeroClipboard.$(query);

  this.element.addEventListener("mouseover", function (obj) {
    self.setCurrent(this);
  });
};

/*
 * Find or create an htmlBridge and flashBridge for the client.
 *
 * returns nothing
 */
ZeroClipboard.Client.prototype.bridge = function () {

  // try and find the current global bridge
  this.htmlBridge = ZeroClipboard.$('#global-zeroclipboard-html-bridge');

  if (this.htmlBridge) {
    this.flashBridge = document["global-zeroclipboard-flash-bridge"];
    return;
  }

  var html = "\
    <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" id=\"global-zeroclipboard-flash-bridge\" width=\"100%\" height=\"100%\"> \
      <param name=\"movie\" value=\"" + ZeroClipboard.moviePath + "\"/> \
      <param name=\"allowScriptAccess\" value=\"always\" /> \
      <param name=\"scale\" value=\"exactfit\"> \
      <param name=\"loop\" value=\"false\" /> \
      <param name=\"menu\" value=\"false\" /> \
      <param name=\"quality\" value=\"best\" /> \
      <param name=\"bgcolor\" value=\"#ffffff\" /> \
      <param name=\"wmode\" value=\"transparent\"/> \
      <param name=\"flashvars\" value=\"id=1\"/> \
      <embed src=\"" + ZeroClipboard.moviePath + "\" \
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
  this.htmlBridge.setAttribute("data-clipboard-ready", false);
  this.htmlBridge.style.position = "absolute";
  this.htmlBridge.style.left = "-9999px";
  this.htmlBridge.style.top = "-9999px";
  this.htmlBridge.style.width = "15px";
  this.htmlBridge.style.height = "15px";
  this.htmlBridge.style.zIndex = "9999";

  this.htmlBridge.innerHTML = html;

  var self = this;
  this.htmlBridge.addEventListener("mouseout", function (event) {
    self.resetBridge();
  });

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
};

/*
 * Helper function to determine if the flash bridge is ready. Gets this info from
 * a data-clipboard-ready attribute on the global html element.
 *
 * returns true if the flash bridge is ready
 */
ZeroClipboard.Client.prototype.ready = function () {
  return this.htmlBridge.getAttribute("data-clipboard-ready");
};

/*
 * Private function _getStyle is used to compute a styleProp of the given element.
 *
 * returns the computed style
 */
function _getStyle(el, styleProp) {
  var y = el.style[styleProp];
  if (el.currentStyle)
    y = el.currentStyle[styleProp];
  else if (window.getComputedStyle)
    y = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
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

  // What client is current
  ZeroClipboard.currentClient = this;

  var pos = ZeroClipboard.getDOMObjectPosition(element);

  // new css
  this.htmlBridge.style.top = pos.top + "px";
  this.htmlBridge.style.left = pos.left + "px";
  this.htmlBridge.style.width = pos.width + "px";
  this.htmlBridge.style.height = pos.height + "px";
  this.htmlBridge.style.zIndex = pos.zIndex + 1;

  this.setSize(pos.width, pos.height);

  // If the dom element contains data-clipboard-text set text
  if (element.getAttribute("data-clipboard-text")) {
    this.setText(element.getAttribute("data-clipboard-text"));
  }

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