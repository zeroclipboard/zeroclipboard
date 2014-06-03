/*jshint -W079 */

/**
 * Store references to critically important global functions that may be
 * overridden on certain web pages.
 */
var _window = window,
    _document = _window.document,
    _navigator = _window.navigator,
    _setTimeout = _window.setTimeout,
    _parseInt = _window.Number.parseInt || _window.parseInt,
    _parseFloat = _window.Number.parseFloat || _window.parseFloat,
    _isNaN = _window.Number.isNaN || _window.isNaN,
    _encodeURIComponent = _window.encodeURIComponent,
    _Math = _window.Math,
    _Date = _window.Date,
    _ActiveXObject = _window.ActiveXObject,
    _slice = _window.Array.prototype.slice,
    _keys = _window.Object.keys,
    _hasOwn = _window.Object.prototype.hasOwnProperty,
    _defineProperty = (function() {
      if (
        typeof _window.Object.defineProperty === "function" &&
        (function() {
          try {
            var x = {};
            _window.Object.defineProperty(x, "y", { value: "z" });
            return x.y === "z";
          }
          catch (e) {
            return false;
          }
        })()
      ) {
        return _window.Object.defineProperty;
      }
    })();
