/*globals _camelizeCssPropName, _getStyle, _removeClass, _addClass, _vars, _noCache, _inArray, _dispatchCallback */

"use strict";

(function(module, test, expect) {

  module("utils.js");

  test("`_camelizeCssPropName` converts CSS property names", function(assert) {
    (assert.expect || expect)(3);

    // Arrange -> N/A

    // Act -> N/A

    // Assert
    assert.strictEqual(_camelizeCssPropName("z-index"), "zIndex");
    assert.strictEqual(_camelizeCssPropName("border-left-width"), "borderLeftWidth");
    assert.strictEqual(_camelizeCssPropName("cursor"), "cursor");
  });


  test("`_getStyle` returns computed styles", function(assert) {
    (assert.expect || expect)(5);

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
    assert.strictEqual(zIndexAutoElComputedZIndex, "auto");
    assert.strictEqual(clipButtonElComputedBorderLeftWidth, "0px");
    assert.strictEqual(bigBorderElComputedBorderLeftWith, "10px");
  });


  test("`_removeClass` removes classes from element", function(assert) {
    (assert.expect || expect)(5);

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
    (assert.expect || expect)(3);

    // Arrange
    var div = $("<div></div>").addClass("class1 class-2 class_3")[0];

    // Act & Assert
    _removeClass(div, "ass");
    assert.strictEqual(div.className, "class1 class-2 class_3");

    _removeClass(div, "-");
    assert.strictEqual(div.className, "class1 class-2 class_3");

    _removeClass(div, " ");
    assert.strictEqual(div.className, "class1 class-2 class_3");

    div = null;
  });


  test("`_addClass` adds a class name", function(assert) {
    (assert.expect || expect)(4);

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


  // TODO: Remove this test; see TODO notes in utils.js source
  test("elements with `addClass` already use the function", function(assert) {
    (assert.expect || expect)(2);

    // Arrange
    var $div = $("<div></div>");

    // Act & Assert
    assert.strictEqual($div[0].className, "");
    _addClass($div, "class1");
    assert.strictEqual($div[0].className, "class1");

    $div = null;
  });


  // TODO: Remove this test; see TODO notes in utils.js source
  test("elements with `removeClass` already use the function", function(assert) {
    (assert.expect || expect)(2);

    // Arrange
    var $div = $("<div></div>").addClass("class1");

    // Act & Assert
    assert.strictEqual($div[0].className, "class1");

    _removeClass($div, "class1");
    assert.strictEqual($div[0].className, "");

    $div = null;
  });


  test("`_vars` builds flashvars", function(assert) {
    (assert.expect || expect)(5);

    // Arrange
    var clipOptionsEmpty = {};
    var clipOptionsTrustedOriginsOnly = {
      trustedOrigins: ["*"]
    };
    var clipOptionsAmdOnly = {
      amdModuleId: "zcAMD"
    };
    var clipOptionsCommonJsOnly = {
      cjsModuleId: "zcCJS"
    };
    var clipOptionsAll = {
      trustedOrigins: ["*"],
      amdModuleId: "zcAMD",
      cjsModuleId: "zcCJS"
    };

    // Act & Assert
    assert.strictEqual(_vars(clipOptionsEmpty), "");
    assert.strictEqual(_vars(clipOptionsTrustedOriginsOnly), "trustedOrigins=*");
    assert.strictEqual(_vars(clipOptionsAmdOnly), "amdModuleId=zcAMD");
    assert.strictEqual(_vars(clipOptionsCommonJsOnly), "cjsModuleId=zcCJS");
    assert.strictEqual(_vars(clipOptionsAll), "trustedOrigins=*&amdModuleId=zcAMD&cjsModuleId=zcCJS");
  });


  test("`_noCache` adds cache-buster appropriately", function(assert) {
    (assert.expect || expect)(2);

    // Arrange
    var pathWithoutQuery = "path.com/z.swf";
    var pathWithQuery = "path.com/z.swf?q=jon";

    // Act & Assert
    assert.strictEqual(_noCache(pathWithoutQuery).indexOf("?nocache="), 0);
    assert.strictEqual(_noCache(pathWithQuery).indexOf("&nocache="), 0);
  });


  test("`_noCache` can be disabled", function(assert) {
    (assert.expect || expect)(2);

    // Arrange
    var pathWithoutQuery = "path.com/z.swf";
    var pathWithQuery = "path.com/z.swf?q=jon";
    var options = {
      useNoCache: false
    };

    // Act & Assert
    assert.strictEqual(_noCache(pathWithoutQuery, options), "");
    assert.strictEqual(_noCache(pathWithQuery, options), "");
  });


  test("`_inArray` finds elements in array", function(assert) {
    (assert.expect || expect)(4);

    // Arrange
    var fruits = ["apple", "banana", "orange", "cherry", "strawberry"];

    // Act & Assert
    assert.strictEqual(_inArray("kiwi", fruits), -1);
    assert.strictEqual(_inArray("BANANA", fruits), -1);
    assert.strictEqual(_inArray("banana", fruits), 1);
    assert.strictEqual(_inArray("strawberry", fruits), 4);
  });


  test("`_dispatchCallback` can fire asynchronously", function(assert) {
    (assert.expect || expect)(6);

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
    _dispatchCallback(syncProveIt, null, null, null, syncExec);
    assert.strictEqual(syncProof, true);

    // Asynchronous
    assert.strictEqual(asyncProof, false);
    _dispatchCallback(asyncProveIt, null, null, null, asyncExec);
    assert.strictEqual(asyncProof, false);

    // Stop test evaluation
    QUnit.stop();
  });

})(QUnit.module, QUnit.test, QUnit.expect);
