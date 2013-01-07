/*!
 * zeroclipboard
 * The Zero Clipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie, and a JavaScript interface.
 * Copyright 2012 Jon Rohan, James M. Greene, .
 * Released under the MIT license
 * http://jonrohan.github.com/ZeroClipboard/
 * v1.1.6
 */(function() {
  "use strict";
  var _getStyle = function(el, prop) {
    var y = el.style[prop];
    if (el.currentStyle) y = el.currentStyle[prop]; else if (window.getComputedStyle) y = document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
    if (y == "auto" && prop == "cursor") {
      var possiblePointers = [ "a" ];
      for (var i = 0; i < possiblePointers.length; i++) {
        if (el.tagName.toLowerCase() == possiblePointers[i]) {
          return "pointer";
        }
      }
    }
    return y;
  };
  var _elementMouseOver = function(event) {
    if (!event) {
      event = window.event;
    }
    var target;
    if (this !== window) {
      target = this;
    } else if (event.target) {
      target = event.target;
    } else if (event.srcElement) {
      target = event.srcElement;
    }
    ZeroClipboard.prototype._singleton.setCurrent(target);
  };
  var _addEventHandler = function(element, method, func) {
    if (element.addEventListener) {
      element.addEventListener(method, func, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + method, func);
    }
  };
  var _removeEventHandler = function(element, method, func) {
    if (element.removeEventListener) {
      element.removeEventListener(method, func, false);
    } else if (element.detachEvent) {
      element.detachEvent("on" + method, func);
    }
  };
  var _addClass = function(element, value) {
    if (element.addClass) {
      element.addClass(value);
      return element;
    }
    if (value && typeof value === "string") {
      var classNames = (value || "").split(/\s+/);
      if (element.nodeType === 1) {
        if (!element.className) {
          element.className = value;
        } else {
          var className = " " + element.className + " ", setClass = element.className;
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            if (className.indexOf(" " + classNames[c] + " ") < 0) {
              setClass += " " + classNames[c];
            }
          }
          element.className = setClass.replace(/^\s+|\s+$/g, "");
        }
      }
    }
    return element;
  };
  var _removeClass = function(element, value) {
    if (element.removeClass) {
      element.removeClass(value);
      return element;
    }
    if (value && typeof value === "string" || value === undefined) {
      var classNames = (value || "").split(/\s+/);
      if (element.nodeType === 1 && element.className) {
        if (value) {
          var className = (" " + element.className + " ").replace(/[\n\t]/g, " ");
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            className = className.replace(" " + classNames[c] + " ", " ");
          }
          element.className = className.replace(/^\s+|\s+$/g, "");
        } else {
          element.className = "";
        }
      }
    }
    return element;
  };
  var _getDOMObjectPosition = function(obj) {
    var info = {
      left: 0,
      top: 0,
      width: obj.width || obj.offsetWidth || 0,
      height: obj.height || obj.offsetHeight || 0,
      zIndex: 9999
    };
    var zi = _getStyle(obj, "zIndex");
    if (zi && zi != "auto") {
      info.zIndex = parseInt(zi, 10);
    }
    while (obj) {
      var borderLeftWidth = parseInt(_getStyle(obj, "borderLeftWidth"), 10);
      var borderTopWidth = parseInt(_getStyle(obj, "borderTopWidth"), 10);
      info.left += isNaN(obj.offsetLeft) ? 0 : obj.offsetLeft;
      info.left += isNaN(borderLeftWidth) ? 0 : borderLeftWidth;
      info.top += isNaN(obj.offsetTop) ? 0 : obj.offsetTop;
      info.top += isNaN(borderTopWidth) ? 0 : borderTopWidth;
      obj = obj.offsetParent;
    }
    return info;
  };
  var _noCache = function(path) {
    return (path.indexOf("?") >= 0 ? "&" : "?") + "nocache=" + (new Date).getTime();
  };
  var _vars = function() {
    var str = [];
    if (ZeroClipboard._trustedDomain) str.push("trustedDomain=" + ZeroClipboard._trustedDomain);
    return str.join("&");
  };
  var _inArray = function(elem, array) {
    if (array.indexOf) {
      return array.indexOf(elem);
    }
    for (var i = 0, length = array.length; i < length; i++) {
      if (array[i] === elem) {
        return i;
      }
    }
    return -1;
  };
  var ZeroClipboard = function(elements) {
    if (elements) (ZeroClipboard.prototype._singleton || this).glue(elements);
    if (ZeroClipboard.prototype._singleton) return ZeroClipboard.prototype._singleton;
    ZeroClipboard.prototype._singleton = this;
    this.handlers = {};
    this._text = null;
    if (ZeroClipboard.detectFlashSupport()) this.bridge();
  };
  var currentElement, gluedElements = [];
  ZeroClipboard.prototype.setCurrent = function(element) {
    currentElement = element;
    this.reposition();
    this.setText(this._text || element.getAttribute("data-clipboard-text"));
    if (element.getAttribute("title")) {
      this.setTitle(element.getAttribute("title"));
    }
    this.setHandCursor(_getStyle(element, "cursor") == "pointer");
  };
  ZeroClipboard.prototype.setText = function(newText) {
    if (newText && newText !== "") {
      this._text = newText;
      if (this.ready()) this.flashBridge.setText(newText);
    }
  };
  ZeroClipboard.prototype.resetText = function() {
    this._text = null;
  };
  ZeroClipboard.prototype.setTitle = function(newTitle) {
    if (newTitle && newTitle !== "") this.htmlBridge.setAttribute("title", newTitle);
  };
  ZeroClipboard.prototype.setSize = function(width, height) {
    if (this.ready()) this.flashBridge.setSize(width, height);
  };
  ZeroClipboard.prototype.setHandCursor = function(enabled) {
    if (this.ready()) this.flashBridge.setHandCursor(enabled);
  };
  ZeroClipboard.version = "1.1.6";
  ZeroClipboard._moviePath = "ZeroClipboard.swf";
  ZeroClipboard.setMoviePath = function(path) {
    this._moviePath = path;
  };
  ZeroClipboard.setTrustedDomain = function(domain) {
    this._trustedDomain = domain;
  };
  ZeroClipboard.destroy = function() {
    var bridge = document.getElementById("global-zeroclipboard-html-bridge");
    if (!bridge) return;
    ZeroClipboard.prototype._singleton.unglue(gluedElements);
    delete ZeroClipboard.prototype._singleton;
    delete ZeroClipboard._trustedDomain;
    ZeroClipboard._moviePath = "ZeroClipboard.swf";
    bridge.parentNode.removeChild(bridge);
  };
  ZeroClipboard.detectFlashSupport = function() {
    var hasFlash = false;
    try {
      if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) {
        hasFlash = true;
      }
    } catch (error) {
      if (navigator.mimeTypes["application/x-shockwave-flash"]) {
        hasFlash = true;
      }
    }
    return hasFlash;
  };
  ZeroClipboard.prototype.bridge = function() {
    this.htmlBridge = document.getElementById("global-zeroclipboard-html-bridge");
    if (this.htmlBridge) {
      this.flashBridge = document["global-zeroclipboard-flash-bridge"];
      return;
    }
    var html = '    <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-zeroclipboard-flash-bridge" width="100%" height="100%">       <param name="movie" value="' + ZeroClipboard._moviePath + _noCache(ZeroClipboard._moviePath) + '"/>       <param name="allowScriptAccess" value="always" />       <param name="scale" value="exactfit">       <param name="loop" value="false" />       <param name="menu" value="false" />       <param name="quality" value="best" />       <param name="bgcolor" value="#ffffff" />       <param name="wmode" value="transparent"/>       <param name="flashvars" value="' + _vars() + '"/>       <embed src="' + ZeroClipboard._moviePath + _noCache(ZeroClipboard._moviePath) + '"         loop="false" menu="false"         quality="best" bgcolor="#ffffff"         width="100%" height="100%"         name="global-zeroclipboard-flash-bridge"         allowScriptAccess="always"         allowFullScreen="false"         type="application/x-shockwave-flash"         wmode="transparent"         pluginspage="http://www.macromedia.com/go/getflashplayer"         flashvars="' + _vars() + '"         scale="exactfit">       </embed>     </object>';
    this.htmlBridge = document.createElement("div");
    this.htmlBridge.id = "global-zeroclipboard-html-bridge";
    this.htmlBridge.setAttribute("class", "global-zeroclipboard-container");
    this.htmlBridge.setAttribute("data-clipboard-ready", false);
    this.htmlBridge.style.position = "absolute";
    this.htmlBridge.style.left = "-9999px";
    this.htmlBridge.style.top = "-9999px";
    this.htmlBridge.style.width = "15px";
    this.htmlBridge.style.height = "15px";
    this.htmlBridge.style.zIndex = "9999";
    this.htmlBridge.innerHTML = html;
    document.body.appendChild(this.htmlBridge);
    this.flashBridge = document["global-zeroclipboard-flash-bridge"];
  };
  ZeroClipboard.prototype.resetBridge = function() {
    this.htmlBridge.style.left = "-9999px";
    this.htmlBridge.style.top = "-9999px";
    this.htmlBridge.removeAttribute("title");
    this.htmlBridge.removeAttribute("data-clipboard-text");
    _removeClass(currentElement, "zeroclipboard-is-active");
    currentElement = null;
  };
  ZeroClipboard.prototype.ready = function() {
    var ready = this.htmlBridge.getAttribute("data-clipboard-ready");
    return ready === "true" || ready === true;
  };
  ZeroClipboard.prototype.reposition = function() {
    if (!currentElement) return false;
    var pos = _getDOMObjectPosition(currentElement);
    this.htmlBridge.style.top = pos.top + "px";
    this.htmlBridge.style.left = pos.left + "px";
    this.htmlBridge.style.width = pos.width + "px";
    this.htmlBridge.style.height = pos.height + "px";
    this.htmlBridge.style.zIndex = pos.zIndex + 1;
    this.setSize(pos.width, pos.height);
  };
  ZeroClipboard.dispatch = function(eventName, args) {
    ZeroClipboard.prototype._singleton.receiveEvent(eventName, args);
  };
  ZeroClipboard.prototype.on = function(eventName, func) {
    var events = eventName.toString().split(/\s/g);
    for (var i = 0; i < events.length; i++) {
      eventName = events[i].toLowerCase().replace(/^on/, "");
      if (!this.handlers[eventName]) this.handlers[eventName] = func;
    }
    if (this.handlers.noflash && !ZeroClipboard.detectFlashSupport()) {
      this.receiveEvent("onNoFlash", null);
    }
  };
  ZeroClipboard.prototype.addEventListener = function(eventName, func) {
    this.on(eventName, func);
  };
  ZeroClipboard.prototype.receiveEvent = function(eventName, args) {
    eventName = eventName.toString().toLowerCase().replace(/^on/, "");
    var element = currentElement;
    switch (eventName) {
     case "load":
      if (args && parseFloat(args.flashVersion.replace(",", ".").replace(/[^0-9\.]/gi, "")) < 10) {
        this.receiveEvent("onWrongFlash", {
          flashVersion: args.flashVersion
        });
        return;
      }
      this.htmlBridge.setAttribute("data-clipboard-ready", true);
      break;
     case "mouseover":
      _addClass(element, "zeroclipboard-is-hover");
      break;
     case "mouseout":
      _removeClass(element, "zeroclipboard-is-hover");
      this.resetBridge();
      break;
     case "mousedown":
      _addClass(element, "zeroclipboard-is-active");
      break;
     case "mouseup":
      _removeClass(element, "zeroclipboard-is-active");
      break;
     case "complete":
      this.resetText();
      break;
    }
    if (this.handlers[eventName]) {
      var func = this.handlers[eventName];
      if (typeof func == "function") {
        func.call(element, this, args);
      } else if (typeof func == "string") {
        window[func].call(element, this, args);
      }
    }
  };
  ZeroClipboard.prototype.glue = function(elements) {
    if (typeof elements === "string") throw new TypeError("ZeroClipboard doesn't accept query strings.");
    if (!elements.length) elements = [ elements ];
    for (var i = 0; i < elements.length; i++) {
      if (_inArray(elements[i], gluedElements) == -1) {
        gluedElements.push(elements[i]);
        _addEventHandler(elements[i], "mouseover", _elementMouseOver);
      }
    }
  };
  ZeroClipboard.prototype.unglue = function(elements) {
    if (typeof elements === "string") throw new TypeError("ZeroClipboard doesn't accept query strings.");
    if (!elements.length) elements = [ elements ];
    for (var i = 0; i < elements.length; i++) {
      _removeEventHandler(elements[i], "mouseover", _elementMouseOver);
      var arrayIndex = _inArray(elements[i], gluedElements);
      if (arrayIndex != -1) gluedElements.splice(arrayIndex, 1);
    }
  };
  if (typeof module !== "undefined") {
    module.exports = ZeroClipboard;
  } else {
    window.ZeroClipboard = ZeroClipboard;
  }
})();