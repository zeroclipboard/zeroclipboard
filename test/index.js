"use strict";

require("./env")

var zeroClipboard = require("../ZeroClipboard")

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

  "DOM Lookup is working": function (test) {

    test.notEqual(zeroClipboard.$("d_clip_button"), null)

    test.done();
  },

  "Object has a title": function (test) {
    var clip = new zeroClipboard.Client()

    clip.glue('d_clip_button', 'd_clip_container')

    test.equal(clip.title, "This is title")

    test.done();
  },

  "Object has no title": function (test) {
    var clip = new zeroClipboard.Client()

    zeroClipboard.$("d_clip_button").removeAttribute("title")

    clip.glue('d_clip_button', 'd_clip_container')

    test.equal(clip.title, "")

    test.done();
  },

  "Object has data-clipboard-text": function (test) {
    var clip = new zeroClipboard.Client()

    clip.glue('d_clip_button', 'd_clip_container')

    test.equal(clip.clipText, "This is text")

    test.done();
  },

  "Object doesn't have data-clipboard-text": function (test) {
    var clip = new zeroClipboard.Client()

    zeroClipboard.$("d_clip_button").removeAttribute("data-clipboard-text")

    clip.glue('d_clip_button', 'd_clip_container')

    test.equal(clip.clipText, "")

    test.done();
  }
}