"use strict";

require("./fixtures/env");
var zeroClipboard, clip;

exports.dom = {
  setUp: function (callback) {
    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard();
    callback();
  },

  tearDown: function (callback) {
    zeroClipboard.destroy();
    callback();
  },

  "Bridge is ready": function (test) {

    zeroClipboard.dispatch("load", { flashVersion: "MAC 11,0,0" });

    test.ok(clip.ready());

    test.done();
  },

};