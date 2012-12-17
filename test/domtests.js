"use strict";

require("./env")
var zeroClipboard, clip;
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

  "Object has a title": function (test) {

    clip.glue("#d_clip_button");

    var element = $("#d_clip_button")[0];

    clip.setCurrent(element);

    test.equal(clip.htmlBridge.getAttribute("title"), "Click me to copy to clipboard.")

    clip.resetBridge();

    test.done();
  },

  "Object has no title": function (test) {

    clip.glue("#d_clip_button_no_title");

    var element = $("#d_clip_button_no_title")[0];

    clip.setCurrent(element);

    test.ok(!clip.htmlBridge.getAttribute("title"));

    test.done();
  },

  "Object has data-clipboard-text": function (test) {

    clip.glue('#d_clip_button');
    var element = $("#d_clip_button")[0];

    clip.setCurrent(element);

    test.equal(clip.htmlBridge.getAttribute("data-clipboard-text"), "Copy me!")

    clip.resetBridge();

    test.done();
  },

  "Object doesn't have data-clipboard-text": function (test) {

    clip.glue("#d_clip_button_no_text");
    var element = $("#d_clip_button_no_text")[0];

    clip.setCurrent(element);

    test.ok(!clip.htmlBridge.getAttribute("data-clipboard-text"));

    test.done();
  },

  "Bridge is ready": function (test) {

    zeroClipboard.dispatch("load", { flashVersion: "MAC 11,0,0" });

    test.ok(clip.ready());

    test.done();
  },

  "Trying a new client is same client": function (test) {

    test.ok(clip.htmlBridge);

    test.equal($(".global-zeroclipboard-container").length, 1);

    var clip2 = new zeroClipboard.Client();

    test.equal($(".global-zeroclipboard-container").length, 1);

    test.equal(clip2, clip);

    test.done();
  }

}