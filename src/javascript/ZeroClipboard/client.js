ZeroClipboard.Client = function (elem) {
  // constructor for new simple upload client

  // event handlers
  this.handlers = {};

  // store the element from the page
  this.element = ZeroClipboard.$(elem);

  // setup the flash->Javascript bridge
  this.bridge();

  var self = this;
  this.element.addEventListener("mouseover", function (obj) {
    self.setCurrent(this);
  });

};

ZeroClipboard.Client.prototype.bridge = function () {

  // try and find the current global bridge
  this.htmlBridge = ZeroClipboard.$('#global-zeroclipboard-html-bridge');

  if (this.htmlBridge) {
    this.flashBridge = document["global-zeroclipboard-flash-bridge"];
    return;
  }

  /*jshint multistr:true */
  var html = "\
    <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" id=\"global-zeroclipboard-flash-bridge\" width=\"100%\" height=\"100%\"> \
      <param name=\"movie\" value=\"" + ZeroClipboard.moviePath + "\"/> \
      <param name=\"allowScriptAccess\" value=\"always\" /> \
      <param name=\"scale\" value=\"exactfit\"> \
      <param name=\"loop\" value=\"false\" /> \
      <param name=\"menu\" value=\"false\" /> \
      <param name=\"quality\" value=\"best\" /> \
      <param name=\"bgcolor\" value=\"#ffffff\" /> \
      <param name=\"wmode\" value=\"transparent\"/> \
      <param name=\"flashvars\" value=\"id=1\"/> \
      <embed src=\"" + ZeroClipboard.moviePath + "\" \
        loop=\"false\" menu=\"false\" \
        quality=\"best\" bgcolor=\"#ffffff\" \
        width=\"100%\" height=\"100%\" \
        name=\"global-zeroclipboard-flash-bridge\" \
        allowScriptAccess=\"always\" \
        allowFullScreen=\"false\" \
        type=\"application/x-shockwave-flash\" \
        wmode=\"transparent\" \
        pluginspage=\"http://www.macromedia.com/go/getflashplayer\" \
        flashvars=\"id=1&width=100&height=100\" \
        scale=\"exactfit\"> \
      </embed> \
    </object>";

  this.htmlBridge = document.createElement('div');
  this.htmlBridge.id = "global-zeroclipboard-html-bridge";
  this.htmlBridge.setAttribute("data-clipboard-ready", false);
  this.htmlBridge.style.position = "absolute";
  this.htmlBridge.style.left = "-9999px";
  this.htmlBridge.style.top = "-9999px";
  this.htmlBridge.style.width = "15px";
  this.htmlBridge.style.height = "15px";
  this.htmlBridge.style.zIndex = "9999";

  this.htmlBridge.innerHTML = html;

  var self = this;
  this.htmlBridge.addEventListener("mouseout", function (event) {
    self.resetBridge();
  });

  document.body.appendChild(this.htmlBridge);
  this.flashBridge = document["global-zeroclipboard-flash-bridge"];

};

ZeroClipboard.Client.prototype.resetBridge = function () {
  this.htmlBridge.style.left = "-9999px";
  this.htmlBridge.style.top = "-9999px";
  this.htmlBridge.removeAttribute("title");
};

ZeroClipboard.Client.prototype.ready = function () {
  return this.htmlBridge.getAttribute("data-clipboard-ready");
};

ZeroClipboard.Client.prototype.setCurrent = function (element) {

  // What element is current
  ZeroClipboard.currentElement = this;

  var pos = ZeroClipboard.getDOMObjectPosition(element);

  // new css
  this.htmlBridge.style.top = pos.top + "px";
  this.htmlBridge.style.left = pos.left + "px";
  this.htmlBridge.style.width = pos.width + "px";
  this.htmlBridge.style.height = pos.height + "px";
  this.htmlBridge.style.zIndex = pos.zIndex + 1;

  this.setSize(pos.width, pos.height);

  // If the dom element contains data-clipboard-text set text
  if (element.getAttribute("data-clipboard-text")) {
    this.setText(element.getAttribute("data-clipboard-text"));
  }

  // If the dom element has a title
  if (element.getAttribute("title")) {
    this.setTitle(element.getAttribute("title"));
  }
};

ZeroClipboard.Client.prototype.setText = function (newText) {
  if (this.ready()) this.flashBridge.setText(newText);
};

ZeroClipboard.Client.prototype.setTitle = function (newTitle) {
  // set title of flash element
  this.htmlBridge.setAttribute("title", newTitle);
};

ZeroClipboard.Client.prototype.setSize = function (width, height) {
  if (this.ready()) this.flashBridge.setSize(width, height);
};