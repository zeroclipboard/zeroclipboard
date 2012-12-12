ZeroClipboard.Client = function (elem) {
  // constructor for new simple upload client
  this.handlers = {};

  // unique ID
  this.id = ZeroClipboard.nextId++;
  this.movieId = 'ZeroClipboardMovie_' + this.id;

  // register client with singleton to receive flash events
  ZeroClipboard.register(this.id, this);

  // create movie
  if (elem) this.glue(elem);
};

ZeroClipboard.Client.prototype = {
  id: 0, // unique ID for us
  title: "",  // tooltip for the flash element
  ready: false, // whether movie is ready to receive events or not
  movie: null, // reference to movie object
  clipText: '', // text to copy to clipboard
  handCursorEnabled: true, // whether to show hand cursor, or default pointer cursor
  cssEffects: true, // enable CSS mouse effects on dom container
  handlers: null, // user event handlers
  zIndex: 99 // default zIndex of the movie object
};

ZeroClipboard.Client.prototype.glue = function (elem, appendElem, stylesToAdd) {
  // glue to DOM element
  // elem can be ID or actual DOM element object
  this.domElement = ZeroClipboard.$(elem);

  // float just above object, or default zIndex if dom element isn't set
  if (this.domElement.style.zIndex) {
    this.zIndex = parseInt(this.domElement.style.zIndex, 10) + 1;
  }

  // check if the element has a title
  if (!this.title && this.domElement.getAttribute("title")) {
    this.title = this.domElement.getAttribute("title");
  }

  // If the dom element contains data-clipboard-text set a default
  if (!this.clipText && this.domElement.getAttribute("data-clipboard-text")) {
    this.clipText = this.domElement.getAttribute("data-clipboard-text");
  }

  if (typeof(appendElem) == 'string') {
    appendElem = ZeroClipboard.$(appendElem);
  }
  else if (typeof(appendElem) == 'undefined') {
    appendElem = document.getElementsByTagName('body')[0];
  }

  // find X/Y position of domElement
  var box = ZeroClipboard.getDOMObjectPosition(this.domElement, appendElem);

  // create floating DIV above element
  this.div = document.createElement('div');
  var style = this.div.style;
  style.position = 'absolute';
  style.left = '' + box.left + 'px';
  style.top = '' + box.top + 'px';
  style.width = '' + box.width + 'px';
  style.height = '' + box.height + 'px';
  style.zIndex = this.zIndex;

  if (typeof(stylesToAdd) == 'object') {
    for (var addedStyle in stylesToAdd) {
      style[addedStyle] = stylesToAdd[addedStyle];
    }
  }

  // style.backgroundColor = '#f00'; // debug

  appendElem.appendChild(this.div);

  this.div.innerHTML = this.getHTML(box.width, box.height);
};

ZeroClipboard.Client.prototype.getHTML = function (width, height) {
  // return HTML for movie
  var html = '';
  var flashvars = 'id=' + this.id +
    '&width=' + width +
    '&height=' + height,
          title = this.title ? ' title="' + this.title + '"' : '';

  if (navigator.userAgent.match(/MSIE/)) {
    // IE gets an OBJECT tag
    var protocol = location.href.match(/^https/i) ? 'https://' : 'http://';
    html += '<object' + title + ' classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="' + protocol + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="' + width + '" height="' + height + '" id="' + this.movieId + '"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="' + ZeroClipboard.moviePath + '" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="' + flashvars + '"/><param name="wmode" value="transparent"/></object>';
  }
  else {
    // all other browsers get an EMBED tag
    html += '<embed' + title + ' id="' + this.movieId + '" src="' + ZeroClipboard.moviePath + '" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="' + width + '" height="' + height + '" name="' + this.movieId + '" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="' + flashvars + '" wmode="transparent" />';
  }
  return html;
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

ZeroClipboard.Client.prototype.destroy = function () {
  // destroy control and floater
  if (this.domElement && this.div) {
    this.hide();
    this.div.innerHTML = '';

    var body = document.getElementsByTagName('body')[0];
    try { body.removeChild(this.div); } catch (e) {}

    this.domElement = null;
    this.div = null;
  }
};

ZeroClipboard.Client.prototype.setText = function (newText) {
  // set text to be copied to clipboard
  this.clipText = newText;
  if (this.ready) this.movie.setText(newText);
};

ZeroClipboard.Client.prototype.setTitle = function (newTitle) {
  // set title of flash element
  this.title = newTitle;
  // Update the already glued object if it exists.
  if (this.div) {
    var flashElems = this.div.children;
    if (flashElems.length) {
      flashElems[0].setAttribute('title', this.title);
    }
  }
};

ZeroClipboard.Client.prototype.setHandCursor = function (enabled) {
  // enable hand cursor (true), or default arrow cursor (false)
  this.handCursorEnabled = enabled;
  if (this.ready) this.movie.setHandCursor(enabled);
};

ZeroClipboard.Client.prototype.setCSSEffects = function (enabled) {
  // enable or disable CSS effects on DOM container
  this.cssEffects = !!enabled;
};