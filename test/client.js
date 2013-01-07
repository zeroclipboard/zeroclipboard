"use strict";

require("./fixtures/env")
var zeroClipboard, clip;
exports.client = {

  setUp: function (callback) {
    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard();
    callback();
  },

  tearDown: function (callback) {
    zeroClipboard.destroy();
    callback();
  },

  "Client without selector doesn't have element": function (test) {

    // Test the client is null
    test.ok(clip.htmlBridge);
    test.ok(clip.handlers);

    test.done();
  },

  "Clip is created properly": function (test) {

    // Test the client was created properly
    test.ok(clip.htmlBridge);
    test.ok(clip.handlers);

    test.done();
  },

  "Clip sets title properly": function (test) {

    clip.glue($("#d_clip_button"));

    clip.setTitle("Click Me");

    test.equal(clip.htmlBridge.getAttribute("title"), "Click Me");

    test.done();
  },

  "setText overrides the data-clipboard-text attribute": function (test) {
    clip.glue($("#d_clip_button"));

    clip.setText("This is the new text");

    clip.setCurrent($("#d_clip_button")[0]);

    test.equal(clip.options.text, "This is the new text");

    test.done();
  },

  "Object has a title": function (test) {

    clip.glue($("#d_clip_button"));

    var element = $("#d_clip_button")[0];

    clip.setCurrent(element);

    test.equal(clip.htmlBridge.getAttribute("title"), "Click me to copy to clipboard.")

    clip.resetBridge();

    test.done();
  },

  "Object has no title": function (test) {

    clip.glue($("#d_clip_button_no_title"));

    var element = $("#d_clip_button_no_title")[0];

    clip.setCurrent(element);

    test.ok(!clip.htmlBridge.getAttribute("title"));

    test.done();
  },

  "Object has data-clipboard-text": function (test) {

    clip.glue($("#d_clip_button"));
    var element = $("#d_clip_button")[0];

    clip.setCurrent(element);

    test.equal(clip.options.text, "Copy me!")

    clip.resetBridge();

    test.done();
  },

  "Object doesn't have data-clipboard-text": function (test) {

    clip.glue($("#d_clip_button_no_text"));
    var element = $("#d_clip_button_no_text")[0];

    clip.setCurrent(element);

    test.ok(!clip.htmlBridge.getAttribute("data-clipboard-text"));

    test.done();
  },

  "Trying a new client is same client": function (test) {

    test.ok(clip.htmlBridge);

    test.equal($(".global-zeroclipboard-container").length, 1);

    var clip2 = new zeroClipboard();

    test.equal($(".global-zeroclipboard-container").length, 1);

    test.equal(clip2, clip);

    test.done();
  }

};