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


  test("`swfPath` finds the expected default URL", function(assert) {
    assert.expect(1);

    // Assert, act, assert
    var pageUrl = window.location.href.split("#")[0].split("?")[0];
    var protocolIndex = pageUrl.lastIndexOf("//");
    var protocol = pageUrl.slice(0, protocolIndex + 2);
    var rootDir = protocol + pageUrl.slice(protocolIndex + 2).split("/").slice(0, -2).join("/") + "/";
    //var stateJsUrl = rootDir + "src/javascript/ZeroClipboard/state.js";
    var swfPathBasedOnStateJsPath = rootDir + "src/javascript/ZeroClipboard/ZeroClipboard.swf";

    // Test that the client has the expected default URL [even if it's not correct]
    assert.strictEqual(ZeroClipboard.config("swfPath"), swfPathBasedOnStateJsPath);
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

})(QUnit.module, QUnit.test);