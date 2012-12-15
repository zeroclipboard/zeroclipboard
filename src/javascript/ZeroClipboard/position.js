/*
 * Get the dom position of an object.
 *
 * returns json of objects position, height, width, and zindex
 */
ZeroClipboard.getDOMObjectPosition = function (obj) {
  // get absolute coordinates for dom element
  var info = {
    left: 0,
    top: 0,
    width: obj.width ? obj.width : obj.offsetWidth,
    height: obj.height ? obj.height : obj.offsetHeight,
    zIndex: 9999
  };

  // float just above object, or default zIndex if dom element isn't set
  if (obj.style.zIndex) {
    info.zIndex = parseInt(element.style.zIndex, 10);
  }

  while (obj) {
    info.left += obj.offsetLeft;
    info.left += obj.style.borderLeftWidth ? parseInt(obj.style.borderLeftWidth, 10) : 0;
    info.top += obj.offsetTop;
    info.top += obj.style.borderTopWidth ? parseInt(obj.style.borderTopWidth, 10) : 0;
    obj = obj.offsetParent;
  }

  return info;
};