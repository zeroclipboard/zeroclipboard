"use strict";

require("./env")

exports.selector = {

  "$ backwards compatibility test": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("d_clip_button")

    // element isn't null
    test.equal(elm.id, "d_clip_button")

    test.done();
  },

  "$ returns an element": function (test) {

    var zeroClipboard = require("../ZeroClipboard")

    // grabbed the right id
    test.equal(zeroClipboard.$("#d_clip_button").id, "d_clip_button")

    // grabbed 3 buttons
    test.equal(zeroClipboard.$(".my_clip_button").length, 3)

    // found the body
    test.ok(zeroClipboard.$("body"))

    // didn't find anything
    test.equal(zeroClipboard.$("bodyd"), null)

    test.done();
  },

  "$.addClass works as expected": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("#d_clip_button")

    // element isn't null
    test.ok(elm)

    test.equal(typeof elm.addClass, "function")
    elm.addClass("test-class")
    test.notEqual(elm.className.indexOf("test-class"), -1)

    test.done();
  },

  "$.removeClass works as expected": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("#d_clip_button")

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
    var elm = zeroClipboard.$("#d_clip_button")

    // element isn't null
    test.ok(elm)

    test.equal(typeof elm.hasClass, "function")

    elm.addClass("test-class")
    test.notEqual(elm.className.indexOf("test-class"), -1)
    test.ok(elm.hasClass("test-class"))

    test.done();
  }

};