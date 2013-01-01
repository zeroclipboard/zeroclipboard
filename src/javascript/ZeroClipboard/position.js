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