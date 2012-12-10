"use strict";

var zeroClipboard = require("./ZeroClipboard")

exports.client = {

  "Clip is created properly": function (test) {
    var clip = new zeroClipboard.Client()

    // Test the client was created properly
    test.equal(clip.id, 1);

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

  "Clip sets text properly": function (test) {
    var clip = new zeroClipboard.Client()

    // Test the client has no text
    test.equal(clip.clipText, "");

    clip.setText("Tambourine");

    test.equal(clip.clipText, "Tambourine");

    test.done();
  },

  "Clip sets title properly": function (test) {
    var clip = new zeroClipboard.Client()

    // Test the client has no text
    test.equal(clip.title, "");

    clip.setTitle("Click Me");

    test.equal(clip.title, "Click Me");

    test.done();
  }
};
