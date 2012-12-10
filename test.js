"use strict";

var zeroClipboard = require("./ZeroClipboard")

exports.client = {
  "simple": function (test) {
    var clip = new zeroClipboard.Client()

    // Test the client was created properly
    test.equal(clip.id, 1);

    test.done();
  },
  "movie path": function (test) {

    // Test the client has default path
    test.equal(zeroClipboard.moviePath, "ZeroClipboard.swf");

    // change the path
    zeroClipboard.setMoviePath("new/movie/path.swf");
    test.equal(zeroClipboard.moviePath, "new/movie/path.swf");

    test.done();
  }
};
