/*global ZeroClipboard, _defaults */

"use strict";

(function(module, test) {

  var mimeType, ax, originalMoviePath;

  module("core", {
    setup: function() {
      mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
      ax = window.ActiveXObject;
      originalMoviePath = _defaults.moviePath;
    },
    teardown: function() {
      window.navigator.mimeTypes["application/x-shockwave-flash"] = mimeType;
      window.ActiveXObject = ax;
      ZeroClipboard.setDefaults({
        moviePath: originalMoviePath
      });
    }
  });

  test("Changing movie path works", function(assert) {
    assert.expect(2);

    // Arrange
    var clip = new ZeroClipboard();

    // Assert, act, assert

    // Test that the client has the default path
    assert.strictEqual(clip.options.moviePath, "ZeroClipboard.swf");
    // Change the path
    clip.options.moviePath = "new/movie/path.swf";
    // Test that the client has the changed path
    assert.strictEqual(clip.options.moviePath, "new/movie/path.swf");
  });

  test("Set trusted origins", function(assert) {
    assert.expect(2);

    // Arrange
    var clip = new ZeroClipboard();

    // Assert, act, assert
    // Test that trustedOrigins is `null`/`undefined`
    assert.equal(clip.options.trustedOrigins, null);
    // Change the value
    clip.options.trustedOrigins = "google.com";
    // Test that trustedOrigins is now defined as the new value
    assert.strictEqual(clip.options.trustedOrigins, "google.com");
  });

  test("Detecting no Flash", function(assert) {
    assert.expect(1);

    // Arrange
    window.navigator.mimeTypes["application/x-shockwave-flash"] = undefined;
    window.ActiveXObject = undefined;

    // Act & Assert
    assert.strictEqual(ZeroClipboard.detectFlashSupport(), false);
  });

  test("Detecting has Flash mimetype", function(assert) {
    assert.expect(1);

    // Arrange
    window.navigator.mimeTypes["application/x-shockwave-flash"] = {};
    window.ActiveXObject = function() { };

    // Act & Assert
    assert.strictEqual(ZeroClipboard.detectFlashSupport(), true);
  });

  test("Setting default options", function(assert) {
    assert.expect(4);

    // Arrange
    var newPath = "the/path";
    var scriptAccess = "always";

    // Assert
    var clip = new ZeroClipboard();
    assert.notEqual(clip.options.moviePath, newPath);
    assert.notEqual(clip.options.allowScriptAccess, scriptAccess);

    // Act
    ZeroClipboard.setDefaults({
      moviePath: newPath,
      allowScriptAccess: scriptAccess
    });

    // Assert
    clip = new ZeroClipboard();
    assert.strictEqual(clip.options.moviePath, newPath);
    assert.strictEqual(clip.options.allowScriptAccess, scriptAccess);
  });

})(QUnit.module, QUnit.test);