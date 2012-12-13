"use strict";

require("./env")

exports.domtests = {

  "Object has a title": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    clip.glue('#d_clip_button', '#d_clip_container')

    test.equal(clip.title, "Click me to copy to clipboard.")

    test.done();
  },

  "Object has no title": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    zeroClipboard.$("#d_clip_button").removeAttribute("title")

    clip.glue('#d_clip_button', '#d_clip_container')

    test.equal(clip.title, "")

    test.done();
  },

  "Object has data-clipboard-text": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    clip.glue('#d_clip_button', '#d_clip_container')

    test.equal(clip.clipText, "Copy me!")

    test.done();
  },

  "Object doesn't have data-clipboard-text": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    zeroClipboard.$("#d_clip_button").removeAttribute("data-clipboard-text")

    clip.glue('#d_clip_button', '#d_clip_container')

    test.equal(clip.clipText, "")

    test.done();
  },

  "Glue multiple elements": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    clip.glue('.my_clip_button')

    test.equal(clip.domElement.id, "d_clip_button")

    test.done();
  }
}