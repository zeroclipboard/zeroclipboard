/*
 * Private function _camelizeCssPropName is used to convert standard CSS
 * property names into the equivalent CSS property names for use by oldIE
 * and/or `el.style.{prop}`.
 * e.g. "z-index" -> "zIndex"
 *
 * NOTE: oldIE has other special cases that are not accounted for here,
 * e.g. "float" -> "styleFloat"
 *
 * returns the CSS property name for oldIE and/or `el.style.{prop}`
 */
var _camelizeCssPropName = (function () {
  var matcherRegex = /\-([a-z])/g,
      replacerFn = function (match, group) { return group.toUpperCase(); };

  return function (prop) {
    return prop.replace(matcherRegex, replacerFn);
  };
})();

/*
 * Private function _getStyle is used to try and guess the element style; If
 * if we're looking for cursor, then we make a guess for <a>.
 *
 * returns the computed style
 */
var _getStyle = function (el, prop) {
  var value, camelProp, tagName, possiblePointers, i, len;

  if (window.getComputedStyle) {
    value = window.getComputedStyle(el, null).getPropertyValue(prop);
  }
  else {
    camelProp = _camelizeCssPropName(prop);

    if (el.currentStyle) {
      value = el.currentStyle[camelProp];
    }
    else {
      value = el.style[camelProp];
    }
  }

  if (prop === "cursor") {
    if (!value || value === "auto") {
      tagName = el.tagName.toLowerCase();
      if (tagName === "a") {
        return "pointer";
      }
    }
  }

  return value;
};

/*
 * The private mouseOver function for an element
 *
 * returns nothing
 */
var _elementMouseOver = function (event) {
  // IE usually doesn't pass the event
  if (!event) {
    event = window.event;
  }

  var target;
  // in IE7 this === window
  if (this !== window) {
    target = this;
  } else if (event.target) {
    target = event.target;
  } else if (event.srcElement) {
    target = event.srcElement;
  }

  // Set this as the new currently active element
  ZeroClipboard.activate(target);
};

// private function for adding events to the dom, IE before 9 is suckage
var _addEventHandler = function (element, method, func) {
  if (!element || element.nodeType !== 1) {
    return;
  }

  if (element.addEventListener) { // all browsers except IE before version 9
    element.addEventListener(method, func, false);
  } else if (element.attachEvent) { // IE before version 9
    element.attachEvent("on" + method, func);
  }
};

// private function for removing events from the dom, IE before 9 is suckage
var _removeEventHandler = function (element, method, func) {
  if (!element || element.nodeType !== 1) {
    return;
  }

  if (element.removeEventListener) { // all browsers except IE before version 9
    element.removeEventListener(method, func, false);
  } else if (element.detachEvent) { // IE before version 9
    element.detachEvent("on" + method, func);
  }
};

/*
 * This private function adds a class to the passed in element.
 *
 * returns the element with a new class
 */
var _addClass = function (element, value) {

  if (!element || element.nodeType !== 1) {
    return element;
  }

  // If the element has `classList`
  if (element.classList) {
    if (!element.classList.contains(value)) {
      element.classList.add(value);
    }
    return element;
  }

  if (value && typeof value === "string") {
    var classNames = (value || "").split(/\s+/);

    if (element.nodeType === 1) {
      if (!element.className) {
        element.className = value;
      } else {
        var className = " " + element.className + " ", setClass = element.className;
        for (var c = 0, cl = classNames.length; c < cl; c++) {
          if (className.indexOf(" " + classNames[c] + " ") < 0) {
            setClass += " " + classNames[c];
          }
        }
        // jank trim
        element.className = setClass.replace(/^\s+|\s+$/g, '');
      }
    }

  }

  return element;
};

/*
 * This private function removes a class from the provided elment
 *
 * returns the element without the class
 */
var _removeClass = function (element, value) {

  if (!element || element.nodeType !== 1) {
    return element;
  }

  // If the element has `classList`
  if (element.classList) {
    if (element.classList.contains(value)) {
      element.classList.remove(value);
    }
    return element;
  }

  if ((value && typeof value === "string") || value === undefined) {
    var classNames = (value || "").split(/\s+/);

    if (element.nodeType === 1 && element.className) {
      if (value) {
        var className = (" " + element.className + " ").replace(/[\n\t]/g, " ");
        for (var c = 0, cl = classNames.length; c < cl; c++) {
          className = className.replace(" " + classNames[c] + " ", " ");
        }
        // jank trim
        element.className = className.replace(/^\s+|\s+$/g, '');

      } else {
        element.className = "";
      }
    }

  }

  return element;
};

