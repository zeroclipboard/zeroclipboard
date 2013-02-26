"use strict";

require("./fixtures/env")
var sandbox = require('nodeunit').utils.sandbox;

var ZeroClipboard, clip, _utils;
exports.utils = {

  setUp: function (callback) {
    ZeroClipboard = require("../ZeroClipboard");
    _utils = sandbox("./src/javascript/ZeroClipboard/utils.js", {
      window: window,
      document: document,
      navigator: navigator,
      ZeroClipboard: ZeroClipboard
    });
    clip = new ZeroClipboard();
    callback();
  },

  tearDown: function (callback) {
    ZeroClipboard.destroy();
    callback();
  },
  
  "_camelizeCssPropName converts CSS property names": function (test) {
    test.expect(3);
    test.strictEqual(_utils._camelizeCssPropName("z-index"), "zIndex");
    test.strictEqual(_utils._camelizeCssPropName("border-left-width"), "borderLeftWidth");
    test.strictEqual(_utils._camelizeCssPropName("cursor"), "cursor");
    test.done();
  },

  "_getStyle returns computed styles": function (test) {
    test.expect(10);
    
    test.equal(_utils._getStyle($("a.no_cursor_style")[0], "cursor"), "pointer");
    test.notEqual(_utils._getStyle($("a.no_pointer_anchor")[0], "cursor"), "pointer");
    
    var els = {
      zIndex: $(".zindex-auto")[0],
      clipButton: $("#d_clip_button")[0],
      bigBorder: $(".big-border")[0]
    };

    // evergreen browsers: `window.getComputedStyle(el, null)`
    test.equal(_utils._getStyle(els.zIndex, "z-index"), "auto");  
    test.equal(_utils._getStyle(els.clipButton, "border-left-width"), 0);
    test.equal(_utils._getStyle(els.bigBorder, "border-left-width"), 0);

    // oldIE (IE8-), doesn't exist in jsdom: `el.currentStyle`
    test.equal(typeof els.zIndex.currentStyle, "undefined");
    test.equal(els.zIndex.currentStyle, null);
    
    // Plain ole `el.style`
    var tmp = window.getComputedStyle;
    try {
      window.getComputedStyle = undefined;
      test.equal(_utils._getStyle(els.zIndex, "z-index"), "auto");
      test.equal(_utils._getStyle(els.clipButton, "border-left-width"), 0);
      test.equal(_utils._getStyle(els.bigBorder, "border-left-width"), 0);
    }
    catch (e) {
      test.ok(false, "An error occurred: " + e);    
    }
    finally {
      window.getComputedStyle = tmp;
    }
    
    test.done();
  },

  "_removeClass removes classes from element": function (test) {
    test.expect(5);
    var div = $("<div>").addClass("class-1 class-2 class_3")[0];

    _utils._removeClass(div, "class-1");
    test.equal(div.className, "class-2 class_3");

    _utils._removeClass(div, "classd");
    test.equal(div.className, "class-2 class_3");

    _utils._removeClass(div, "class-2");
    test.equal(div.className, "class_3");

    _utils._removeClass(div, "class_3");
    test.equal(div.className, "");

    _utils._removeClass(div, "class-3");
    test.equal(div.className, "");

    test.done();
  },

  "_removeClass doesn't remove partial class names": function (test) {
    test.expect(3);
    var div = $("<div>").addClass("class-1 class-2 class_3")[0];

    _utils._removeClass(div, "ass");
    test.equal(div.className, "class-1 class-2 class_3");

    _utils._removeClass(div, "-");
    test.equal(div.className, "class-1 class-2 class_3");

    _utils._removeClass(div, " ");
    test.equal(div.className, "class-1 class-2 class_3");

    test.done();
  },

  "_addClass adds a class name": function (test) {
    test.expect(4);
    var div = $("<div>")[0];

    _utils._addClass(div, "class-1");
    test.equal(div.className, "class-1");

    _utils._addClass(div, "class-2");
    test.equal(div.className, "class-1 class-2");

    _utils._addClass(div, "class-3");
    test.equal(div.className, "class-1 class-2 class-3");

    _utils._addClass(div, "class-3");
    test.equal(div.className, "class-1 class-2 class-3");

    test.done();
  },

  "elements with addClass already use the function": function (test) {
    test.expect(1);
    var div = $("<div>");

    _utils._addClass(div, "class-1");
    test.equal(div[0].className, "class-1");

    test.done();
  },

  "elements with removeClass already use the function": function (test) {
    test.expect(2);
    var div = $("<div>").addClass("class-1");

    test.equal(div[0].className, "class-1");

    _utils._removeClass(div, "class-1");
    test.equal(div[0].className, "");

    test.done();
  },

  "when object borderWidth isNaN don't fail": function (test) {
    test.expect(4);
    clip.glue($("#d_clip_button"));

    clip.setCurrent($("#d_clip_button")[0]);

    test.equal(clip.htmlBridge.style.top, "0px");
    test.equal(clip.htmlBridge.style.left, "0px");
    test.equal(clip.htmlBridge.style.width, "0px");
    test.equal(clip.htmlBridge.style.height, "0px");

    test.done();
  },

  "_vars builds flashvars": function (test) {
    test.expect(5);
    
    test.strictEqual(_utils._vars(clip.options), "");

    clip.options.trustedDomains = ["*"];
    test.strictEqual(_utils._vars(clip.options), "trustedDomain=*");
    
    clip.options.trustedDomains = null;
    clip.options.amdModuleId = "zcAMD";
    test.strictEqual(_utils._vars(clip.options), "amdModuleId=zcAMD");
    
    clip.options.amdModuleId = null;
    clip.options.cjsModuleId = "zcCJS";
    test.strictEqual(_utils._vars(clip.options), "cjsModuleId=zcCJS");
    
    clip.options.trustedDomains = ["*"];
    clip.options.amdModuleId = "zcAMD";
    clip.options.cjsModuleId = "zcCJS";
    test.strictEqual(_utils._vars(clip.options), "trustedDomain=*&amdModuleId=zcAMD&cjsModuleId=zcCJS");

    test.done();
  },

  "_noCache adds cache properly": function (test) {
    test.expect(2);
    test.equal(_utils._noCache("path.com/z.swf").indexOf("?nocache="), 0);

    test.equal(_utils._noCache("path.com/z.swf?q=jon").indexOf("&nocache="), 0);

    test.done();
  },

  "_noCache can be turned off.": function (test) {
    test.expect(2);
    clip.options.useNoCache = false;

    test.equal(_utils._noCache("path.com/z.swf").indexOf("?nocache="), -1);

    test.equal(_utils._noCache("path.com/z.swf?q=jon").indexOf("&nocache="), -1);

    test.done();
  },

  "_inArray finds elements in array": function (test) {
    test.expect(3);
    var fruits = ["apple", "banana", "orange", "cherry", "strawberry"];

    test.equal(_utils._inArray("kiwi", fruits), -1);
    test.equal(_utils._inArray("banana", fruits), 1);
    test.equal(_utils._inArray("strawberry", fruits), 4);

    test.done();
  },

  "_dispatchCallback = function (func, element, instance, args, async) {": function (test) {
    test.expect(6);
    
    var async = false;
    var proof = false;
    var proveIt = function() {
      proof = true;
      
      if (async) {
        test.strictEqual(proof, true);
        
        process.nextTick(function() {
          test.strictEqual(proof, true);
          test.done();
        });
      }
    };
    
    test.strictEqual(proof, false);
    _utils._dispatchCallback(proveIt, null, null, null, async);
    test.strictEqual(proof, true);
    
    async = true;
    proof = false;
    test.strictEqual(proof, false);
    _utils._dispatchCallback(proveIt, null, null, null, async);
    test.strictEqual(proof, false);
  }

};
