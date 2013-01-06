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

  var html = "\
    <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" id=\"global-zeroclipboard-flash-bridge\" width=\"100%\" height=\"100%\"> \
      <param name=\"movie\" value=\"" + ZeroClipboard._moviePath + _noCache(ZeroClipboard._moviePath) + "\"/> \
      <param name=\"allowScriptAccess\" value=\"always\" /> \
      <param name=\"scale\" value=\"exactfit\"> \
      <param name=\"loop\" value=\"false\" /> \
      <param name=\"menu\" value=\"false\" /> \
      <param name=\"quality\" value=\"best\" /> \
      <param name=\"bgcolor\" value=\"#ffffff\" /> \
      <param name=\"wmode\" value=\"transparent\"/> \
      <param name=\"flashvars\" value=\"" + _vars() + "\"/> \
      <embed src=\"" + ZeroClipboard._moviePath + _noCache(ZeroClipboard._moviePath) + "\" \
        loop=\"false\" menu=\"false\" \
        quality=\"best\" bgcolor=\"#ffffff\" \
        width=\"100%\" height=\"100%\" \
        name=\"global-zeroclipboard-flash-bridge\" \
        allowScriptAccess=\"always\" \
        allowFullScreen=\"false\" \
        type=\"application/x-shockwave-flash\" \
        wmode=\"transparent\" \
        pluginspage=\"http://www.macromedia.com/go/getflashplayer\" \
        flashvars=\"" + _vars() + "\" \
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