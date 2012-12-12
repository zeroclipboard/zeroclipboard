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