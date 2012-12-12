"use strict";

require("./env")

exports.selector = {

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

  "$ returns an element": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("d_clip_button")

    // element isn't null
    test.ok(elm)

    test.done();
  },

  "$.hide works as expected": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("d_clip_button")

    // element isn't null
    test.ok(elm)

    test.equal(typeof elm.hide, "function")
    elm.hide()
    test.equal(elm.style.display, "none")

    test.done();
  },

  "$.show works as expected": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("d_clip_button")

    // element isn't null
    test.ok(elm)

    test.equal(typeof elm.show, "function")
    elm.show()
    test.equal(elm.style.display, "")

    test.done();
  },

  "$.addClass works as expected": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("d_clip_button")

    // element isn't null
    test.ok(elm)

    test.equal(typeof elm.addClass, "function")
    elm.addClass("test-class")
    test.notEqual(elm.className.indexOf("test-class"), -1)

    test.done();
  },

  "$.removeClass works as expected": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("d_clip_button")

    // element isn't null
    test.ok(elm)

    test.equal(typeof elm.removeClass, "function")

    elm.addClass("test-class")
    test.notEqual(elm.className.indexOf("test-class"), -1)
    elm.removeClass("test-class")
    test.equal(elm.className.indexOf("test-class"), -1)

    test.equal(typeof elm.hasClass, "function")

    test.done();
  },

  "$.hasClass works as expected": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("d_clip_button")

    // element isn't null
    test.ok(elm)

    test.equal(typeof elm.hasClass, "function")

    elm.addClass("test-class")
    test.notEqual(elm.className.indexOf("test-class"), -1)
    test.ok(elm.hasClass("test-class"))

    test.done();
  }

};