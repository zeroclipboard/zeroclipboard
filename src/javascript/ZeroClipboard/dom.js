/*
 * Find or create an htmlBridge and flashBridge for the client.
 *
 * returns nothing
 */
var _bridge = function () {
  var flashBridge, len;

  // try and find the current global bridge
  var container = document.getElementById("global-zeroclipboard-html-bridge");

  if (!container) {
    // Get a copy of the `_globalConfig` object to avoid exposing
    // the `amdModuleId` and `cjsModuleId` settings
    var opts = ZeroClipboard.config();
    // Set these last to override them just in case any [v1.2.0-beta.1] users
    // are still passing them in to [v1.2.0-beta.2] (or higher)
    opts.jsModuleId =
      (typeof _amdModuleId === "string" && _amdModuleId) ||
      (typeof _cjsModuleId === "string" && _cjsModuleId) ||
      null;

    // Set `allowScriptAccess` based on `trustedDomains` and `window.location.host` vs. `moviePath`
    var allowScriptAccess = _determineScriptAccess(window.location.host, _globalConfig);

    var flashvars = _vars(opts);
    var swfUrl = _globalConfig.moviePath + _cacheBust(_globalConfig.moviePath, _globalConfig);
    var html = "\
      <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" id=\"global-zeroclipboard-flash-bridge\" width=\"100%\" height=\"100%\"> \
        <param name=\"movie\" value=\"" + swfUrl + "\"/> \
        <param name=\"allowScriptAccess\" value=\"" + allowScriptAccess +  "\"/> \
        <param name=\"scale\" value=\"exactfit\"/> \
        <param name=\"loop\" value=\"false\"/> \
        <param name=\"menu\" value=\"false\"/> \
        <param name=\"quality\" value=\"best\" /> \
        <param name=\"bgcolor\" value=\"#ffffff\"/> \
        <param name=\"wmode\" value=\"transparent\"/> \
        <param name=\"flashvars\" value=\"" + flashvars + "\"/> \
        <embed src=\"" + swfUrl + "\" \
          loop=\"false\" menu=\"false\" \
          quality=\"best\" bgcolor=\"#ffffff\" \
          width=\"100%\" height=\"100%\" \
          name=\"global-zeroclipboard-flash-bridge\" \
          allowScriptAccess=\"" + allowScriptAccess +  "\" \
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
    container.style.zIndex = "" + _getSafeZIndex(_globalConfig.zIndex);

    // NOTE: Fixes https://github.com/zeroclipboard/zeroclipboard/issues/204
    // Although many web developers will tell you that the following 2 lines should be switched to
    // avoid unnecessary reflows, that is (a) not true in modern browsers, and (b) will actually
    // BREAK this particular bit of code in oldIE (IE8, at least, if not IE7 as well). Something
    // odd about oldIE and its parsing of plugin HTML....
    document.body.appendChild(container);
    container.innerHTML = html;
  }

  flashBridge = document["global-zeroclipboard-flash-bridge"];
  if (flashBridge && (len = flashBridge.length)) {
    flashBridge = flashBridge[len - 1];
  }
  flashState.bridge = flashBridge || container.children[0].lastElementChild;
};


/*
 * Get the HTML element container that wraps the Flash bridge object/element.
 * @private
 */
var _getHtmlBridge = function(flashBridge) {
  var isFlashElement = /^OBJECT|EMBED$/;
  var htmlBridge = flashBridge && flashBridge.parentNode;
  while (htmlBridge && isFlashElement.test(htmlBridge.nodeName) && htmlBridge.parentNode) {
    htmlBridge = htmlBridge.parentNode;
  }
  return htmlBridge || null;
};


/*
 * Reposition the Flash object to cover the current element being hovered over.
 *
 * returns object instance
 */
var _reposition = function () {

  // If there is no `currentElement`, skip it
  if (currentElement) {
    var pos = _getDOMObjectPosition(currentElement, _globalConfig.zIndex);

    // new css
    var htmlBridge = _getHtmlBridge(flashState.bridge);
    if (htmlBridge) {
      htmlBridge.style.top    = pos.top + "px";
      htmlBridge.style.left   = pos.left + "px";
      htmlBridge.style.width  = pos.width + "px";
      htmlBridge.style.height = pos.height + "px";
      htmlBridge.style.zIndex = pos.zIndex + 1;
    }

    if (flashState.ready === true && flashState.bridge && typeof flashState.bridge.setSize === "function") {
      flashState.bridge.setSize(pos.width, pos.height);
    }
    else {
      flashState.ready = false;
    }
  }

  return this;
};