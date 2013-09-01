"use strict";

require("./fixtures/env");
var zeroClipboard, clip;

exports.core = {

  "Changing movie path works": function (test) {

    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard();

    // Test the client has default path
    test.equal(clip.options.moviePath, "ZeroClipboard.swf");

    // change the path
    clip.options.moviePath = "new/movie/path.swf";

    test.equal(clip.options.moviePath, "new/movie/path.swf");

    test.done();

    zeroClipboard.destroy();
  },

  "Set trusted origins": function (test) {

    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard();

    // Test that trustedOrigins is undefined
    test.equal(clip.options.trustedOrigins, undefined);

    // change the path
    clip.options.trustedOrigins = "google.com";

    test.equal(clip.options.trustedOrigins, "google.com");

    test.done();
    zeroClipboard.destroy();
  },

  "destroy clears up the client": function (test) {

    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard();

    zeroClipboard.destroy();

    test.equal($("#global-zeroclipboard-html-bridge").length, 0);
    test.ok(!zeroClipboard.prototype._singleton);

    test.done();
  },

  "Detecting no flash": function (test) {
    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard();

    navigator.mimeTypes["application/x-shockwave-flash"] = undefined;

    // Test that we don't have flash
    test.equal(zeroClipboard.detectFlashSupport(), false);

    navigator.mimeTypes["application/x-shockwave-flash"] = true;
    test.done();
    zeroClipboard.destroy();
  },

  "Detecting has flash mimetype": function (test) {

    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard();

    // Test that we don't have flash
    test.equal(zeroClipboard.detectFlashSupport(), true);

    test.done();
    zeroClipboard.destroy();
  },

  "Setting default options": function (test) {
    zeroClipboard = require("../ZeroClipboard");

    zeroClipboard.setDefaults({
      moviePath:         "the/path",
      allowScriptAccess: "always"
    });

    clip = new zeroClipboard();

    test.equal(clip.options.moviePath, "the/path");
    test.equal(clip.options.allowScriptAccess, "always");

    test.done();
    zeroClipboard.destroy();
  },

};
