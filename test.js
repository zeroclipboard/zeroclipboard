"use strict";

var zeroClipboard = require("./ZeroClipboard")

exports.client = {
  "simple": function (test) {
    var clip = new zeroClipboard.Client()

    // Test the client was created properly
    test.equal(clip.id, 1);

    test.done();
  }
};
