"use strict";

require("./env")

exports.zevents = {

  "Test onNoFlash Event": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
        clip = new zeroClipboard.Client();
    var id = clip.id;

    clip.addEventListener( 'onNoFlash', function(client, text) {
      test.equal(client.id, id);
      test.done();
    } );

    test.equal(zeroClipboard.detectFlashSupport(), false);
  },

  "Test onWrongFlash Event": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
        clip = new zeroClipboard.Client();

    clip.glue('#d_clip_button', '#d_clip_container')

    var id = clip.id;

    clip.addEventListener( 'onWrongFlash', function(client, text) {
      test.equal(client.id, id);
      test.done();
    } );

    // fake load event
    zeroClipboard.dispatch(id, "load", { flashVersion: "MAC 9.0.0" });
  }

}