ZeroClipboard.Client.prototype.bridge = function () {

  // try and find the current global bridge
  this.flashBridge = ZeroClipboard.$('#global-zeroclipboard-flash-bridge');

  if (this.flashBridge.length === 0) {

    /*jshint multistr:true */
    var html = "\
      <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" id=\"global-zeroclipboard-object-tag\" width=\"100%\" height=\"100%\"> \
        <param name=\"movie\" value=\"" + ZeroClipboard.moviePath + "\"/> \
        <param name=\"allowScriptAccess\" value=\"always\" /> \
        <param name=\"scale\" value=\"exactfit\"> \
        <embed src=\"" + ZeroClipboard.moviePath + "\" \
          width=\"100%\" height=\"100%\" \
          name=\"global-zeroclipboard-object-tag\" \
          allowScriptAccess=\"always\" \
          scale=\"exactfit\"> \
        </embed> \
      </object>";

    this.flashBridge = document.createElement('div');
    this.flashBridge.id = "global-zeroclipboard-flash-bridge";
    this.flashBridge.style.position = "absolute";
    this.flashBridge.style.left = "-9999px";
    this.flashBridge.style.top = "-9999px";
    this.flashBridge.style.width = "15px";
    this.flashBridge.style.height = "15px";
    this.flashBridge.style.border = "1px solid red";

    this.flashBridge.innerHTML = html;

    // check if the element has a title
    if (this.element.getAttribute("title")) {
      this.flashBridge.setAttribute("title", this.element.getAttribute("title"));
    }

    // If the dom element contains data-clipboard-text set a default
    if (!this.clipText && this.domElement.getAttribute("data-clipboard-text")) {
      this.clipText = this.domElement.getAttribute("data-clipboard-text");
    }

    document.body.appendChild(this.flashBridge);
  }

  // float just above object, or default zIndex if dom element isn't set
  // if (this.domElement.style.zIndex) {
  //   this.zIndex = parseInt(this.domElement.style.zIndex, 10) + 1;
  // }

  // // check if the element has a title
  // if (!this.title && this.domElement.getAttribute("title")) {
  //   this.title = this.domElement.getAttribute("title");
  // }

  // // If the dom element contains data-clipboard-text set a default
  // if (!this.clipText && this.domElement.getAttribute("data-clipboard-text")) {
  //   this.clipText = this.domElement.getAttribute("data-clipboard-text");
  // }

  // if (typeof(appendElem) == 'string') {
  //   appendElem = ZeroClipboard.$(appendElem);
  // }
  // else if (typeof(appendElem) == 'undefined') {
  //   appendElem = document.getElementsByTagName('body')[0];
  // }

  // // find X/Y position of domElement
  // var box = ZeroClipboard.getDOMObjectPosition(this.domElement, appendElem);

  // // create floating DIV above element
  // this.div = document.createElement('div');

  // var style = this.div.style;
  // style.position = 'absolute';
  // style.left = '' + box.left + 'px';
  // style.top = '' + box.top + 'px';
  // style.width = '' + box.width + 'px';
  // style.height = '' + box.height + 'px';
  // style.zIndex = this.zIndex;

  // if (typeof(stylesToAdd) == 'object') {
  //   for (var addedStyle in stylesToAdd) {
  //     style[addedStyle] = stylesToAdd[addedStyle];
  //   }
  // }

  // // first create entire div before appending to the DOM
  // this.div.innerHTML = this.getHTML(box.width, box.height);
  // appendElem.appendChild(this.div);
};