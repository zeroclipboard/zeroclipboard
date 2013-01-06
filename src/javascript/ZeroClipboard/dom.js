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
 * private get the dom position of an object.
 *
 * returns json of objects position, height, width, and zindex
 */
var _getDOMObjectPosition = function (obj) {
  // get absolute coordinates for dom element
  var info = {
    left:   0,
    top:    0,
    width:  obj.width  || obj.offsetWidth  || 0,
    height: obj.height || obj.offsetHeight || 0,
    zIndex: 9999
  };


  var zi = _getStyle(obj, "zIndex");
  // float just above object, or default zIndex if dom element isn't set
  if (zi && zi != "auto") {
    info.zIndex = parseInt(zi, 10);
  }

  while (obj) {

    var borderLeftWidth = parseInt(_getStyle(obj, "borderLeftWidth"), 10);
    var borderTopWidth  = parseInt(_getStyle(obj, "borderTopWidth"), 10);

    info.left += isNaN(obj.offsetLeft)  ? 0 : obj.offsetLeft;
    info.left += isNaN(borderLeftWidth) ? 0 : borderLeftWidth;
    info.top  += isNaN(obj.offsetTop)   ? 0 : obj.offsetTop;
    info.top  += isNaN(borderTopWidth)  ? 0 : borderTopWidth;

    obj = obj.offsetParent;
  }

  return info;
};