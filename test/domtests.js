"use strict";

require("./env")

exports.domtests = {


  setUp: function (callback) {
    var p = document.createElement("p");
    p.id = "d_clip_container";

    var node = document.createElement("span");
    node.id = "d_clip_button";

    node.setAttribute("data-clipboard-text", "This is text");
    node.setAttribute("title", "This is title");
    p.appendChild(node);

    document.body.appendChild(p);

    callback();
  },

  tearDown: function (callback) {
      document.body.innerHTML = "";

      // clean up
      callback();
  },

  "Object has a title": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    clip.glue('d_clip_button', 'd_clip_container')

    test.equal(clip.title, "This is title")

    test.done();
  },

  "Object has no title": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    zeroClipboard.$("d_clip_button").removeAttribute("title")

    clip.glue('d_clip_button', 'd_clip_container')

    test.equal(clip.title, "")

    test.done();
  },

  "Object has data-clipboard-text": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    clip.glue('d_clip_button', 'd_clip_container')

    test.equal(clip.clipText, "This is text")

    test.done();
  },

  "Object doesn't have data-clipboard-text": function (test) {

    var zeroClipboard = require("../ZeroClipboard"),
    clip = new zeroClipboard.Client();

    zeroClipboard.$("d_clip_button").removeAttribute("data-clipboard-text")

    clip.glue('d_clip_button', 'd_clip_container')

    test.equal(clip.clipText, "")

    test.done();
  }
}