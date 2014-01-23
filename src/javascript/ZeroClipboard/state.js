/* Keep track of the current element that is being hovered. */
var currentElement;

/* Keep track of the state of the Flash object. */
var flashState = {
  // Flash object reference
  bridge: null,

  // Flash metadata
  version: "0.0.0",

  // Flash state
  disabled: null,
  outdated: null,
  ready: null
};

/* Keep track of data for the pending clipboard transaction. */
var _clipData = {};

/* Keep track of the ZeroClipboard client instance counter. */
var clientIdCounter = 0;

/*
 * Keep track of the state of the client instances.
 *
 * Entry structure:
 *   _clientMeta[client.id] = {
 *     instance: client,
 *     elements: [],
 *     handlers: {}
 *   };
 */
var _clientMeta = {};

/* Keep track of the ZeroClipboard clipped elements counter. */
var elementIdCounter = 0;

/*
 * Keep track of the state of the clipped element relationships to clients.
 *
 * Entry structure:
 *   _elementMeta[element.zcClippingId] = [client1.id, client2.id];
 */
var _elementMeta = {};

/* AMD module ID or path to access the ZeroClipboard object */
var _amdModuleId = null;

/* CommonJS module ID or path to access the ZeroClipboard object */
var _cjsModuleId = null;

/* The presumed location of the "ZeroClipboard.swf" file based on the location of the JS. */
var _swfPath = (function() {
  var i, jsDir, tmpJsPath, jsPath,
      swfPath = "ZeroClipboard.swf";
  // If this browser offers the `currentScript` feature
  if (document.currentScript && (jsPath = document.currentScript.src)) {
    // Do nothing, assignment occurred during condition
  }
  else {
    var scripts = document.getElementsByTagName("script");
    // If `script` elements have the `readyState` property in this browser
    if ("readyState" in scripts[0]) {
      for (i = scripts.length; i--; ) {
        if (scripts[i].readyState === "interactive" && (jsPath = scripts[i].src)) {
          // Do nothing, assignment occurred during condition
          break;
        }
      }
    }
    // If the document is still parsing, then the last script in the document is the one that is currently loading
    else if (document.readyState === "loading") {
      jsPath = scripts[scripts.length - 1].src;
    }
    // If every `script` has a `src` attribute AND they all come from the same directory
    else {
      for (i = scripts.length; i--; ) {
        tmpJsPath = scripts[i].src;
        if (!tmpJsPath) {
          jsDir = null;
          break;
        }
        tmpJsPath = tmpJsPath.split("#")[0].split("?")[0];
        tmpJsPath = tmpJsPath.slice(0, tmpJsPath.lastIndexOf("/") + 1);
        if (jsDir == null) {
          jsDir = tmpJsPath;
        }
        else if (jsDir !== tmpJsPath) {
          jsDir = null;
          break;
        }
      }
      if (jsDir !== null) {
        jsPath = jsDir;
      }
    }
    // Otherwise we cannot reliably know what script is executing....
  }
  if (jsPath) {
    jsPath = jsPath.split("#")[0].split("?")[0];
    swfPath = jsPath.slice(0, jsPath.lastIndexOf("/") + 1) + swfPath;
  }
  return swfPath;
})();