/* AMD module ID or path to access the ZeroClipboard object */
var _amdModuleId = null;

/* CommonJS module ID or path to access the ZeroClipboard object */
var _cjsModuleId = null;

/*
 * Find or create an htmlBridge and flashBridge for the client.
 *
 * returns nothing
 */
var _bridge = function () {
  var flashBridge, len;
  var client = ZeroClipboard.prototype._singleton;
  // try and find the current global bridge
  var container = document.getElementById("global-zeroclipboard-html-bridge");

  if (!container) {
    // Create a copy of the `client.options` object to avoid exposing
    // the `amdModuleId` and `cjsModuleId` settings
    var opts = {};
    for (var ko in client.options) opts[ko] = client.options[ko];
    // Set these last to override them just in case any [v1.2.0-beta.1] users
    // are still passing them in to [v1.2.0-beta.2] (or higher)
    opts.amdModuleId = _amdModuleId;
    opts.cjsModuleId = _cjsModuleId;

    var flashvars = _vars(opts);
    var html = "\
      <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" id=\"global-zeroclipboard-flash-bridge\" width=\"100%\" height=\"100%\"> \
        <param name=\"movie\" value=\"" + client.options.moviePath + _noCache(client.options.moviePath, client.options) + "\"/> \
        <param name=\"allowScriptAccess\" value=\"" + client.options.allowScriptAccess +  "\"/> \
        <param name=\"scale\" value=\"exactfit\"/> \
        <param name=\"loop\" value=\"false\"/> \
        <param name=\"menu\" value=\"false\"/> \
        <param name=\"quality\" value=\"best\" /> \
        <param name=\"bgcolor\" value=\"#ffffff\"/> \
        <param name=\"wmode\" value=\"transparent\"/> \
        <param name=\"flashvars\" value=\"" + flashvars + "\"/> \
        <embed src=\"" + client.options.moviePath + _noCache(client.options.moviePath, client.options) + "\" \
          loop=\"false\" menu=\"false\" \
          quality=\"best\" bgcolor=\"#ffffff\" \
          width=\"100%\" height=\"100%\" \
          name=\"global-zeroclipboard-flash-bridge\" \
          allowScriptAccess=\"always\" \
          allowFullScreen=\"false\" \
          type=\"application/x-shockwave-flash\" \
          wmode=\"transparent\" \
          pluginspage=\"http://www.macromedia.com/go/getflashplayer\" \
          flashvars=\"" + flashvars + "\" \
          scale=\"exactfit\"> \
        </embed> \
      </object>";

    container = document.createElement("div");
    container.id = "global-zeroclipboard-html-bridge";
    container.setAttribute("class", "global-zeroclipboard-container");
    container.style.position = "absolute";
    container.style.left = "0px";
    container.style.top = "-9999px";
    container.style.width = "15px";
    container.style.height = "15px";
    container.style.zIndex = "" + _getSafeZIndex(client.options.zIndex);

    // NOTE: Fixes https://github.com/zeroclipboard/zeroclipboard/issues/204
    // Although many web developers will tell you that the following 2 lines should be switched to
    // avoid unnecessary reflows, that is (a) not true in modern browsers, and (b) will actually
    // BREAK this particular bit of code in oldIE (IE8, at least, if not IE7 as well). Something
    // odd about oldIE and its parsing of plugin HTML....
    document.body.appendChild(container);
    container.innerHTML = html;
  }

  client.htmlBridge = container;
  
  flashBridge = document["global-zeroclipboard-flash-bridge"];
  if (flashBridge && (len = flashBridge.length)) {
    flashBridge = flashBridge[len - 1];
  }
  client.flashBridge = flashBridge || container.children[0].lastElementChild;
};

/*
 * Reset the html bridge to be hidden off screen and not have title or text.
 *
 * returns object instance
 */
ZeroClipboard.prototype.resetBridge = function () {
  if (this.htmlBridge) {
    this.htmlBridge.style.left = "0px";
    this.htmlBridge.style.top = "-9999px";
    this.htmlBridge.removeAttribute("title");
  }
  if (currentElement) {
    _removeClass(currentElement, this.options.activeClass);
    currentElement = null;
  }
  this.options.text = null;

  return this;
};

/*
 * Helper function to determine if the Flash bridge is ready. Gets this info from
 * a per-bridge status tracker.
 *
 * returns true if the Flash bridge is ready
 */
ZeroClipboard.prototype.ready = function () {
  return flashState.clients[this.options.moviePath].ready === true;
};

/*
 * Reposition the Flash object to cover the current element being hovered over.
 *
 * returns object instance
 */
var _reposition = function () {

  // If there is no `currentElement`, skip it
  if (currentElement) {
    var pos = _getDOMObjectPosition(currentElement, this.options.zIndex);

    // new css
    this.htmlBridge.style.top    = pos.top + "px";
    this.htmlBridge.style.left   = pos.left + "px";
    this.htmlBridge.style.width  = pos.width + "px";
    this.htmlBridge.style.height = pos.height + "px";
    this.htmlBridge.style.zIndex = pos.zIndex + 1;

    this.setSize(pos.width, pos.height);
  }

  return this;
};