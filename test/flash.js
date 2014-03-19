/*global flashState, _detectFlashSupport */

"use strict";

(function(module, test) {

  var mimeType, ax;

  module("flash", {
    setup: function() {
      mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
      ax = window.ActiveXObject;
    },
    teardown: function() {
      window.navigator.mimeTypes["application/x-shockwave-flash"] = mimeType;
      window.ActiveXObject = ax;
    }
  });

  test("Detecting no Flash", function(assert) {
    assert.expect(1);

    // Arrange
    window.navigator.mimeTypes["application/x-shockwave-flash"] = undefined;
    window.ActiveXObject = undefined;

    // Act
    _detectFlashSupport();

    // Assert
    assert.strictEqual(flashState.disabled, true);
  });

  test("Detecting has Flash mimetype", function(assert) {
    assert.expect(1);

    // Arrange
    window.navigator.mimeTypes["application/x-shockwave-flash"] = {};
    window.ActiveXObject = function() { };

    // Act
    _detectFlashSupport();

    // Assert
    assert.strictEqual(flashState.disabled, false);
  });

})(QUnit.module, QUnit.test);