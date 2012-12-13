"use strict";

require("./env")

exports.client = {

  tearDown: function (callback) {
    navigator.mimeTypes["application/x-shockwave-flash"] = undefined;
    callback();
  },

  "Clip is created properly": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    // Test the client was created properly
    test.ok(clip.movieId);

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

  "Detecting no flash": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
        clip = new zeroClipboard.Client();

    // Test that we don't have flash
    test.equal(zeroClipboard.detectFlashSupport(), false);

    test.done();
  },

  "Detecting has flash mimetype": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
        clip = new zeroClipboard.Client();

    // We're faking it here.
    navigator.mimeTypes["application/x-shockwave-flash"] = true;

    // Test that we don't have flash
    test.equal(zeroClipboard.detectFlashSupport(), true);

    test.done();
  },

  "Clip sets text properly": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    // Test the client has no text
    test.equal(clip.clipText, "");

    clip.setText("Tambourine");

    test.equal(clip.clipText, "Tambourine");

    test.done();
  },

  "Clip sets title properly": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    // Test the client has no text
    test.equal(clip.title, "");

    clip.setTitle("Click Me");

    test.equal(clip.title, "Click Me");

    test.done();
  }

};