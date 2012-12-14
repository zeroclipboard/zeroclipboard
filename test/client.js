"use strict";

require("./env")

exports.client = {

  "Client without selector doesn't have element": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    // Test the client is null
    test.equal(clip.element, null);
    test.ok(clip.htmlBridge);
    test.ok(clip.handlers);

    test.done();
  },

  "Clip is created properly": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client("#d_clip_button");

    // Test the client was created properly
    test.ok(clip.element);
    test.ok(clip.htmlBridge);
    test.ok(clip.handlers);

    test.done();
  },

  "Changing movie path works": function (test) {

    var zeroClipboard = require("../ZeroClipboard");

    // Test the client has default path
    test.equal(zeroClipboard.moviePath, "ZeroClipboard.swf");

    // change the path
    zeroClipboard.setMoviePath("new/movie/path.swf");
    test.equal(zeroClipboard.moviePath, "new/movie/path.swf");

    test.done();
  },

  "Clip sets title properly": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client("#d_clip_button");

    clip.setTitle("Click Me");

    test.equal(clip.htmlBridge.getAttribute("title"), "Click Me");

    test.done();
  }

};