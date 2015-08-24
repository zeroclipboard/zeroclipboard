/**
 * Keep track of if the page is framed (in an `iframe`). This can never change.
 * @private
 */
var _pageIsFramed = (function() {
  /*jshint eqeqeq:false */
  // Cannot use ===/!== for comparing WindowProxy objects
  return (
    window.opener == null &&
    (
      (!!window.top && window != window.top) ||
      (!!window.parent && window != window.parent)
    )
  );
})();


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
  sandboxed: null,
  unavailable: null,
  degraded: null,
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
 * The ZeroClipboard library version number, as reported by Flash, at the time the SWF was compiled.
 */
var _zcSwfVersion;


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
 * Keep track of the element that was activated when a `copy` process started.
 * @private
 */
var _copyTarget;


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
 * Keep track of the Flash availability check timeout.
 * @private
 */
var _flashCheckTimeout = 0;


/**
 * Keep track of SWF network errors interval polling.
 * @private
 */
var _swfFallbackCheckInterval = 0;


/**
 * The `message` store for events
 * @private
 */
var _eventMessages = {
  "ready": "Flash communication is established",
  "error": {
    "flash-disabled": "Flash is disabled or not installed. May also be attempting to run Flash in a sandboxed iframe, which is impossible.",
    "flash-outdated": "Flash is too outdated to support ZeroClipboard",
    "flash-sandboxed": "Attempting to run Flash in a sandboxed iframe, which is impossible",
    "flash-unavailable": "Flash is unable to communicate bidirectionally with JavaScript",
    "flash-degraded": "Flash is unable to preserve data fidelity when communicating with JavaScript",
    "flash-deactivated": "Flash is too outdated for your browser and/or is configured as click-to-activate.\nThis may also mean that the ZeroClipboard SWF object could not be loaded, so please check your `swfPath` configuration and/or network connectivity.\nMay also be attempting to run Flash in a sandboxed iframe, which is impossible.",
    "flash-overdue": "Flash communication was established but NOT within the acceptable time limit",
    "version-mismatch": "ZeroClipboard JS version number does not match ZeroClipboard SWF version number",
    "clipboard-error": "At least one error was thrown while ZeroClipboard was attempting to inject your data into the clipboard",
    "config-mismatch": "ZeroClipboard configuration does not match Flash's reality",
    "swf-not-found": "The ZeroClipboard SWF object could not be loaded, so please check your `swfPath` configuration and/or network connectivity"
  }
};


/**
 * The `name`s of `error` events that can only occur is Flash has at least
 * been able to load the SWF successfully.
 * @private
 */
var _errorsThatOnlyOccurAfterFlashLoads = [
  "flash-unavailable",
  "flash-degraded",
  "flash-overdue",
  "version-mismatch",
  "config-mismatch",
  "clipboard-error"
];


/**
 * The `name`s of `error` events that should likely result in the `_flashState`
 * variable's property values being updated.
 * @private
 */
var _flashStateErrorNames = [
  "flash-disabled",
  "flash-outdated",
  "flash-sandboxed",
  "flash-unavailable",
  "flash-degraded",
  "flash-deactivated",
  "flash-overdue"
];


/**
 * A RegExp to match the `name` property of `error` events related to Flash.
 * @private
 */
var _flashStateErrorNameMatchingRegex =
  new RegExp(
    "^flash-(" +
    _flashStateErrorNames
      .map(function(errorName) {
        return errorName.replace(/^flash-/, "");
      })
      .join("|") +
    ")$"
  );


/**
 * A RegExp to match the `name` property of `error` events related to Flash,
 * which is enabled.
 * @private
 */
var _flashStateEnabledErrorNameMatchingRegex =
  new RegExp(
    "^flash-(" +
    _flashStateErrorNames
      .slice(1)
      .map(function(errorName) {
        return errorName.replace(/^flash-/, "");
      })
      .join("|") +
    ")$"
  );


/**
 * ZeroClipboard configuration defaults for the Core module.
 * @private
 */
var _globalConfig = {

  // SWF URL, relative to the page. Default value will be "ZeroClipboard.swf"
  // under the same path as the ZeroClipboard JS file.
  swfPath: _getDefaultSwfPath(),

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

  // Setting this to `false` would allow users to handle calling `ZeroClipboard.focus(...);`
  // themselves instead of relying on our per-element `mouseover` handler.
  autoActivate: true,

  // Bubble synthetic events in JavaScript after they are received by the Flash object.
  bubbleEvents: true,

  // Ensure OS-compliant line endings, i.e. "\r\n" on Windows, "\n" elsewhere
  fixLineEndings: true,

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
