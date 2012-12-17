"use strict";

require("./env")
var zeroClipboard, clip;
exports.client = {

  setUp: function (callback) {
    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard.Client();
    callback();
  },

  tearDown: function (callback) {
    clip = null; // have better cleanup
    zeroClipboard = null;
    $("#global-zeroclipboard-html-bridge").remove();
    callback();
  },

  "Client without selector doesn't have element": function (test) {

    // Test the client is null
    test.ok(clip.htmlBridge);
    test.ok(clip.handlers);

    test.done();
  },

  "Clip is created properly": function (test) {

    clip.glue("#d_clip_button");

    // Test the client was created properly
    test.ok(clip.htmlBridge);
    test.ok(clip.handlers);

    test.done();
  },

  "Detecting no flash": function (test) {
    navigator.mimeTypes["application/x-shockwave-flash"] = undefined;

    // Test that we don't have flash
    test.equal(zeroClipboard.detectFlashSupport(), false);

    navigator.mimeTypes["application/x-shockwave-flash"] = true;
    test.done();
  },

  "Detecting has flash mimetype": function (test) {

    // Test that we don't have flash
    test.equal(zeroClipboard.detectFlashSupport(), true);

    test.done();
  },

  "Glue element after new client": function (test) {

    clip.glue("#d_clip_button")

    // Test the client was created properly
    test.ok(clip.htmlBridge);
    test.ok(clip.handlers);

    test.done();
  },

  "Changing movie path works": function (test) {

    // Test the client has default path
    test.equal(zeroClipboard.moviePath, "ZeroClipboard.swf");

    // change the path
    zeroClipboard.setMoviePath("new/movie/path.swf");
    test.equal(zeroClipboard.moviePath, "new/movie/path.swf");

    test.done();
  },

  "Clip sets title properly": function (test) {

    clip.glue("#d_clip_button");

    clip.setTitle("Click Me");

    test.equal(clip.htmlBridge.getAttribute("title"), "Click Me");

    test.done();
  }

};