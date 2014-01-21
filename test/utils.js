/*global _camelizeCssPropName, _getStyle, _removeClass, _addClass, _vars, _cacheBust, _inArray, _dispatchCallback, _extend, _extractDomain, _determineScriptAccess, _objectKeys, _deleteOwnProperties */

"use strict";

(function(module, test) {

  module("utils.js");

  test("`_camelizeCssPropName` converts CSS property names", function(assert) {
    assert.expect(3);

    // Arrange -> N/A

    // Act -> N/A

    // Assert
    assert.strictEqual(_camelizeCssPropName("z-index"), "zIndex");
    assert.strictEqual(_camelizeCssPropName("border-left-width"), "borderLeftWidth");
    assert.strictEqual(_camelizeCssPropName("cursor"), "cursor");
  });


  test("`_getStyle` returns computed styles", function(assert) {
    assert.expect(5);

    // Arrange
    var pointerEl    = $("a.no_cursor_style")[0];
    var nonPointerEl = $("a.no_pointer_anchor")[0];
    var zIndexAutoEl = $(".zindex-auto")[0];
    var clipButtonEl = $("#d_clip_button")[0];
    var bigBorderEl  = $(".big-border")[0];

    // Act
    var pointerElComputedCursor = _getStyle(pointerEl, "cursor");
    var nonPointerElComputedCursor = _getStyle(nonPointerEl, "cursor");
    var zIndexAutoElComputedZIndex = _getStyle(zIndexAutoEl, "z-index");
    var clipButtonElComputedBorderLeftWidth = _getStyle(clipButtonEl, "border-left-width");
    var bigBorderElComputedBorderLeftWith = _getStyle(bigBorderEl, "border-left-width");

    // Assert
    assert.strictEqual(pointerElComputedCursor, "pointer");
    assert.notStrictEqual(nonPointerElComputedCursor, "pointer");
    // Returns 0 in IE7, "auto" everywhere else
    assert.strictEqual(/^(?:auto|0)$/.test(zIndexAutoElComputedZIndex), true);
    // This varies between "0px" and "3px" depending on the browser (WAT?)
    assert.strictEqual(/^[0-3]px$/.test(clipButtonElComputedBorderLeftWidth), true);
    assert.strictEqual(bigBorderElComputedBorderLeftWith, "10px");
  });


  test("`_removeClass` removes classes from element", function(assert) {
    assert.expect(5);

    // Arrange
    var div = $("<div></div>").addClass("class1 class-2 class_3")[0];

    // Act & Assert
    _removeClass(div, "class1");
    assert.strictEqual(div.className, "class-2 class_3");

    _removeClass(div, "classd");
    assert.strictEqual(div.className, "class-2 class_3");

    _removeClass(div, "class-2");
    assert.strictEqual(div.className, "class_3");

    _removeClass(div, "class_3");
    assert.strictEqual(div.className, "");

    _removeClass(div, "class-3");
    assert.strictEqual(div.className, "");
    
    div = null;
  });


  test("`_removeClass` doesn't remove partial class names", function(assert) {
    assert.expect(3);

    // Arrange
    var div = $("<div></div>").addClass("class1 class-2 class_3")[0];

    // Act & Assert
    _removeClass(div, "ass");
    assert.strictEqual(div.className, "class1 class-2 class_3");

    _removeClass(div, "-2");
    assert.strictEqual(div.className, "class1 class-2 class_3");

    _removeClass(div, "_3");
    assert.strictEqual(div.className, "class1 class-2 class_3");

    div = null;
  });


  test("`_addClass` adds a class name", function(assert) {
    assert.expect(4);

    // Arrange
    var div = $("<div></div>")[0];

    // Act & Assert
    _addClass(div, "class1");
    assert.strictEqual(div.className, "class1");

    _addClass(div, "class-2");
    assert.strictEqual(div.className, "class1 class-2");

    _addClass(div, "class_3");
    assert.strictEqual(div.className, "class1 class-2 class_3");

    _addClass(div, "class_3");
    assert.strictEqual(div.className, "class1 class-2 class_3");

    div = null;
  });


  test("`_vars` builds FlashVars", function(assert) {
    assert.expect(5);

    // Arrange
    var clipOptionsEmpty = {};
    var clipOptionsTrustedDomainsOnly = {
      trustedDomains: ["*"]
    };
    var clipOptionsAmdOnly = {
      jsModuleId: "zcAMD"
    };
    var clipOptionsCommonJsOnly = {
      jsModuleId: "zcCJS"
    };
    var clipOptionsAll = {
      trustedDomains: ["*"],
      jsModuleId: "zcAMD"
    };

    // Act & Assert
    assert.strictEqual(_vars(clipOptionsEmpty), "");
    assert.strictEqual(_vars(clipOptionsTrustedDomainsOnly), "trustedOrigins=*");
    assert.strictEqual(_vars(clipOptionsAmdOnly), "jsModuleId=zcAMD");
    assert.strictEqual(_vars(clipOptionsCommonJsOnly), "jsModuleId=zcCJS");
    assert.strictEqual(_vars(clipOptionsAll), "trustedOrigins=*&jsModuleId=zcAMD");
  });


  test("`_cacheBust` adds cache-buster appropriately", function(assert) {
    assert.expect(2);

    // Arrange
    var pathWithoutQuery = "path.com/z.swf";
    var pathWithQuery = "path.com/z.swf?q=jon";

    // Act & Assert
    assert.strictEqual(_cacheBust(pathWithoutQuery).indexOf("?noCache="), 0);
    assert.strictEqual(_cacheBust(pathWithQuery).indexOf("&noCache="), 0);
  });


  test("`_cacheBust` can be disabled", function(assert) {
    assert.expect(6);

    // Arrange
    var pathWithoutQuery = "path.com/z.swf";
    var pathWithQuery = "path.com/z.swf?q=jon";
    var options1 = {
      useNoCache: false,
      cacheBust: true
    };
    var options2 = {
      useNoCache: true,
      cacheBust: false
    };
    var options3 = {
      useNoCache: false,
      cacheBust: false
    };

    // Act & Assert
    assert.strictEqual(_cacheBust(pathWithoutQuery, options1), "");
    assert.strictEqual(_cacheBust(pathWithQuery, options1), "");
    assert.strictEqual(_cacheBust(pathWithoutQuery, options2), "");
    assert.strictEqual(_cacheBust(pathWithQuery, options2), "");
    assert.strictEqual(_cacheBust(pathWithoutQuery, options3), "");
    assert.strictEqual(_cacheBust(pathWithQuery, options3), "");
  });


  test("`_inArray` finds elements in array", function(assert) {
    assert.expect(4);

    // Arrange
    var fruits = ["apple", "banana", "orange", "cherry", "strawberry"];

    // Act & Assert
    assert.strictEqual(_inArray("kiwi", fruits), -1);
    assert.strictEqual(_inArray("BANANA", fruits), -1);
    assert.strictEqual(_inArray("banana", fruits), 1);
    assert.strictEqual(_inArray("strawberry", fruits), 4);
  });


  test("`_dispatchCallback` can fire asynchronously", function(assert) {
    assert.expect(6);

    // Arrange
    var syncExec = false;
    var syncProof = false;
    var syncProveIt = function() {
      syncProof = true;
    };
    var asyncExec = true;
    var asyncProof = false;
    var asyncProveIt = function() {
      // Resume test evaluation
      QUnit.start();

      assert.strictEqual(asyncProof, false);
      asyncProof = true;
      assert.strictEqual(asyncProof, true);
    };

    // Act & Assert
    // Synchronous
    assert.strictEqual(syncProof, false);
    _dispatchCallback(syncProveIt, null, null, syncExec);
    assert.strictEqual(syncProof, true);

    // Asynchronous
    assert.strictEqual(asyncProof, false);
    _dispatchCallback(asyncProveIt, null, null, asyncExec);
    assert.strictEqual(asyncProof, false);

    // Stop test evaluation
    QUnit.stop();
  });


  test("`_extend` works on plain objects", function(assert) {
    assert.expect(5);

    // Plain objects
    var a = {
      "a": "apple",
      "c": "cantalope"
    },
    b = {
      "b": "banana",
      "c": "cherry"  // cuz cantalope sucks  ;)
    },
    c = {
      "a": "apple",
      "b": "banana",
      "c": "cherry"
    };

    assert.deepEqual(_extend({}, a), a, "actual equals expected, `target` is updated, `source` is unaffected");
    assert.deepEqual(_extend({}, b), b, "actual equals expected, `target` is updated, `source` is unaffected");
    assert.deepEqual(_extend({}, c), c, "actual equals expected, `target` is updated, `source` is unaffected");
    assert.deepEqual(_extend(a, b), c, "actual equals expected");
    assert.deepEqual(a, c, "`a` equals `c` because `_extend` updates the `target` argument");
  });


  test("`_extend` only copies owned properties", function(assert) {
    assert.expect(1);

    // Now prototypes...
    var SomeClass = function() {
      this.b = "banana";
    };
    SomeClass.prototype.c = "cantalope";  // cuz cantalope sucks  ;)

    var a = {
      "a": "apple",
      "c": "cherry"
    },
    b = new SomeClass(),
    c = {
      "a": "apple",
      "b": "banana",
      "c": "cherry"
    };

    assert.deepEqual(_extend(a, b), c, "actual equals expected because `_extend` does not copy over prototype properties");
  });


  test("`_extend` only copies owned properties from Array source", function(assert) {
    assert.expect(3);

    var a = {
      "a": "apple",
      "b": "banana"
    },
    b = ["zero", "one", "two"],
    c = {
      "a": "apple",
      "b": "banana",
      "0": "zero",
      "1": "one",
      "2": "two"
    };

    assert.deepEqual(_extend(a, b), c, "actual equals expected because `_extend` does not copy over prototype properties");
    assert.strictEqual("length" in a, false, "`a` should not have gained a `length` property");
    assert.strictEqual("length" in b, true, "`b` should still have a `length` property");
  });


  test("`_extend` will merge multiple objects", function(assert) {
    assert.expect(2);

    var a = {
      "a": "apple",
      "c": "cantalope",
      "d": "dragon fruit"
    },
    b = {
      "b": "banana",
      "c": "cherry"  // cuz cantalope sucks  ;)
    },
    c = {
      "a": "apricot",
      "b": "blueberry"
    },
    d = {
      "a": "apricot",
      "b": "blueberry",
      "c": "cherry",
      "d": "dragon fruit"
    };

    assert.deepEqual(_extend({}, a, b, c), d, "actual equals expected, `target` is updated, `source` is unaffected");
    assert.deepEqual(_extend(a, b, c), d, "actual equals expected");
  });


  test("`_extractDomain` extracts domains from origins and URLs", function(assert) {
    assert.expect(20);

    // Arrange
    var inputToExpectedMap = {
      "": null,
      " ": null,
      "ZeroClipboard.swf": null,
      "js/ZeroClipboard.swf": null,
      "/js/ZeroClipboard.swf": null,
      "/zeroclipboard/zeroclipboard/": null,
      "zeroclipboard/zeroclipboard/": null,
      "*": "*",
      "github.com": "github.com",
      "http://github.com": "github.com",
      "https://github.com": "github.com",
      "github.com:80": "github.com:80",
      "http://github.com:80": "github.com:80",
      "https://github.com:443": "github.com:443",
      "http://github.com/zeroclipboard/zeroclipboard/": "github.com",
      "https://github.com/zeroclipboard/zeroclipboard/": "github.com",
      "http://github.com:80/zeroclipboard/zeroclipboard/": "github.com:80",
      "https://github.com:443/zeroclipboard/zeroclipboard/": "github.com:443"
    };

    // Act & Assert
    assert.strictEqual(_extractDomain(undefined), null, "Processing: `undefined`");
    assert.strictEqual(_extractDomain(null), null, "Processing: `null`");
    for (var originOrUrl in inputToExpectedMap) {
      if (inputToExpectedMap.hasOwnProperty(originOrUrl)) {
        assert.strictEqual(_extractDomain(originOrUrl), inputToExpectedMap[originOrUrl], "Processing: \"" + originOrUrl + "\"");
      }
    }
  });


  test("`_determineScriptAccess` determines the appropriate script access level", function(assert) {
    // Arrange
    var i, len, tmp;
    var currentDomain = window.location.host || "localhost";
    var _globalConfig = {
      moviePath: "ZeroClipboard.swf",
      trustedOrigins: null,
      trustedDomains: [currentDomain],
      allowScriptAccess: null
    };
    var inputToExpectedMap = [
      // `allowScriptAccess` forcibly set
      { args: [currentDomain, _extend({}, _globalConfig, { allowScriptAccess: "always" })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { allowScriptAccess: "ALWAYS" })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { allowScriptAccess: "samedomain" })], result: "sameDomain" },
      { args: [currentDomain, _extend({}, _globalConfig, { allowScriptAccess: "sameDomain" })], result: "sameDomain" },
      { args: [currentDomain, _extend({}, _globalConfig, { allowScriptAccess: "SAMEDOMAIN" })], result: "sameDomain" },
      { args: [currentDomain, _extend({}, _globalConfig, { allowScriptAccess: "never" })], result: "never" },
      { args: [currentDomain, _extend({}, _globalConfig, { allowScriptAccess: "NEVER" })], result: "never" },
      // Same-domain SWF
      { args: [currentDomain, _globalConfig], result: "sameDomain" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedDomains: [] })], result: "never" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedDomains: ["*"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedDomains: [currentDomain, "otherDomain.com"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedDomains: ["otherDomain.com"] })], result: "never" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedDomains: [], trustedOrigins: [] })], result: "never" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedDomains: [], trustedOrigins: ["*"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedDomains: [], trustedOrigins: ["http://" + currentDomain] })], result: "sameDomain" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedDomains: [], trustedOrigins: ["http://" + currentDomain, "http://otherDomain.com"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedDomains: [], trustedOrigins: ["http://otherDomain.com"] })], result: "never" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedOrigins: [] })], result: "sameDomain" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedOrigins: ["*"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedOrigins: ["http://" + currentDomain] })], result: "sameDomain" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedOrigins: ["http://" + currentDomain, "http://otherDomain.com"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { trustedOrigins: ["http://otherDomain.com"] })], result: "always" },
      // Cross-domain SWF
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf" })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedDomains: [] })], result: "never" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedDomains: ["*"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedDomains: [currentDomain, "otherDomain.com"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedDomains: ["otherDomain.com"] })], result: "never" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedDomains: [], trustedOrigins: [] })], result: "never" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedDomains: [], trustedOrigins: ["*"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedDomains: [], trustedOrigins: ["http://" + currentDomain] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedDomains: [], trustedOrigins: ["http://" + currentDomain, "http://otherDomain.com"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedDomains: [], trustedOrigins: ["http://otherDomain.com"] })], result: "never" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedOrigins: [] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedOrigins: ["*"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedOrigins: ["http://" + currentDomain] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedOrigins: ["http://" + currentDomain, "http://otherDomain.com"] })], result: "always" },
      { args: [currentDomain, _extend({}, _globalConfig, { moviePath: "//otherDomain.com/ZeroClipboard.swf", trustedOrigins: ["http://otherDomain.com"] })], result: "always" }
    ];

    // Act & Assert
    assert.expect(inputToExpectedMap.length);
    for (i = 0, len = inputToExpectedMap.length; i < len; i++) {
      tmp = inputToExpectedMap[i];
      assert.strictEqual(_determineScriptAccess.apply(this, tmp.args), tmp.result, "Processing: " + JSON.stringify(tmp));
    }
  });


  test("`_objectKeys` will get all owned enumerable properties", function(assert) {
    assert.expect(6);

    var a = {
      "a": "apple",
      "c": "cantalope",
      "d": "dragon fruit"
    },
    b = {},
    c = ["banana", "cherry"],
    d = (function() {
      function SomePrototype() {
        this.protoProp = "foo";
      }
      function SomeClass() {
        this.ownedProp = "bar";
      }
      SomeClass.prototype = new SomePrototype();
      SomeClass.prototype.constructor = SomeClass;
      
      return new SomeClass();
    })(),
    e = null,
    f; // = undefined;

    assert.deepEqual(_objectKeys(a), ["a", "c", "d"]);
    assert.deepEqual(_objectKeys(b), []);
    assert.deepEqual(_objectKeys(c), ["0", "1"]);
    assert.deepEqual(_objectKeys(d), ["ownedProp"]);
    assert.deepEqual(_objectKeys(e), []);
    assert.deepEqual(_objectKeys(f), []);
  });


  test("`_deleteOwnProperties` will delete all owned enumerable properties", function(assert) {
    assert.expect(24);

    var getProtoKeys = function(obj) {
      var prop,
          keys = [];
      if (obj) {
        for (prop in obj) {
          if (!obj.hasOwnProperty(prop)) {
            keys.push(prop);
          }
        }
      }
      return keys;
    };

    var a = {
      "a": "apple",
      "c": "cantalope",
      "d": "dragon fruit"
    },
    b = {},
    c = ["banana", "cherry"],
    d = (function() {
      function SomePrototype() {
        this.protoProp = "foo";
      }
      function SomeClass() {
        this.ownedProp = "bar";
      }
      SomeClass.prototype = new SomePrototype();
      SomeClass.prototype.constructor = SomeClass;
      
      return new SomeClass();
    })(),
    e = null,
    f; // = undefined;

    assert.deepEqual(_objectKeys(a), ["a", "c", "d"]);
    assert.deepEqual(getProtoKeys(a), []);
    _deleteOwnProperties(a);
    assert.deepEqual(_objectKeys(a), []);
    assert.deepEqual(getProtoKeys(a), []);
    
    assert.deepEqual(_objectKeys(b), []);
    assert.deepEqual(getProtoKeys(b), []);
    _deleteOwnProperties(b);
    assert.deepEqual(_objectKeys(b), []);
    assert.deepEqual(getProtoKeys(b), []);

    assert.deepEqual(_objectKeys(c), ["0", "1"]);
    assert.deepEqual(getProtoKeys(c), []);
    _deleteOwnProperties(c);
    assert.deepEqual(_objectKeys(c), []);
    assert.deepEqual(getProtoKeys(c), []);

    assert.deepEqual(_objectKeys(d), ["ownedProp"]);
    assert.deepEqual(getProtoKeys(d), ["protoProp", "constructor"]);
    _deleteOwnProperties(d);
    assert.deepEqual(_objectKeys(d), []);
    assert.deepEqual(getProtoKeys(d), ["protoProp", "constructor"]);

    assert.deepEqual(_objectKeys(e), []);
    assert.deepEqual(getProtoKeys(e), []);
    _deleteOwnProperties(e);
    assert.deepEqual(_objectKeys(e), []);
    assert.deepEqual(getProtoKeys(e), []);

    assert.deepEqual(_objectKeys(f), []);
    assert.deepEqual(getProtoKeys(f), []);
    _deleteOwnProperties(f);
    assert.deepEqual(_objectKeys(f), []);
    assert.deepEqual(getProtoKeys(f), []);
  });

})(QUnit.module, QUnit.test);
