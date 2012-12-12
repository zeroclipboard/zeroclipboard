ZeroClipboard.version = "{{version}}";
ZeroClipboard.clients = {}; // registered upload clients on page, indexed by id
ZeroClipboard.moviePath = 'ZeroClipboard.swf'; // URL to movie
ZeroClipboard.nextId = 1; // ID of next movie

ZeroClipboard.$ = function (thingy) {
  // simple DOM lookup utility function
  if (typeof(thingy) == 'string') thingy = document.getElementById(thingy);
  if (!thingy.addClass) {
    // extend element with a few useful methods
    thingy.hide = function () { this.style.display = 'none'; };
    thingy.show = function () { this.style.display = ''; };
    thingy.addClass = function (name) { this.removeClass(name); this.className += ' ' + name; };
    thingy.removeClass = function (name) {
      var classes = this.className.split(/\s+/);
      var idx = -1;
      for (var k = 0; k < classes.length; k++) {
        if (classes[k] == name) { idx = k; k = classes.length; }
      }
      if (idx > -1) {
        classes.splice(idx, 1);
        this.className = classes.join(' ');
      }
      return this;
    };
    thingy.hasClass = function (name) {
      return !!this.className.match(new RegExp("\\s*" + name + "\\s*"));
    };
  }
  return thingy;
};

ZeroClipboard.setMoviePath = function (path) {
  // set path to ZeroClipboard.swf
  this.moviePath = path;
};

// use this method in JSNI calls to obtain a new Client instance
ZeroClipboard.newClient = function () {
  return new ZeroClipboard.Client();
};

ZeroClipboard.dispatch = function (id, eventName, args) {
  // receive event from flash movie, send to client
  var client = this.clients[id];
  if (client) {
    client.receiveEvent(eventName, args);
  }
};

ZeroClipboard.register = function (id, client) {
  // register new client to receive events
  this.clients[id] = client;
};

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