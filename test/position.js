"use strict";

require("./env")

var zeroClipboard, clip;
exports.position = {

  setUp: function (callback) {
    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard.Client();
    callback();
  },

  tearDown: function (callback) {
    zeroClipboard.destroy();
    callback();
  },

  "when object borderWidth isNaN don't fail": function (test) {

    clip.glue($("#d_clip_button"));

    clip.setCurrent($("#d_clip_button")[0]);

    // grabbed the right id
    test.equal(clip.htmlBridge.style.top, "0px");
    test.equal(clip.htmlBridge.style.left, "0px");
    test.equal(clip.htmlBridge.style.width, "0px");
    test.equal(clip.htmlBridge.style.height, "0px");

    test.done();
  }
};