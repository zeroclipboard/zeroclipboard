"use strict";

require("./env")
var sandbox = require('nodeunit').utils.sandbox;
var _p = sandbox("./src/javascript/ZeroClipboard/private.js", {
  window: window,
  document: document,
  navigator: navigator
});

exports.private = {
  "_getStyle returns computed styles": function (test) {

    test.equal(_p._getStyle($("a.no_cursor_style")[0], "cursor"), "pointer");
    test.notEqual(_p._getStyle($("a.no_pointer_anchor")[0], "cursor"), "pointer");

    test.equal(_p._getStyle($(".zindex-auto")[0], "zIndex"), 0);
    test.equal(_p._getStyle($("#d_clip_button")[0], "borderLeftWidth"), 0);
    test.equal(_p._getStyle($(".big-border")[0], "borderLeftWidth"), 0);

    test.done();
  }
};