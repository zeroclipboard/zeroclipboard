ZeroClipboard.dispatch = function (id, eventName, args) {
  // receive event from flash movie, send to client
  var client = this.clients[id];
  if (client) {
    client.receiveEvent(eventName, args);
  }
};

ZeroClipboard.Client.prototype.addEventListener = function (eventName, func) {
  // add user event listener for event
  // event types: load, queueStart, fileStart, fileComplete, queueComplete, progress, error, cancel
  eventName = eventName.toString().toLowerCase().replace(/^on/, '');
  if (!this.handlers[eventName]) this.handlers[eventName] = [];
  this.handlers[eventName].push(func);
};

ZeroClipboard.Client.prototype.receiveEvent = function (eventName, args) {
  // receive event from flash
  eventName = eventName.toString().toLowerCase().replace(/^on/, '');

  // special behavior for certain events
  switch (eventName) {
  case 'load':
    // If the flash version is less than 10, throw event.
    if (args && parseFloat(args.flashVersion.replace(",", ".").replace(/[^0-9\.]/gi, '')) < 10) {
      this.receiveEvent("onWrongFlash", { flashVersion: args.flashVersion });
      return;
    }
    // movie claims it is ready, but in IE this isn't always the case...
    // bug fix: Cannot extend EMBED DOM elements in Firefox, must use traditional function
    this.movie = document.getElementById(this.movieId);
    var self;
    if (!this.movie) {
      self = this;
      setTimeout(function () { self.receiveEvent('load', null); }, 1);
      return;
    }

    // firefox on pc needs a "kick" in order to set these in certain cases
    if (!this.ready && navigator.userAgent.match(/Firefox/) && navigator.userAgent.match(/Windows/)) {
      self = this;
      setTimeout(function () { self.receiveEvent('load', null); }, 100);
      this.ready = true;
      return;
    }

    this.ready = true;
    this.movie.setText(this.clipText);
    this.movie.setHandCursor(this.handCursorEnabled);
    break;

  case 'mouseover':
    if (this.domElement && this.cssEffects) {
      this.domElement.addClass('hover');
      if (this.recoverActive) this.domElement.addClass('active');
    }
    break;

  case 'mouseout':
    if (this.domElement && this.cssEffects) {
      this.recoverActive = false;
      if (this.domElement.hasClass('active')) {
        this.domElement.removeClass('active');
        this.recoverActive = true;
      }
      this.domElement.removeClass('hover');
    }
    break;

  case 'mousedown':
    if (this.domElement && this.cssEffects) {
      this.domElement.addClass('active');
    }
    break;

  case 'mouseup':
    if (this.domElement && this.cssEffects) {
      this.domElement.removeClass('active');
      this.recoverActive = false;
    }
    break;
  } // switch eventName

  if (this.handlers[eventName]) {
    for (var idx = 0, len = this.handlers[eventName].length; idx < len; idx++) {
      var func = this.handlers[eventName][idx];

      if (typeof(func) == 'function') {
        // actual function reference
        func(this, args);
      }
      else if ((typeof(func) == 'object') && (func.length == 2)) {
        // PHP style object + method, i.e. [myObject, 'myMethod']
        func[0][func[1]](this, args);
      }
      else if (typeof(func) == 'string') {
        // name of function
        window[func](this, args);
      }
    } // foreach event handler defined
  } // user defined handler for event
};