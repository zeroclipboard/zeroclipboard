"use strict";

require("./fixtures/env")
var zeroClipboard, clip;

exports.core = {

  "Changing movie path works": function (test) {

    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard.Client();

    // Test the client has default path
    test.equal(clip.options.moviePath, "ZeroClipboard.swf");

    // change the path
    clip.options.moviePath = "new/movie/path.swf";

    test.equal(clip.options.moviePath, "new/movie/path.swf");

    test.done();

    zeroClipboard.destroy();
  },

  "Set trusted domain": function (test) {

    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard.Client();

    // Test the _trustedDomain is undefined
    test.equal(clip.options.trustedDomain, undefined);

    // change the path
    clip.options.trustedDomain = "google.com";

    test.equal(clip.options.trustedDomain, "google.com");

    test.done();
    zeroClipboard.destroy();
  },

  "destroy clears up the client": function (test) {

    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard.Client();

    zeroClipboard.destroy();

    test.equal($("#global-zeroclipboard-html-bridge").length, 0);
    test.ok(!zeroClipboard._client);

    test.done();
  },

  "Detecting no flash": function (test) {
    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard.Client();

    navigator.mimeTypes["application/x-shockwave-flash"] = undefined;

    // Test that we don't have flash
    test.equal(zeroClipboard.detectFlashSupport(), false);

    navigator.mimeTypes["application/x-shockwave-flash"] = true;
    test.done();
    zeroClipboard.destroy();
  },

  "Detecting has flash mimetype": function (test) {

    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard.Client();

    // Test that we don't have flash
    test.equal(zeroClipboard.detectFlashSupport(), true);

    test.done();
    zeroClipboard.destroy();
  },

  "Setting default options": function (test) {
    zeroClipboard = require("../ZeroClipboard");

    zeroClipboard.setDefaults({
      moviePath: "the/path"
    });

    clip = new zeroClipboard.Client();

    test.equal(clip.options.moviePath, "the/path");

    test.done();
    zeroClipboard.destroy();
  },

}