/*
 * private get the zoom factor of the document. Always returns 1, except at
 * non-default zoom levels in IE<8, and possibly some older versions of WebKit.
 *
 * returns floating unit percentage of the zoom factor (e.g. 150% = `1.5`)
 */
var _getZoomFactor = function () {
  var rect, physicalWidth, logicalWidth,
      zoomFactor = 1;
  if (typeof document.body.getBoundingClientRect === "function") {
    // rect is only in physical pixels in IE<8
    rect = document.body.getBoundingClientRect();
    physicalWidth = rect.right - rect.left;
    logicalWidth = document.body.offsetWidth;

    zoomFactor = Math.round((physicalWidth / logicalWidth) * 100) / 100;
  }
  return zoomFactor;
};

/*
 * private get the dom position of an object.
 *
 * returns json of object's position, height, width, and zIndex
 */
var _getDOMObjectPosition = function (obj, defaultZIndex) {
  // get absolute coordinates for dom element
  var info = {
    left:   0,
    top:    0,
    width:  0,
    height: 0,
    zIndex: _getSafeZIndex(defaultZIndex) - 1
  };

  // Use getBoundingClientRect where available (almost everywhere).
  // See: http://www.quirksmode.org/dom/w3c_cssom.html
  if (obj.getBoundingClientRect) {
    // compute left / top offset (works for `position:fixed`, too!)
    var rect = obj.getBoundingClientRect();
    var pageXOffset, pageYOffset, zoomFactor;

    // IE<9 doesn't support `pageXOffset`/`pageXOffset`
    if ("pageXOffset" in window && "pageYOffset" in window) {
      pageXOffset = window.pageXOffset;
      pageYOffset = window.pageYOffset;
    }
    else {
      zoomFactor = _getZoomFactor();
      pageXOffset = Math.round(document.documentElement.scrollLeft / zoomFactor);
      pageYOffset = Math.round(document.documentElement.scrollTop / zoomFactor);
    }

    // `clientLeft`/`clientTop` are to fix IE's 2px offset in standards mode
    var leftBorderWidth = document.documentElement.clientLeft || 0;
    var topBorderWidth = document.documentElement.clientTop || 0;

    info.left = rect.left + pageXOffset - leftBorderWidth;
    info.top = rect.top + pageYOffset - topBorderWidth;
    info.width = "width" in rect ? rect.width : rect.right - rect.left;
    info.height = "height" in rect ? rect.height : rect.bottom - rect.top;
  }

  return info;
};

/*
 * private _cacheBust function.
 * Will look at a path, and will append "?noCache={time}" or "&noCache={time}" to path.
 * because ExternalInterface craps out when Flash is cached in IE.
 *
 * returns path with noCache param added
 */
var _cacheBust = function (path, options) {
  var cacheBust = options == null || (options && options.cacheBust === true && options.useNoCache === true);
  if (cacheBust) {
    return (path.indexOf("?") === -1 ? "?" : "&") + "noCache=" + (new Date()).getTime();
  } else {
    return "";
  }
};

/*
 * private _vars function.
 * creates a query string for the flashvars
 *
 * returns flashvars separated by &
 */
