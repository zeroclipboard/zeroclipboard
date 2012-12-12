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

// setting these objects like this since ZeroClipboard.Client.prototype = {}
// has a chance of overwriting things.
ZeroClipboard.Client.prototype.id = 0; // unique ID for us
ZeroClipboard.Client.prototype.title = "";  // tooltip for the flash element
ZeroClipboard.Client.prototype.ready = false; // whether movie is ready to receive events or not
ZeroClipboard.Client.prototype.movie = null; // reference to movie object
ZeroClipboard.Client.prototype.clipText = ''; // text to copy to clipboard
ZeroClipboard.Client.prototype.handCursorEnabled = true; // whether to show hand cursor, or default pointer cursor
ZeroClipboard.Client.prototype.cssEffects = true; // enable CSS mouse effects on dom container
ZeroClipboard.Client.prototype.handlers = null; // user event handlers
ZeroClipboard.Client.prototype.zIndex = 99; // default zIndex of the movie object

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