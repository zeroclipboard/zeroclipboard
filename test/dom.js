"use strict";

require("./env")
var zeroClipboard, clip;
var sandbox = require('nodeunit').utils.sandbox;
var _dom = sandbox("./src/javascript/ZeroClipboard/dom.js", {
  window: window,
  document: document,
  navigator: navigator
});

exports.domtests = {

  setUp: function (callback) {
    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard.Client();
    callback();
  },

  tearDown: function (callback) {
    zeroClipboard.destroy();
    callback();
  },

  "_removeClass removes classes from element": function (test) {
    var div = $("<div>").addClass("class-1 class-2 class_3")[0];

    _dom._removeClass(div, "class-1");
    test.equal(div.className, "class-2 class_3");

    _dom._removeClass(div, "classd");
    test.equal(div.className, "class-2 class_3");

    _dom._removeClass(div, "class-2");
    test.equal(div.className, "class_3");

    _dom._removeClass(div, "class_3");
    test.equal(div.className, "");

    _dom._removeClass(div, "class-3");
    test.equal(div.className, "");

    test.done();
  },

  "_removeClass doesn't remove partial class names": function (test) {
    var div = $("<div>").addClass("class-1 class-2 class_3")[0];

    _dom._removeClass(div, "ass");
    test.equal(div.className, "class-1 class-2 class_3");

    _dom._removeClass(div, "-");
    test.equal(div.className, "class-1 class-2 class_3");

    _dom._removeClass(div, " ");
    test.equal(div.className, "class-1 class-2 class_3");

    test.done();
  },

  "_addClass adds a class name": function (test) {
    var div = $("<div>")[0];

    _dom._addClass(div, "class-1");
    test.equal(div.className, "class-1");

    _dom._addClass(div, "class-2");
    test.equal(div.className, "class-1 class-2");

    _dom._addClass(div, "class-3");
    test.equal(div.className, "class-1 class-2 class-3");

    _dom._addClass(div, "class-3");
    test.equal(div.className, "class-1 class-2 class-3");

    test.done();
  },

  "elements with addClass already use the function": function (test) {
    var div = $("<div>");

    _dom._addClass(div, "class-1");
    test.equal(div[0].className, "class-1");

    test.done();
  },

  "elements with removeClass already use the function": function (test) {
    var div = $("<div>").addClass("class-1");

    test.equal(div[0].className, "class-1");

    _dom._removeClass(div, "class-1");
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
  }

}