var _vars = function (options) {
  var i, len, domain,
      str = [],
      domains = [],
      trustedOriginsExpanded = [];

  /** @deprecated `trustedOrigins` in [v1.3.0], slated for removal in [v2.0.0]. See docs for more info. */
  if (options.trustedOrigins) {
    if (typeof options.trustedOrigins === "string") {
      domains.push(options.trustedOrigins);
    }
    else if (typeof options.trustedOrigins === "object" && "length" in options.trustedOrigins) {
      domains = domains.concat(options.trustedOrigins);
    }
  }
  if (options.trustedDomains) {
    if (typeof options.trustedDomains === "string") {
      domains.push(options.trustedDomains);
    }
    else if (typeof options.trustedDomains === "object" && "length" in options.trustedDomains) {
      domains = domains.concat(options.trustedDomains);
    }
  }
  if (domains.length) {
    for (i = 0, len = domains.length; i < len; i++) {
      if (domains.hasOwnProperty(i) && domains[i] && typeof domains[i] === "string") {
        domain = _extractDomain(domains[i]);

        if (!domain) {
          continue;
        }

        // If we encounter a wildcard, ignore everything else as they are irrelevant
        if (domain === "*") {
          trustedOriginsExpanded = [domain];
          break;
        }

        // Add the domain, relative protocol + domain, and absolute protocol + domain ("origin")
        // because Flash Player seems to handle these inconsistently (perhaps in different versions)
        trustedOriginsExpanded.push.apply(
          trustedOriginsExpanded,
          [
            domain,
            "//" + domain,
            window.location.protocol + "//" + domain
          ]
        );
      }
    }
  }
  if (trustedOriginsExpanded.length) {
    str.push("trustedOrigins=" + encodeURIComponent(trustedOriginsExpanded.join(",")));
  }

  // if ZeroClipboard is loaded as an AMD/CommonJS module
  if (typeof options.jsModuleId === "string" && options.jsModuleId) {
    str.push("jsModuleId=" + encodeURIComponent(options.jsModuleId));
  }

  // join the str by &
  return str.join("&");
};

/*
 * private _inArray function.
 * gets the index of an elem in an array
 *
 * returns the index of an element in the array, -1 if not found
 */
var _inArray = function (elem, array, fromIndex) {
  if (typeof array.indexOf === "function") {
    return array.indexOf(elem, fromIndex);
  }

  var i,
      len = array.length;
  if (typeof fromIndex === "undefined") {
    fromIndex = 0;
  } else if (fromIndex < 0) {
    fromIndex = len + fromIndex;
  }
  for (i = fromIndex; i < len; i++) {
    if (array.hasOwnProperty(i) && array[i] === elem) {
      return i;
    }
  }

  return -1;
};

/*
 * private _prepClip function.
 * prepares the elements for clipping/unclipping
 *
 * returns the elements
 */
var _prepClip = function (elements) {

  // if elements is a string
  if (typeof elements === "string") throw new TypeError("ZeroClipboard doesn't accept query strings.");

  // if the elements isn't an array
  if (!elements.length) return [elements];

  return elements;
};


/*
 * private _dispatchCallback
 * used to control if callback should be executed asynchronously or not
 *
 * returns nothing
 */
var _dispatchCallback = function (func, context, args, async) {
  if (async) {
    window.setTimeout(function () {
      func.apply(context, args);
    }, 0);
  }
  else {
    func.apply(context, args);
  }
};


/*
 * private _getSafeZIndex
 * Used to get a safe and numeric value for `zIndex`
 *
 * returns an integer greater than 0
 */
var _getSafeZIndex = function (val) {
  var zIndex, tmp;

  if (val) {
    if (typeof val === "number" && val > 0) {
      zIndex = val;
    }
    else if (typeof val === "string" && (tmp = parseInt(val, 10)) && !isNaN(tmp) && tmp > 0) {
      zIndex = tmp;
    }
  }

  if (!zIndex) {
    if (typeof _globalConfig.zIndex === "number" && _globalConfig.zIndex > 0) {
      zIndex = _globalConfig.zIndex;
    }
    else if (typeof _globalConfig.zIndex === "string" && (tmp = parseInt(_globalConfig.zIndex, 10)) && !isNaN(tmp) && tmp > 0) {
      zIndex = tmp;
    }
  }

  return zIndex || 0;
};


/*
 * private _deprecationWarning
 * If `console` is available, issue a `console.warn`/`console.log` warning against the use of
 * deprecated methods.
 *
 * returns void
 */
var _deprecationWarning = function(deprecatedApiName, debugEnabled) {
  if (deprecatedApiName && debugEnabled !== false && typeof console !== "undefined" && console && (console.warn || console.log)) {
    var deprecationWarning = "`" + deprecatedApiName + "` is deprecated. See docs for more info:\n" +
          "    https://github.com/zeroclipboard/zeroclipboard/blob/master/docs/instructions.md#deprecations";
    if (console.warn) {
      console.warn(deprecationWarning);
    }
    else {
      console.log(deprecationWarning);
    }
  }
};


/*
 * Shallow-copy the owned properties of one object over to another, similar to jQuery's `$.extend`.
 * @returns the target object
 * @private
 */
