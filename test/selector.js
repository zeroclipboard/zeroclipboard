"use strict";

require("./env")

exports.selector = {

  "$ returns an element": function (test) {

    var zeroClipboard = require("../ZeroClipboard")

    // grabbed the right id
    test.equal(zeroClipboard.$("#d_clip_button")[0].id, "d_clip_button")

    // grabbed 3 buttons
    test.equal(zeroClipboard.$(".my_clip_button").length, 5)

    // found the body
    test.ok(zeroClipboard.$("body").length)

    // didn't find anything
    test.ok(!zeroClipboard.$("bodyd").length)

    test.done();
  },

  "$.addClass works as expected": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("#d_clip_button")[0]

    // element isn't null
    test.ok(elm)

    test.equal(typeof elm.addClass, "function")
    elm.addClass("test-class")
    test.notEqual(elm.className.indexOf("test-class"), -1)

    test.done();
  },

  "$.removeClass works as expected": function (test) {

    var zeroClipboard = require("../ZeroClipboard")
    var elm = zeroClipboard.$("#d_clip_button")[0]

    // element isn't null
    test.ok(elm)

    test.equal(typeof elm.removeClass, "function")

    elm.addClass("test-class")
    test.notEqual(elm.className.indexOf("test-class"), -1)
    elm.removeClass("test-class")
    test.equal(elm.className.indexOf("test-class"), -1)

    test.done();
  }
};