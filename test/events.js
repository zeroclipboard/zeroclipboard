"use strict";

require("./env")

var zeroClipboard, clip;
exports.zevents = {

  setUp: function (callback) {
    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard.Client();
    callback();
  },

  tearDown: function (callback) {
    clip = null; // have better cleanup
    zeroClipboard = null;
    $("#global-zeroclipboard-html-bridge").remove();
    callback();
  },

  "Registering Events": function (test) {

    clip.on("load",function(){});
    clip.on("onNoFlash",function(){});
    clip.on("onPhone",function(){});

    test.ok(clip.handlers.load);
    test.ok(clip.handlers.noflash);
    test.ok(clip.handlers.phone);

    test.done();
  },

  "Registering Events the old way": function (test) {

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

    var id = clip.id;

    clip.addEventListener( 'onNoFlash', function(client, text) {
      test.equal(client.id, id);
      navigator.mimeTypes["application/x-shockwave-flash"] = true;
      test.done();
    } );
  },

  "Test onWrongFlash Event": function (test) {

    clip.glue('#d_clip_button')

    var id = clip.id;

    clip.addEventListener( 'onWrongFlash', function(client, text) {
      test.equal(client.id, id);
      test.done();
    } );

    // fake load event
    zeroClipboard.dispatch("load", { flashVersion: "MAC 9,0,0" });
  },

  "Test mouseover and mouseout event": function (test) {

    clip.glue('#d_clip_button');

    clip.setCurrent($("#d_clip_button")[0]);

    zeroClipboard.dispatch("mouseover", { flashVersion: "MAC 11,0,0" });

    test.ok($("#d_clip_button").hasClass("zeroclipboard-is-hover"));

    zeroClipboard.dispatch("mouseout", { flashVersion: "MAC 11,0,0" });

    test.ok(!$("#d_clip_button").hasClass("zeroclipboard-is-hover"));

    test.equal(clip.htmlBridge.style.left, "-9999px");

    test.done();

  },

  "Test mousedown and mouseup event": function (test) {

    clip.glue('#d_clip_button');

    clip.setCurrent($("#d_clip_button")[0]);

    zeroClipboard.dispatch("mousedown", { flashVersion: "MAC 11,0,0" });

    test.ok($("#d_clip_button").hasClass("zeroclipboard-is-active"));

    zeroClipboard.dispatch("mouseout", { flashVersion: "MAC 11,0,0" });

    test.ok(!$("#d_clip_button").hasClass("zeroclipboard-is-active"));

    test.done();

  },

}