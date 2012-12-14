ZeroClipboard.getDOMObjectPosition = function (obj, stopObj) {
  // get absolute coordinates for dom element
  var info = {
    left: 0,
    top: 0,
    width: obj.width ? obj.width : obj.offsetWidth,
    height: obj.height ? obj.height : obj.offsetHeight
  };

  while (obj && (obj != stopObj)) {
    info.left += obj.offsetLeft;
    info.left += obj.style.borderLeftWidth ? parseInt(obj.style.borderLeftWidth, 10) : 0;
    info.top += obj.offsetTop;
    info.top += obj.style.borderTopWidth ? parseInt(obj.style.borderTopWidth, 10) : 0;
    obj = obj.offsetParent;
  }

  return info;
};