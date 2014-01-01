/*global ZeroClipboard, _globalConfig:true */

"use strict";

(function(module, test) {

  var originalConfig;

  module("core", {
    setup: function() {
      originalConfig = ZeroClipboard.config();
    },
    teardown: function() {
      _globalConfig = originalConfig;
    }
  });


  test("Changing `moviePath` works", function(assert) {
    assert.expect(5);

    // Assert, act, assert

    // Test that the client has the default path
    assert.strictEqual(ZeroClipboard.config("moviePath"), "ZeroClipboard.swf");
    assert.strictEqual(ZeroClipboard.config().moviePath, "ZeroClipboard.swf");
    // Change the path
    var updatedConfig = ZeroClipboard.config({ moviePath: "new/movie/path.swf" });
    // Test that the client has the changed path
    assert.strictEqual(updatedConfig.moviePath, "new/movie/path.swf");
    assert.strictEqual(ZeroClipboard.config("moviePath"), "new/movie/path.swf");
    assert.strictEqual(ZeroClipboard.config().moviePath, "new/movie/path.swf");
  });


  test("Changing `trustedDomains` works", function(assert) {
    assert.expect(5);

    // Arrange
    var currentHost = window.location.host;
    var originalValue = currentHost ? [currentHost] : [];
    var updatedValue = currentHost ? [currentHost, "otherDomain.com"] : ["otherDomain.com"];

    // Assert, act, assert
    // Test that the client has the default value
    assert.deepEqual(ZeroClipboard.config("trustedDomains"), originalValue);
    assert.deepEqual(ZeroClipboard.config().trustedDomains, originalValue);
    // Change the value
    var updatedConfig = ZeroClipboard.config({ trustedDomains: updatedValue });
    // Test that the client has the changed value
    assert.deepEqual(updatedConfig.trustedDomains, updatedValue);
    assert.deepEqual(ZeroClipboard.config("trustedDomains"), updatedValue);
    assert.deepEqual(ZeroClipboard.config().trustedDomains, updatedValue);
  });


  /** @deprecated */
  module("core - deprecated", {
    setup: function() {
      originalConfig = ZeroClipboard.config();
      ZeroClipboard.config({ debug: false });
    },
    teardown: function() {
      _globalConfig = originalConfig;
    }
  });


  /** @deprecated */
  test("Changing `trustedOrigins` works", function(assert) {
    assert.expect(5);

    // Arrange
    var currentHost = window.location.host || "localhost";
    var originalValue = null;
    var updatedValue = [currentHost, "otherDomain.com"];

    // Assert, act, assert
    // Test that the client has the default value
    assert.equal(ZeroClipboard.config("trustedOrigins"), originalValue);
    assert.equal(ZeroClipboard.config().trustedOrigins, originalValue);
    // Change the value
    var updatedConfig = ZeroClipboard.config({ trustedOrigins: updatedValue });
    // Test that the client has the changed value
    assert.deepEqual(updatedConfig.trustedOrigins, updatedValue);
    assert.deepEqual(ZeroClipboard.config("trustedOrigins"), updatedValue);
    assert.deepEqual(ZeroClipboard.config().trustedOrigins, updatedValue);
  });


  /** @deprecated */
  test("Setting default options", function(assert) {
    assert.expect(4);

    // Arrange
    var newPath = "the/path";
    var scriptAccess = "always";
    var clip = new ZeroClipboard();

    // Assert
    assert.notEqual(clip.options.moviePath, newPath);
    assert.notEqual(clip.options.allowScriptAccess, scriptAccess);

    // Act
    ZeroClipboard.config({
      moviePath: newPath,
      allowScriptAccess: scriptAccess
    });

    // Assert
    clip = new ZeroClipboard();
    assert.strictEqual(clip.options.moviePath, newPath);
    assert.strictEqual(clip.options.allowScriptAccess, scriptAccess);
  });

})(QUnit.module, QUnit.test);