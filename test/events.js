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
  }

}