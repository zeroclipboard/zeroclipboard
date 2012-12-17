"use strict";

require("./env")

exports.zevents = {

  "Registering Events": function (test) {
    var zeroClipboard = require("../ZeroClipboard"),
        clip = new zeroClipboard.Client();

    clip.on("load",function(){});
    clip.on("onNoFlash",function(){});
    clip.on("onPhone",function(){});

    test.ok(clip.handlers.load);
    test.ok(clip.handlers.noflash);
    test.ok(clip.handlers.phone);

    test.done();
  },

  "Registering Events the old way": function (test) {
    var zeroClipboard = require("../ZeroClipboard"),
        clip = new zeroClipboard.Client();

    clip.addEventListener("load",function(){});

    test.ok(clip.handlers.load);

    test.done();
  },

  "Registering two events works": function (test) {
    var zeroClipboard = require("../ZeroClipboard"),
        clip = new zeroClipboard.Client();

    clip.on("load oncomplete",function(){});

    test.ok(clip.handlers.load);
    test.ok(clip.handlers.complete);

    test.done();
  },

  "Test onNoFlash Event": function (test) {
    navigator.mimeTypes["application/x-shockwave-flash"] = undefined;

    var zeroClipboard = require("../ZeroClipboard"),
        clip = new zeroClipboard.Client();
    var id = clip.id;

    clip.addEventListener( 'onNoFlash', function(client, text) {
      test.equal(client.id, id);
      navigator.mimeTypes["application/x-shockwave-flash"] = true;
      test.done();
    } );

    test.equal(zeroClipboard.detectFlashSupport(), false);
  },

  "Test onWrongFlash Event": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
        clip = new zeroClipboard.Client();

    clip.glue('#d_clip_button')

    var id = clip.id;

    clip.addEventListener( 'onWrongFlash', function(client, text) {
      test.equal(client.id, id);
      test.done();
    } );

    // fake load event
    zeroClipboard.dispatch("load", { flashVersion: "MAC 9,0,0" });
  }

}