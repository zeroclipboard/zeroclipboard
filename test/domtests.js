"use strict";

require("./env")

exports.domtests = {

  "Object has a title": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
      clip = new zeroClipboard.Client("#d_clip_button"),
      element = zeroClipboard.$("#d_clip_button")[0];

    clip.setCurrent(element);

    test.equal(clip.htmlBridge.getAttribute("title"), "Click me to copy to clipboard.")

    clip.resetBridge();

    test.done();
  },

  "Object has no title": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
      clip = new zeroClipboard.Client("#d_clip_button_no_title"),
      element = zeroClipboard.$("#d_clip_button_no_title")[0];

    clip.setCurrent(element);

    test.ok(!clip.htmlBridge.getAttribute("title"));

    test.done();
  },

  "Object has data-clipboard-text": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
      clip = new zeroClipboard.Client('#d_clip_button'),
      element = zeroClipboard.$("#d_clip_button")[0];

    clip.setCurrent(element);

    test.equal(clip.htmlBridge.getAttribute("data-clipboard-text"), "Copy me!")

    clip.resetBridge();

    test.done();
  },

  "Object doesn't have data-clipboard-text": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
      clip = new zeroClipboard.Client("#d_clip_button_no_text"),
      element = zeroClipboard.$("#d_clip_button_no_text")[0];

    clip.setCurrent(element);

    test.ok(!clip.htmlBridge.getAttribute("data-clipboard-text"));

    test.done();
  }

}