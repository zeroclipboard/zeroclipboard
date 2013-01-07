"use strict";

require("./fixtures/env")
var zeroClipboard, clip;

exports.core = {
  setUp: function (callback) {
    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard.Client();
    callback();
  },

  tearDown: function (callback) {
    zeroClipboard.destroy();
    callback();
  },

  "Changing movie path works": function (test) {

    // Test the client has default path
    test.equal(zeroClipboard._moviePath, "ZeroClipboard.swf");

    // change the path
    zeroClipboard.setMoviePath("new/movie/path.swf");
    test.equal(zeroClipboard._moviePath, "new/movie/path.swf");

    test.done();
  },

  "Set trusted domain": function (test) {

    // Test the _trustedDomain is undefined
    test.equal(zeroClipboard._trustedDomain, undefined);

    // change the path
    zeroClipboard.setTrustedDomain("google.com");
    test.equal(zeroClipboard._trustedDomain, "google.com");

    test.done();
  },

  "destroy clears up the client": function (test) {

    zeroClipboard.destroy();

    test.equal($("#global-zeroclipboard-html-bridge").length, 0);
    test.ok(!zeroClipboard.Client.prototype._singleton);
    test.ok(!zeroClipboard._trustedDomain);
    test.equal(zeroClipboard._moviePath, 'ZeroClipboard.swf');

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

}