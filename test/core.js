/*global ZeroClipboard, _globalConfig:true, _clipData, _objectKeys, _deleteOwnProperties */

(function(module, test) {
  "use strict";

  var originalConfig;

  module("core", {
    setup: function() {
      originalConfig = ZeroClipboard.config();
    },
    teardown: function() {
      _globalConfig = originalConfig;
      _deleteOwnProperties(_clipData);
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


  test("`state` produces expected result", function(assert) {
    assert.expect(8);

    // Act
    var result = ZeroClipboard.state();

    // Assert
    assert.deepEqual(_objectKeys(result), ["browser", "flash", "zeroclipboard"], "Has all expected keys");
    assert.strictEqual(typeof result.browser, "object", ".browser is an object");
    assert.notStrictEqual(result.browser, null, ".browser is a non-null object");
    assert.strictEqual(typeof result.flash, "object", ".flash is an object");
    assert.notStrictEqual(result.flash, null, ".flash is a non-null object");
    assert.strictEqual(typeof result.zeroclipboard, "object", ".zeroclipboard is an object");
    assert.notStrictEqual(result.zeroclipboard, null, ".zeroclipboard is a non-null object");
    assert.deepEqual(_objectKeys(result.zeroclipboard), ["version", "config"], ".zeroclipboard has all expected keys");
  });


  test("`setData` works", function(assert) {
    assert.expect(4);

    // Assert, Act, repeat ad nauseam
    assert.deepEqual(_clipData, {}, "`_clipData` is empty");

    ZeroClipboard.setData("text/plain", "zc4evar");
    assert.deepEqual(_clipData, { "text/plain": "zc4evar" }, "`_clipData` contains expected text");

    ZeroClipboard.setData("text/x-markdown", "**ZeroClipboard**");
    assert.deepEqual(_clipData, { "text/plain": "zc4evar", "text/x-markdown": "**ZeroClipboard**" }, "`_clipData` contains expected text and custom format");

    ZeroClipboard.setData({ "text/html": "<b>Win</b>" });
    assert.deepEqual(_clipData, { "text/html": "<b>Win</b>" }, "`_clipData` contains expected HTML and cleared out old data because an object was passed in");
  });


  test("`clearData` works", function(assert) {
    assert.expect(4);

    // Assert
    assert.deepEqual(_clipData, {}, "`_clipData` is empty");

    // Arrange & Assert
    _clipData["text/plain"] = "zc4evar";
    _clipData["text/html"] = "<b>Win</b>";
    _clipData["text/x-markdown"] = "**ZeroClipboard**";
    assert.deepEqual(_clipData, {
      "text/plain": "zc4evar",
      "text/html": "<b>Win</b>",
      "text/x-markdown": "**ZeroClipboard**"
    }, "`_clipData` contains all expected data");

    // Act & Assert
    ZeroClipboard.clearData("text/html");
    assert.deepEqual(_clipData, {
      "text/plain": "zc4evar",
      "text/x-markdown": "**ZeroClipboard**"
    }, "`_clipData` had 'text/html' successfully removed");

    // Act & Assert
    ZeroClipboard.clearData();
    assert.deepEqual(_clipData, {}, "`_clipData` had all data successfully removed");
  });

})(QUnit.module, QUnit.test);