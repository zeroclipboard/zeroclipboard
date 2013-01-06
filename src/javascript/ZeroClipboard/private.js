/*
 * Private function _getStyle is used to try and guess the element style; If
 * if we're looking for cursor, then we make a guess for <a>.
 *
 * returns the computed style
 */
var _getStyle = function (el, prop) {
  var y = el.style[prop];

  if (el.currentStyle)
    y = el.currentStyle[prop];
  else if (window.getComputedStyle)
    y = document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);

  if (y == "auto" && prop == "cursor") {
    var possiblePointers = ["a"];
    for (var i = 0; i < possiblePointers.length; i++) {
      if (el.tagName.toLowerCase() == possiblePointers[i]) {
        return "pointer";
      }
    }
  }

  return y;
};

/*
 * The private mouseOver function for an element
 *
 * returns nothing
 */
var _elementMouseOver = function (event) {
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
  ZeroClipboard._client.setCurrent(elementWrapper(target));
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