/*
 * Find or create an htmlBridge and flashBridge for the client.
 *
 * returns nothing
 */
var _bridge = function () {

  var client = ZeroClipboard.prototype._singleton;
  // try and find the current global bridge
  client.htmlBridge = document.getElementById('global-zeroclipboard-html-bridge');

  if (client.htmlBridge) {
    client.flashBridge = document["global-zeroclipboard-flash-bridge"];
    return;
  }

  var html = "\
    <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" id=\"global-zeroclipboard-flash-bridge\" width=\"100%\" height=\"100%\"> \
      <param name=\"movie\" value=\"" + client.options.moviePath + _noCache(client.options.moviePath) + "\"/> \
      <param name=\"allowScriptAccess\" value=\"always\" /> \
      <param name=\"scale\" value=\"exactfit\"> \
      <param name=\"loop\" value=\"false\" /> \
      <param name=\"menu\" value=\"false\" /> \
      <param name=\"quality\" value=\"best\" /> \
      <param name=\"bgcolor\" value=\"#ffffff\" /> \
      <param name=\"wmode\" value=\"transparent\"/> \
      <param name=\"flashvars\" value=\"" + _vars(client.options) + "\"/> \
      <embed src=\"" + client.options.moviePath + _noCache(client.options.moviePath) + "\" \
        loop=\"false\" menu=\"false\" \
        quality=\"best\" bgcolor=\"#ffffff\" \
        width=\"100%\" height=\"100%\" \
        name=\"global-zeroclipboard-flash-bridge\" \
        allowScriptAccess=\"always\" \
        allowFullScreen=\"false\" \
        type=\"application/x-shockwave-flash\" \
        wmode=\"transparent\" \
        pluginspage=\"http://www.macromedia.com/go/getflashplayer\" \
        flashvars=\"" + _vars(client.options) + "\" \
        scale=\"exactfit\"> \
      </embed> \
    </object>";

  client.htmlBridge = document.createElement('div');
  client.htmlBridge.id = "global-zeroclipboard-html-bridge";
  client.htmlBridge.setAttribute("class", "global-zeroclipboard-container");
  client.htmlBridge.setAttribute("data-clipboard-ready", false);
  client.htmlBridge.style.position = "absolute";
  client.htmlBridge.style.left = "-9999px";
  client.htmlBridge.style.top = "-9999px";
  client.htmlBridge.style.width = "15px";
  client.htmlBridge.style.height = "15px";
  client.htmlBridge.style.zIndex = "9999";

  client.htmlBridge.innerHTML = html;

  document.body.appendChild(client.htmlBridge);
  client.flashBridge = document["global-zeroclipboard-flash-bridge"];

};

/*
 * Reset the html bridge to be hidden off screen and not have title or text.
 *
 * returns nothing
 */
ZeroClipboard.prototype.resetBridge = function () {
  this.htmlBridge.style.left = "-9999px";
  this.htmlBridge.style.top = "-9999px";
  this.htmlBridge.removeAttribute("title");
  this.htmlBridge.removeAttribute("data-clipboard-text");
  _removeClass(currentElement, this.options.activeClass);
  currentElement = null;
};

/*
 * Helper function to determine if the flash bridge is ready. Gets this info from
 * a data-clipboard-ready attribute on the global html element.
 *
 * returns true if the flash bridge is ready
 */
ZeroClipboard.prototype.ready = function () {
  // I don't want to eval() here
  var ready = this.htmlBridge.getAttribute("data-clipboard-ready");
  return ready === "true" || ready === true;
};

/*
 * Reposition the flash object, if the page size changes.
 *
 * returns nothing
 */
ZeroClipboard.prototype.reposition = function () {

  // If there is no currentElement return
  if (!currentElement) return false;

  var pos = _getDOMObjectPosition(currentElement);

  // new css
  this.htmlBridge.style.top    = pos.top + "px";
  this.htmlBridge.style.left   = pos.left + "px";
  this.htmlBridge.style.width  = pos.width + "px";
  this.htmlBridge.style.height = pos.height + "px";
  this.htmlBridge.style.zIndex = pos.zIndex + 1;

  this.setSize(pos.width, pos.height);
};