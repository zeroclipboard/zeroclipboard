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

ZeroClipboard.Client.prototype.reposition = function (elem) {
  // reposition our floating div, optionally to new container
  // warning: container CANNOT change size, only position
  if (elem) {
    this.domElement = ZeroClipboard.$(elem);
    if (!this.domElement) this.hide();
  }

  if (this.domElement && this.div) {
    var box = ZeroClipboard.getDOMObjectPosition(this.domElement);
    var style = this.div.style;
    style.left = '' + box.left + 'px';
    style.top = '' + box.top + 'px';
  }
};

ZeroClipboard.Client.prototype.hide = function () {
  // temporarily hide floater offscreen
  if (this.div) {
    this.div.style.left = '-2000px';
  }
};

ZeroClipboard.Client.prototype.show = function () {
  // show ourselves after a call to hide()
  this.reposition();
};