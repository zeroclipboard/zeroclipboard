/*
 * private get the dom position of an object.
 *
 * returns json of objects position, height, width, and zindex
 */
var _getDOMObjectPosition = function (obj) {
  // get absolute coordinates for dom element
  var info = {
    left: 0,
    top: 0,
    width: obj.width ? obj.width : obj.offsetWidth,
    height: obj.height ? obj.height : obj.offsetHeight,
    zIndex: 9999
  };


  var zi = _getStyle(obj, "zIndex");
  // float just above object, or default zIndex if dom element isn't set
  if (zi && zi != "auto") {
    info.zIndex = parseInt(zi, 10);
  }

  while (obj) {
    info.left += obj.offsetLeft;
    info.left += _getStyle(obj, "borderLeftWidth") ? parseInt(_getStyle(obj, "borderLeftWidth"), 10) : 0;
    info.top += obj.offsetTop;
    info.top += _getStyle(obj, "borderTopWidth") ? parseInt(_getStyle(obj, "borderTopWidth"), 10) : 0;
    obj = obj.offsetParent;
  }

  return info;
};