var _extend = function() {
  var i, len, arg, prop, src, copy,
      target = arguments[0] || {};

  for (i = 1, len = arguments.length; i < len; i++) {
    // Only deal with non-null/undefined values
    if ((arg = arguments[i]) != null) {
      // Extend the base object
      for (prop in arg) {
        if (arg.hasOwnProperty(prop)) {
          src = target[prop];
          copy = arg[prop];

          // Prevent never-ending loops
          if (target === copy) {
            continue;
          }

          // Don't bring in undefined values
          if (copy !== undefined) {
            target[prop] = copy;
          }
        }
      }
    }
  }
  return target;
};


/*
 * Extract the domain (e.g. "github.com") from an origin (e.g. "https://github.com") or
 * URL (e.g. "https://github.com/zeroclipboard/zeroclipboard/").
 * @returns the domain
 * @private
 */
var _extractDomain = function(originOrUrl) {
  if (originOrUrl == null || originOrUrl === "") {
    return null;
  }

  // Trim
  originOrUrl = originOrUrl.replace(/^\s+|\s+$/g, "");
  if (originOrUrl === "") {
    return null;
  }

  // Strip the protocol, if any was provided
  var protocolIndex = originOrUrl.indexOf("//");
  originOrUrl = protocolIndex === -1 ? originOrUrl : originOrUrl.slice(protocolIndex + 2);

  // Strip the path, if any was provided
  var pathIndex = originOrUrl.indexOf("/");
  originOrUrl = pathIndex === -1 ? originOrUrl : protocolIndex === -1 || pathIndex === 0 ? null : originOrUrl.slice(0, pathIndex);

  if (originOrUrl && originOrUrl.slice(-4).toLowerCase() === ".swf") {
    return null;
  }
  return originOrUrl || null;
};


/**
 * Set `allowScriptAccess` based on `trustedDomains` and `window.location.host` vs. `moviePath`
 * @private
 */
var _determineScriptAccess = (function() {
  var _extractAllDomains = function(origins, resultsArray) {
    var i, len, tmp;
    if (origins != null && resultsArray[0] !== "*") {
      if (typeof origins === "string") {
        origins = [origins];
      }
      if (typeof origins === "object" && "length" in origins) {
        for (i = 0, len = origins.length; i < len; i++) {
          if (origins.hasOwnProperty(i)) {
            tmp = _extractDomain(origins[i]);
            if (tmp) {
              if (tmp === "*") {
                resultsArray.length = 0;
                resultsArray.push("*");
                break;
              }
              if (_inArray(tmp, resultsArray) === -1) {
                resultsArray.push(tmp);
              }
            }
          }
        }
      }
    }
  };

  var _accessLevelLookup = {
    "always": "always",
    "samedomain": "sameDomain",
    "never": "never"
  };

  return function(currentDomain, configOptions) {
    var asaLower,
        allowScriptAccess = configOptions.allowScriptAccess;

    if (typeof allowScriptAccess === "string" && (asaLower = allowScriptAccess.toLowerCase()) && /^always|samedomain|never$/.test(asaLower)) {
      return _accessLevelLookup[asaLower];
    }
    // else...

    // Get SWF domain
    var swfDomain = _extractDomain(configOptions.moviePath);
    if (swfDomain === null) {
      swfDomain = currentDomain;
    }
    // Get all trusted domains
    var trustedDomains = [];
    _extractAllDomains(configOptions.trustedOrigins, trustedDomains);
    _extractAllDomains(configOptions.trustedDomains, trustedDomains);

    var len = trustedDomains.length;
    if (len > 0) {
      if (len === 1 && trustedDomains[0] === "*") {
        return "always";
      }
      if (_inArray(currentDomain, trustedDomains) !== -1) {
        if (len === 1 && currentDomain === swfDomain) {
          return "sameDomain";
        }
        return "always";
      }
    }
    return "never";
  };
})();


/**
 * Get all of an object's owned, enumerable property names, Does NOT include prototype properties.
 * @returns an array of property names
 * @private
 */
var _objectKeys = function (obj) {
  // Avoid the impending `TypeError`
  if (obj == null) {
    return [];
  }
  if (Object.keys) {
    return Object.keys(obj);
  }
  var keys = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      keys.push(prop);
    }
  }
  return keys;
};


/**
 * Remove all owned properties from an object.
 *
 * @returns the original object with its owned properties
 *
 * @private
 */
var _deleteOwnProperties = function(obj) {
  if (obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        delete obj[prop];
      }
    }
  }
  return obj;
};