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

  if (value === "auto" && prop === "cursor") {
    tagName = el.tagName.toLowerCase();
    possiblePointers = ["a"];
    for (i = 0, len = possiblePointers.length; i < len; i++) {
      if (tagName === possiblePointers[i]) {
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

  // If the singleton doesn't exist return
  if (!ZeroClipboard.prototype._singleton) return;

  // IE won't have event
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
  ZeroClipboard.prototype._singleton.setCurrent(target);
};

// private function for adding events to the dom, IE before 9 is suckage
var _addEventHandler = function (element, method, func) {
  if (element.addEventListener) { // all browsers except IE before version 9
    element.addEventListener(method, func, false);
  } else if (element.attachEvent) { // IE before version 9
    element.attachEvent("on" + method, func);
  }
};

// private function for removing events from the dom, IE before 9 is suckage
var _removeEventHandler = function (element, method, func) {
  if (element.removeEventListener) { // all browsers except IE before version 9
    element.removeEventListener(method, func, false);
  } else if (element.detachEvent) { // IE before version 9
    element.detachEvent("on" + method, func);
  }
};

/*
 * This private function adds a class to the passed in element.
 * paired down version of addClass from jQuery https://github.com/jquery/jquery/blob/master/speed/jquery-basis.js#L1227
 *
 * returns the element with a new class
 */
var _addClass = function (element, value) {

  // If the element has addClass already
  if (element.addClass) {
    element.addClass(value);
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
 * paired down version of removeClass from jQuery https://github.com/jquery/jquery/blob/master/speed/jquery-basis.js#L1261
 *
 * returns the element without the class
 */
var _removeClass = function (element, value) {

  // If the element has removeClass already
  if (element.removeClass) {
    element.removeClass(value);
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
var _getDOMObjectPosition = function (obj) {
  // get absolute coordinates for dom element
  var info = {
    left:   0,
    top:    0,
    width:  0,
    height: 0,
    zIndex: 999999999  /* Max value (32-bit): 2147483647 */
  };


  var zi = _getStyle(obj, "z-index");
  // float just above object, or default zIndex if dom element isn't set
  if (zi && zi !== "auto") {
    info.zIndex = parseInt(zi, 10);
  }

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
 * private _noCache function.
 * Will look at a path, and will append ?nocache=date or &nocache=date to path.
 * because externalenterface craps out when flash is cached. (IE)
 *
 * returns path with noncache param added
 */
var _noCache = function (path) {
  var client = ZeroClipboard.prototype._singleton;
  if (client.options.useNoCache) {
    return (path.indexOf("?") >= 0 ? "&nocache=" : "?nocache=") + (new Date()).getTime();
  } else {
    return "";
  }
};

/*
 * private _vars function.
 * creates a query string for the flasvars
 *
 * returns flashvars separated by &
 */
var _vars = function (options) {
  var str = [];

  // if trusted domain is set
  if (options.trustedDomains) {
    var domains;
    if (typeof options.trustedDomains === "string" && options.trustedDomains) {
      domains = [options.trustedDomains];
    }
    else if ("length" in options.trustedDomains) {
      domains = options.trustedDomains;
    }
    str.push("trustedDomain=" + encodeURIComponent(domains.join(",")));
  }

  // if ZeroClipboard is loaded as an AMD module
  if (typeof options.amdModuleId === "string" && options.amdModuleId) {
    str.push("amdModuleId=" + encodeURIComponent(options.amdModuleId));
  }

  // if ZeroClipboard is loaded as a CommonJS module
  if (typeof options.cjsModuleId === "string" && options.cjsModuleId) {
    str.push("cjsModuleId=" + encodeURIComponent(options.cjsModuleId));
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
var _inArray = function (elem, array) {
  if (array.indexOf) {
    return array.indexOf(elem);
  }

  for (var i = 0, length = array.length; i < length; i++) {
    if (array[i] === elem) {
      return i;
    }
  }

  return -1;
};

/*
 * private _prepGlue function.
 * prepares the elements for gluing/ungluing
 *
 * returns the elements
 */
var _prepGlue = function (elements) {

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

var _dispatchCallback = function (func, element, instance, args, async) {
  if (async) {
    window.setTimeout(function () {
      func.call(element, instance, args);
    }, 0);
  } else {
    func.call(element, instance, args);
  }
};
