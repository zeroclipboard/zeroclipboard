"use strict";

require("./fixtures/env")
var sandbox = require('nodeunit').utils.sandbox;

var ZeroClipboard, clip, _utils;
exports.utils = {

  setUp: function (callback) {
    ZeroClipboard = require("../ZeroClipboard");
    _utils = sandbox("./src/javascript/ZeroClipboard/utils.js", {
      window: window,
      document: document,
      navigator: navigator,
      ZeroClipboard: ZeroClipboard
    });
    clip = new ZeroClipboard();
    callback();
  },

  tearDown: function (callback) {
    ZeroClipboard.destroy();
    callback();
  },

  "_getStyle returns computed styles": function (test) {

    test.equal(_utils._getStyle($("a.no_cursor_style")[0], "cursor"), "pointer");
    test.notEqual(_utils._getStyle($("a.no_pointer_anchor")[0], "cursor"), "pointer");

    test.equal(_utils._getStyle($(".zindex-auto")[0], "zIndex"), 0);
    test.equal(_utils._getStyle($("#d_clip_button")[0], "borderLeftWidth"), 0);
    test.equal(_utils._getStyle($(".big-border")[0], "borderLeftWidth"), 0);

    test.done();
  },
  "_removeClass removes classes from element": function (test) {
    var div = $("<div>").addClass("class-1 class-2 class_3")[0];

    _utils._removeClass(div, "class-1");
    test.equal(div.className, "class-2 class_3");

    _utils._removeClass(div, "classd");
    test.equal(div.className, "class-2 class_3");

    _utils._removeClass(div, "class-2");
    test.equal(div.className, "class_3");

    _utils._removeClass(div, "class_3");
    test.equal(div.className, "");

    _utils._removeClass(div, "class-3");
    test.equal(div.className, "");

    test.done();
  },

  "_removeClass doesn't remove partial class names": function (test) {
    var div = $("<div>").addClass("class-1 class-2 class_3")[0];

    _utils._removeClass(div, "ass");
    test.equal(div.className, "class-1 class-2 class_3");

    _utils._removeClass(div, "-");
    test.equal(div.className, "class-1 class-2 class_3");

    _utils._removeClass(div, " ");
    test.equal(div.className, "class-1 class-2 class_3");

    test.done();
  },

  "_addClass adds a class name": function (test) {
    var div = $("<div>")[0];

    _utils._addClass(div, "class-1");
    test.equal(div.className, "class-1");

    _utils._addClass(div, "class-2");
    test.equal(div.className, "class-1 class-2");

    _utils._addClass(div, "class-3");
    test.equal(div.className, "class-1 class-2 class-3");

    _utils._addClass(div, "class-3");
    test.equal(div.className, "class-1 class-2 class-3");

    test.done();
  },

  "elements with addClass already use the function": function (test) {
    var div = $("<div>");

    _utils._addClass(div, "class-1");
    test.equal(div[0].className, "class-1");

    test.done();
  },

  "elements with removeClass already use the function": function (test) {
    var div = $("<div>").addClass("class-1");

    test.equal(div[0].className, "class-1");

    _utils._removeClass(div, "class-1");
    test.equal(div[0].className, "");

    test.done();
  },

  "when object borderWidth isNaN don't fail": function (test) {

    clip.glue($("#d_clip_button"));

    clip.setCurrent($("#d_clip_button")[0]);

    test.equal(clip.htmlBridge.style.top, "0px");
    test.equal(clip.htmlBridge.style.left, "0px");
    test.equal(clip.htmlBridge.style.width, "0px");
    test.equal(clip.htmlBridge.style.height, "0px");

    test.done();
  },

  "_vars builds flashvars": function (test) {

    test.equal(_utils._vars(clip.options), "");

    clip.options.trustedDomains = ["*"];

    test.equal(_utils._vars(clip.options), "trustedDomain=*");

    test.done();
  },

  "_noCache adds cache properly": function (test) {

    test.equal(_utils._noCache("path.com/z.swf").indexOf("?nocache="), 0);

    test.equal(_utils._noCache("path.com/z.swf?q=jon").indexOf("&nocache="), 0);

    test.done();
  },

  "_inArray finds elements in array": function (test) {

    var fruits = ["apple", "banana", "orange", "cherry", "strawberry"];

    test.equal(_utils._inArray("kiwi", fruits), -1);
    test.equal(_utils._inArray("banana", fruits), 1);
    test.equal(_utils._inArray("strawberry", fruits), 4);

    test.done();
  },

};