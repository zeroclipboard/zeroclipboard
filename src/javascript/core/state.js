/**
 * Keep track of the state of the Flash object.
 * @private
 */
var _flashState = {
  // Flash object reference
  bridge: null,

  // Flash metadata
  version: "0.0.0",
  pluginType: "unknown",

  // Flash SWF state
  disabled: null,
  outdated: null,
  unavailable: null,
  deactivated: null,
  overdue: null,
  ready: null
};


/**
 * The minimum Flash Player version required to use ZeroClipboard completely.
 * @readonly
 * @private
 */
var _minimumFlashVersion = "11.0.0";


/**
 * Keep track of all event listener registrations.
 * @private
 */
var _handlers = {};


/**
 * Keep track of the currently activated element.
 * @private
 */
var _currentElement;


/**
 * Keep track of data for the pending clipboard transaction.
 * @private
 */
var _clipData = {};


/**
 * Keep track of data formats for the pending clipboard transaction.
 * @private
 */
var _clipDataFormatMap = null;


/**
 * The `message` store for events
 * @private
 */
var _eventMessages = {
  "ready": "Flash communication is established",
  "error": {
    "flash-disabled": "Flash is disabled or not installed",
    "flash-outdated": "Flash is too outdated to support ZeroClipboard",
    "flash-unavailable": "Flash is unable to communicate bidirectionally with JavaScript",
    "flash-deactivated": "Flash is too outdated for your browser and/or is configured as click-to-activate",
    "flash-overdue": "Flash communication was established but NOT within the acceptable time limit"
  }
};


/**
 * The presumed location of the "ZeroClipboard.swf" file, based on the location
 * of the executing JavaScript file (e.g. "ZeroClipboard.js", etc.).
 * @private
 */
var _swfPath = (function() {
  var i, jsDir, tmpJsPath, jsPath,
      swfPath = "ZeroClipboard.swf";
  // Try to leverage the `currentScript` feature
  if (!(_document.currentScript && (jsPath = _document.currentScript.src))) {
    // If it it not available, then seek the script out instead...
    var scripts = _document.getElementsByTagName("script");
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
    else if (_document.readyState === "loading") {
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


/**
 * ZeroClipboard configuration defaults for the Core module.
 * @private
 */
var _globalConfig = {

  // SWF URL, relative to the page. Default value will be "ZeroClipboard.swf"
  // under the same path as the ZeroClipboard JS file.
  swfPath: _swfPath,

  // SWF inbound scripting policy: page domains that the SWF should trust.
  // (single string, or array of strings)
  trustedDomains: window.location.host ? [window.location.host] : [],

  // Include a "noCache" query parameter on requests for the SWF.
  cacheBust: true,

  // Enable use of the fancy "Desktop" clipboard, even on Linux where it is
  // known to suck.
  forceEnhancedClipboard: false,

  // How many milliseconds to wait for the Flash SWF to load and respond before assuming that
  // Flash is deactivated (e.g. click-to-play) in the user's browser. If you don't care about
  // how long it takes to load the SWF, you can set this to `null`.
  flashLoadTimeout: 30000,

  // Setting this to `false` would allow users to handle calling `ZeroClipboard.activate(...);`
  // themselves instead of relying on our per-element `mouseover` handler.
  autoActivate: true,

  // Bubble synthetic events in JavaScript after they are received by the Flash object.
  bubbleEvents: true,
  
  // Sets the ID of the `div` encapsulating the Flash object.
  // Value is validated against the HTML4 spec for `ID` tokens.
  containerId: "global-zeroclipboard-html-bridge",
 
  // Sets the class of the `div` encapsulating the Flash object.
  containerClass: "global-zeroclipboard-container",
 
  // Sets the ID and name of the Flash `object` element.
  // Value is validated against the HTML4 spec for `ID` and `Name` tokens.
  swfObjectId: "global-zeroclipboard-flash-bridge",

  // The class used to indicate that a clipped element is being hovered over.
  hoverClass: "zeroclipboard-is-hover",

  // The class used to indicate that a clipped element is active (is being clicked).
  activeClass: "zeroclipboard-is-active",



  // Forcibly set the hand cursor ("pointer") for all clipped elements.
  // IMPORTANT: This configuration value CAN be modified while a SWF is actively embedded.
  forceHandCursor: false,

  // Sets the title of the `div` encapsulating the Flash object.
  // IMPORTANT: This configuration value CAN be modified while a SWF is actively embedded.
  title: null,

  // The z-index used by the Flash object.
  // Max value (32-bit): 2147483647.
  // IMPORTANT: This configuration value CAN be modified while a SWF is actively embedded.
  zIndex: 999999999

};
